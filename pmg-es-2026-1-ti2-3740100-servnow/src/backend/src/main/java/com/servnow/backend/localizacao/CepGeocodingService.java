package com.servnow.backend.localizacao;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class CepGeocodingService {

    private static final Logger log = LoggerFactory.getLogger(CepGeocodingService.class);
    private static final String BRASIL_API_CEP_V2 = "https://brasilapi.com.br/api/cep/v2/";

    private final RestClient restClient;
    private final ConcurrentHashMap<String, Optional<CepConsulta>> cache = new ConcurrentHashMap<>();

    public CepGeocodingService() {
        this.restClient = RestClient.builder()
            .defaultHeader("Accept", "application/json")
            .build();
    }

    public Optional<GeoCoordinates> buscarCoordenadas(String cep) {
        return consultarCep(cep).flatMap(CepConsulta::coordenadas);
    }

    public Optional<CepEndereco> buscarEndereco(String cep) {
        return consultarCep(cep).map(CepConsulta::endereco);
    }

    public boolean cepCompativelComEndereco(String cep, String cidade, String estado) {
        if (cidade == null || estado == null) {
            return true;
        }

        return consultarCep(cep)
            .map(consulta -> normalizarTexto(consulta.endereco().cidade()).equals(normalizarTexto(cidade))
                && consulta.endereco().estado().equalsIgnoreCase(estado.trim()))
            .orElse(true);
    }

    private Optional<CepConsulta> consultarCep(String cep) {
        String cepDigits = normalizarCep(cep);
        if (cepDigits.length() != 8) {
            return Optional.empty();
        }

        Optional<CepConsulta> cached = cache.get(cepDigits);
        if (cached != null) {
            return cached;
        }

        Optional<CepConsulta> result = consultarBrasilApi(cepDigits);
        cache.put(cepDigits, result);
        return result;
    }

    private Optional<CepConsulta> consultarBrasilApi(String cepDigits) {
        try {
            BrasilApiCepResponse response = restClient.get()
                .uri(BRASIL_API_CEP_V2 + cepDigits)
                .retrieve()
                .body(BrasilApiCepResponse.class);

            if (response == null || response.city == null || response.state == null) {
                return Optional.empty();
            }

            CepEndereco endereco = new CepEndereco(
                formatarCep(cepDigits),
                response.street,
                response.neighborhood,
                response.city,
                response.state
            );

            Optional<GeoCoordinates> coordenadas = extrairCoordenadas(response);
            if (coordenadas.isEmpty()) {
                log.debug("Brasil API sem coordenadas para CEP {}.", cepDigits);
            }

            return Optional.of(new CepConsulta(endereco, coordenadas));
        } catch (HttpClientErrorException.NotFound ex) {
            log.debug("CEP {} nao encontrado na Brasil API.", cepDigits);
            return Optional.empty();
        } catch (RestClientException | NumberFormatException ex) {
            log.warn("Falha ao consultar CEP {} na Brasil API: {}", cepDigits, ex.getMessage());
            return Optional.empty();
        }
    }

    private Optional<GeoCoordinates> extrairCoordenadas(BrasilApiCepResponse response) {
        if (response.location == null || response.location.coordinates == null) {
            return Optional.empty();
        }

        BrasilApiCepResponse.Coordinates coordinates = response.location.coordinates;
        if (coordinates.latitude == null || coordinates.longitude == null) {
            return Optional.empty();
        }

        double lat = Double.parseDouble(coordinates.latitude);
        double lon = Double.parseDouble(coordinates.longitude);
        return Optional.of(new GeoCoordinates(lat, lon));
    }

    private String normalizarCep(String cep) {
        if (cep == null) {
            return "";
        }
        return cep.replaceAll("\\D", "");
    }

    private String formatarCep(String cepDigits) {
        return "%s-%s".formatted(cepDigits.substring(0, 5), cepDigits.substring(5));
    }

    private String normalizarTexto(String valor) {
        return valor.trim()
            .toLowerCase()
            .replaceAll("\\s+", " ");
    }

    public record CepEndereco(
        String cep,
        String rua,
        String bairro,
        String cidade,
        String estado
    ) {
    }

    private record CepConsulta(CepEndereco endereco, Optional<GeoCoordinates> coordenadas) {
    }

    private static class BrasilApiCepResponse {
        public String cep;
        public String state;
        public String city;
        public String neighborhood;
        public String street;
        public Location location;

        private static class Location {
            public Coordinates coordinates;
        }

        private static class Coordinates {
            public String latitude;
            public String longitude;
        }
    }
}
