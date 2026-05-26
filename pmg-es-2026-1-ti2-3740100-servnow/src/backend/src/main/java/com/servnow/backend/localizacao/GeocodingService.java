package com.servnow.backend.localizacao;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.servnow.backend.solicitacao.domain.SolicitacaoServico;
import com.servnow.backend.usuario.domain.Usuario;

@Service
public class GeocodingService {

    private static final Logger log = LoggerFactory.getLogger(GeocodingService.class);
    private static final String NOMINATIM_SEARCH = "https://nominatim.openstreetmap.org/search";
    private static final String USER_AGENT = "ServNow/1.0 (academic; contact: dev@servnow.local)";
    private static final long MIN_INTERVAL_MS = 1_100L;
    private static final long RATE_LIMIT_COOLDOWN_MS = 60_000L;
    private static final int MAX_RETRIES = 2;

    private final CepGeocodingService cepGeocodingService;
    private final RestClient nominatimClient;
    private final ConcurrentHashMap<String, Optional<GeoCoordinates>> nominatimCache = new ConcurrentHashMap<>();
    private final Object rateLimitLock = new Object();
    private volatile long lastNominatimRequestMs;
    private volatile long nominatimBlockedUntilMs;

    public GeocodingService(CepGeocodingService cepGeocodingService) {
        this.cepGeocodingService = cepGeocodingService;
        this.nominatimClient = RestClient.builder()
            .defaultHeader("User-Agent", USER_AGENT)
            .defaultHeader("Accept", "application/json")
            .build();
    }

    public Optional<GeoCoordinates> geocode(SolicitacaoServico solicitacao) {
        return geocodePorCep(solicitacao.getCep(), solicitacao.getCidade(), solicitacao.getEstado())
            .or(() -> geocodeEnderecoCompleto(
                solicitacao.getRua(),
                solicitacao.getNumero(),
                solicitacao.getComplemento(),
                solicitacao.getBairro(),
                solicitacao.getCidade(),
                solicitacao.getEstado(),
                solicitacao.getCep()
            ));
    }

    public Optional<GeoCoordinates> geocode(Usuario usuario) {
        return geocodePorCep(usuario.getCep(), usuario.getCidade(), usuario.getEstado())
            .or(() -> geocodeEnderecoCompleto(
                usuario.getRua(),
                usuario.getNumero(),
                usuario.getComplemento(),
                usuario.getBairro(),
                usuario.getCidade(),
                usuario.getEstado(),
                usuario.getCep()
            ));
    }

    private Optional<GeoCoordinates> geocodePorCep(String cep, String cidade, String estado) {
        if (cep == null || cep.isBlank()) {
            return Optional.empty();
        }
        if (!cepGeocodingService.cepCompativelComEndereco(cep, cidade, estado)) {
            log.warn(
                "CEP {} nao corresponde a cidade/UF informadas ({} / {}). Usando geocodificacao por endereco.",
                cep,
                cidade,
                estado
            );
            return Optional.empty();
        }
        return cepGeocodingService.buscarCoordenadas(cep);
    }

    private Optional<GeoCoordinates> geocodeEnderecoCompleto(
        String rua,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String estado,
        String cep
    ) {
        String query = montarConsulta(rua, numero, complemento, bairro, cidade, estado, cep);
        if (query.isBlank()) {
            return Optional.empty();
        }
        return geocodeViaNominatim(query);
    }

    private Optional<GeoCoordinates> geocodeViaNominatim(String query) {
        if (query == null || query.isBlank()) {
            return Optional.empty();
        }

        String cacheKey = query.trim().toLowerCase();
        Optional<GeoCoordinates> cached = nominatimCache.get(cacheKey);
        if (cached != null) {
            return cached;
        }

        if (System.currentTimeMillis() < nominatimBlockedUntilMs) {
            log.debug("Nominatim em pausa por limite de taxa; consulta adiada: {}", query);
            return Optional.empty();
        }

        Optional<GeoCoordinates> result = executarNominatimComRetentativa(query);
        nominatimCache.put(cacheKey, result);
        return result;
    }

    private Optional<GeoCoordinates> executarNominatimComRetentativa(String query) {
        for (int tentativa = 0; tentativa <= MAX_RETRIES; tentativa++) {
            try {
                return Optional.ofNullable(buscarCoordenadasNominatim(query));
            } catch (RateLimitExceededException ex) {
                if (tentativa == MAX_RETRIES) {
                    log.warn("Limite de taxa do Nominatim atingido para '{}'.", query);
                    return Optional.empty();
                }
                aguardarRetentativa(tentativa);
            } catch (RestClientException | NumberFormatException ex) {
                log.warn("Falha ao geocodificar endereco '{}': {}", query, ex.getMessage());
                return Optional.empty();
            }
        }
        return Optional.empty();
    }

    private GeoCoordinates buscarCoordenadasNominatim(String query) {
        awaitNominatimRateLimit();

        String encoded = URLEncoder.encode(query.trim(), StandardCharsets.UTF_8);
        URI uri = URI.create(
            NOMINATIM_SEARCH + "?format=json&limit=1&countrycodes=br&q=" + encoded
        );

        List<NominatimResult> results;
        try {
            results = nominatimClient.get()
                .uri(uri)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
        } catch (HttpClientErrorException.TooManyRequests ex) {
            nominatimBlockedUntilMs = System.currentTimeMillis() + RATE_LIMIT_COOLDOWN_MS;
            throw new RateLimitExceededException();
        } catch (HttpClientErrorException ex) {
            if (ex.getStatusCode().value() == 429) {
                nominatimBlockedUntilMs = System.currentTimeMillis() + RATE_LIMIT_COOLDOWN_MS;
                throw new RateLimitExceededException();
            }
            throw ex;
        }

        if (results == null || results.isEmpty()) {
            log.debug("Nominatim sem resultado para: {}", query);
            return null;
        }

        NominatimResult first = results.getFirst();
        if (first.lat == null || first.lon == null) {
            return null;
        }

        double lat = Double.parseDouble(first.lat);
        double lon = Double.parseDouble(first.lon);
        return new GeoCoordinates(lat, lon);
    }

    private void awaitNominatimRateLimit() {
        synchronized (rateLimitLock) {
            long elapsed = System.currentTimeMillis() - lastNominatimRequestMs;
            long waitMs = MIN_INTERVAL_MS - elapsed;
            if (waitMs > 0) {
                try {
                    Thread.sleep(waitMs);
                } catch (InterruptedException ex) {
                    Thread.currentThread().interrupt();
                }
            }
            lastNominatimRequestMs = System.currentTimeMillis();
        }
    }

    private void aguardarRetentativa(int tentativa) {
        long backoffMs = MIN_INTERVAL_MS * (tentativa + 2L);
        try {
            Thread.sleep(backoffMs);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
        }
    }

    private String montarConsulta(
        String rua,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String estado,
        String cep
    ) {
        if (rua == null || numero == null || bairro == null || cidade == null || estado == null || cep == null) {
            return "";
        }
        String complementoTexto = complemento == null || complemento.isBlank() ? "" : ", " + complemento;
        return "%s, %s%s, %s, %s, %s, Brasil, %s".formatted(
            rua,
            numero,
            complementoTexto,
            bairro,
            cidade,
            estado,
            cep
        );
    }

    private static class NominatimResult {
        public String lat;
        public String lon;
    }

    private static class RateLimitExceededException extends RuntimeException {
    }
}
