package com.servnow.backend.localizacao;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
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

    /**
     * Geocodificacao pelo endereco completo (rua, numero, bairro). Mais precisa que usar apenas o CEP.
     */
    public Optional<GeoCoordinates> geocodePreciso(SolicitacaoServico solicitacao) {
        return geocodeEnderecoPreciso(
            solicitacao.getRua(),
            solicitacao.getNumero(),
            solicitacao.getComplemento(),
            solicitacao.getBairro(),
            solicitacao.getCidade(),
            solicitacao.getEstado(),
            solicitacao.getCep()
        );
    }

    public Optional<GeoCoordinates> geocodePreciso(Usuario usuario) {
        return geocodeEnderecoPreciso(
            usuario.getRua(),
            usuario.getNumero(),
            usuario.getComplemento(),
            usuario.getBairro(),
            usuario.getCidade(),
            usuario.getEstado(),
            usuario.getCep()
        );
    }

    public Optional<GeoCoordinates> geocode(SolicitacaoServico solicitacao) {
        return geocodePreciso(solicitacao)
            .or(() -> geocodePorCep(solicitacao.getCep(), solicitacao.getCidade(), solicitacao.getEstado()))
            .or(() -> geocodePorCepAproximado(solicitacao.getCep()))
            .or(() -> geocodePorLocalidade(
                solicitacao.getBairro(),
                solicitacao.getCidade(),
                solicitacao.getEstado(),
                solicitacao.getCep()
            ));
    }

    public Optional<GeoCoordinates> geocode(Usuario usuario) {
        return geocodePreciso(usuario)
            .or(() -> geocodePorCep(usuario.getCep(), usuario.getCidade(), usuario.getEstado()))
            .or(() -> geocodePorCepAproximado(usuario.getCep()))
            .or(() -> geocodePorLocalidade(
                usuario.getBairro(),
                usuario.getCidade(),
                usuario.getEstado(),
                usuario.getCep()
            ));
    }

    private Optional<GeoCoordinates> geocodeEnderecoPreciso(
        String rua,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String estado,
        String cep
    ) {
        return geocodeEnderecoEstruturado(rua, numero, bairro, cidade, estado, cep)
            .or(() -> geocodeEnderecoCompleto(rua, numero, complemento, bairro, cidade, estado, cep));
    }

    private Optional<GeoCoordinates> geocodeEnderecoEstruturado(
        String rua,
        String numero,
        String bairro,
        String cidade,
        String estado,
        String cep
    ) {
        if (rua == null || rua.isBlank() || numero == null || numero.isBlank()
            || cidade == null || cidade.isBlank() || estado == null || estado.isBlank()) {
            return Optional.empty();
        }

        String street = rua.trim() + ", " + numero.trim();
        StringBuilder path = new StringBuilder(NOMINATIM_SEARCH)
            .append("?format=json&limit=1&countrycodes=br")
            .append("&street=").append(URLEncoder.encode(street, StandardCharsets.UTF_8))
            .append("&city=").append(URLEncoder.encode(cidade.trim(), StandardCharsets.UTF_8))
            .append("&state=").append(URLEncoder.encode(estado.trim(), StandardCharsets.UTF_8));

        if (bairro != null && !bairro.isBlank()) {
            path.append("&suburb=").append(URLEncoder.encode(bairro.trim(), StandardCharsets.UTF_8));
        }

        String cepFormatado = formatarCepConsulta(cep);
        if (!cepFormatado.isBlank()) {
            path.append("&postalcode=").append(URLEncoder.encode(cepFormatado, StandardCharsets.UTF_8));
        }

        String cacheKey = "structured:" + path.toString().toLowerCase();
        return geocodeViaNominatimUri(URI.create(path.toString()), cacheKey);
    }

    /**
     * Coordenadas pelo CEP (sem validar cidade/UF) e, se a Brasil API nao trouxer lat/long,
     * consulta o Nominatim com bairro/cidade/UF retornados pelo CEP.
     */
    private Optional<GeoCoordinates> geocodePorCepAproximado(String cep) {
        if (cep == null || cep.isBlank()) {
            return Optional.empty();
        }

        Optional<GeoCoordinates> coordenadas = cepGeocodingService.buscarCoordenadas(cep);
        if (coordenadas.isPresent()) {
            return coordenadas;
        }

        return cepGeocodingService.buscarEndereco(cep)
            .flatMap(endereco -> geocodeViaNominatim(montarConsultaLocalidade(
                endereco.bairro(),
                endereco.cidade(),
                endereco.estado(),
                endereco.cep()
            )));
    }

    private Optional<GeoCoordinates> geocodePorLocalidade(
        String bairro,
        String cidade,
        String estado,
        String cep
    ) {
        String consulta = montarConsultaLocalidade(bairro, cidade, estado, cep);
        if (consulta.isBlank()) {
            return Optional.empty();
        }
        return geocodeViaNominatim(consulta);
    }

    private String montarConsultaLocalidade(String bairro, String cidade, String estado, String cep) {
        if (cidade == null || cidade.isBlank() || estado == null || estado.isBlank()) {
            return "";
        }

        List<String> partes = new ArrayList<>();
        if (bairro != null && !bairro.isBlank()) {
            partes.add(bairro.trim());
        }
        String cepFormatado = formatarCepConsulta(cep);
        if (!cepFormatado.isBlank()) {
            partes.add(cepFormatado);
        }
        partes.add(cidade.trim());
        partes.add(estado.trim());
        partes.add("Brasil");
        return String.join(", ", partes);
    }

    private String formatarCepConsulta(String cep) {
        if (cep == null) {
            return "";
        }
        String digits = cep.replaceAll("\\D", "");
        if (digits.length() != 8) {
            return "";
        }
        return digits.substring(0, 5) + "-" + digits.substring(5);
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

        String encoded = URLEncoder.encode(query.trim(), StandardCharsets.UTF_8);
        URI uri = URI.create(
            NOMINATIM_SEARCH + "?format=json&limit=1&countrycodes=br&q=" + encoded
        );
        String cacheKey = "q:" + query.trim().toLowerCase();
        return geocodeViaNominatimUri(uri, cacheKey);
    }

    private Optional<GeoCoordinates> geocodeViaNominatimUri(URI uri, String cacheKey) {
        Optional<GeoCoordinates> cached = nominatimCache.get(cacheKey);
        if (cached != null) {
            return cached;
        }

        if (System.currentTimeMillis() < nominatimBlockedUntilMs) {
            log.debug("Nominatim em pausa por limite de taxa; consulta adiada: {}", cacheKey);
            return Optional.empty();
        }

        Optional<GeoCoordinates> result = executarNominatimComRetentativa(uri);
        nominatimCache.put(cacheKey, result);
        return result;
    }

    private Optional<GeoCoordinates> executarNominatimComRetentativa(URI uri) {
        for (int tentativa = 0; tentativa <= MAX_RETRIES; tentativa++) {
            try {
                return Optional.ofNullable(buscarCoordenadasNominatim(uri));
            } catch (RateLimitExceededException ex) {
                if (tentativa == MAX_RETRIES) {
                    log.warn("Limite de taxa do Nominatim atingido para '{}'.", uri);
                    return Optional.empty();
                }
                aguardarRetentativa(tentativa);
            } catch (RestClientException | NumberFormatException ex) {
                log.warn("Falha ao geocodificar endereco '{}': {}", uri, ex.getMessage());
                return Optional.empty();
            }
        }
        return Optional.empty();
    }

    private GeoCoordinates buscarCoordenadasNominatim(URI uri) {
        awaitNominatimRateLimit();

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
            log.debug("Nominatim sem resultado para: {}", uri);
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
