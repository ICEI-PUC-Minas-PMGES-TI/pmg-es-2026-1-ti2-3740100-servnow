package com.servnow.backend.localizacao;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.servnow.backend.solicitacao.domain.SolicitacaoServico;
import com.servnow.backend.usuario.domain.Usuario;

@Service
public class GeocodingService {

    private static final Logger log = LoggerFactory.getLogger(GeocodingService.class);
    private static final String NOMINATIM_SEARCH = "https://nominatim.openstreetmap.org/search";
    private static final String USER_AGENT = "ServNow/1.0 (academic; contact: dev@servnow.local)";

    private final RestClient restClient;

    public GeocodingService() {
        this.restClient = RestClient.builder()
            .defaultHeader("User-Agent", USER_AGENT)
            .defaultHeader("Accept", "application/json")
            .build();
    }

    public Optional<GeoCoordinates> geocode(SolicitacaoServico solicitacao) {
        return geocodeQuery(montarConsulta(solicitacao));
    }

    public Optional<GeoCoordinates> geocode(Usuario usuario) {
        return geocodeQuery(montarConsulta(usuario));
    }

    public Optional<GeoCoordinates> geocodeQuery(String query) {
        if (query == null || query.isBlank()) {
            return Optional.empty();
        }

        try {
            String encoded = URLEncoder.encode(query.trim(), StandardCharsets.UTF_8);
            URI uri = URI.create(
                NOMINATIM_SEARCH + "?format=json&limit=1&countrycodes=br&q=" + encoded
            );

            List<NominatimResult> results = restClient.get()
                .uri(uri)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

            if (results == null || results.isEmpty()) {
                log.debug("Geocoding sem resultado para: {}", query);
                return Optional.empty();
            }

            NominatimResult first = results.getFirst();
            if (first.lat == null || first.lon == null) {
                return Optional.empty();
            }

            double lat = Double.parseDouble(first.lat);
            double lon = Double.parseDouble(first.lon);
            return Optional.of(new GeoCoordinates(lat, lon));
        } catch (RestClientException | NumberFormatException ex) {
            log.warn("Falha ao geocodificar endereco '{}': {}", query, ex.getMessage());
            return Optional.empty();
        }
    }

    private String montarConsulta(SolicitacaoServico solicitacao) {
        return montarConsulta(
            solicitacao.getRua(),
            solicitacao.getNumero(),
            solicitacao.getComplemento(),
            solicitacao.getBairro(),
            solicitacao.getCidade(),
            solicitacao.getEstado(),
            solicitacao.getCep()
        );
    }

    private String montarConsulta(Usuario usuario) {
        return montarConsulta(
            usuario.getRua(),
            usuario.getNumero(),
            usuario.getComplemento(),
            usuario.getBairro(),
            usuario.getCidade(),
            usuario.getEstado(),
            usuario.getCep()
        );
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
}
