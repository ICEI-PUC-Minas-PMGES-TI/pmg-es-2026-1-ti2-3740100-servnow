package com.servnow.backend.localizacao;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Distancia por rota de carro via OSRM (motor open source, mesmo tipo de calculo do Waze/Maps).
 * Servidor publico de demonstracao: {@link #DEFAULT_BASE_URL}
 */
@Service
@ConditionalOnProperty(name = "servnow.routing.provider", havingValue = "osrm", matchIfMissing = true)
public class OsrmRoutingService implements CarRoutingService {

    static final String DEFAULT_BASE_URL = "https://router.project-osrm.org";

    private static final Logger log = LoggerFactory.getLogger(OsrmRoutingService.class);

    private final RestClient restClient;
    private final boolean enabled;
    private final String baseUrl;

    public OsrmRoutingService(
        @Value("${servnow.osrm.enabled:true}") boolean enabled,
        @Value("${servnow.osrm.base-url:" + DEFAULT_BASE_URL + "}") String baseUrl
    ) {
        this.enabled = enabled;
        this.baseUrl = baseUrl == null || baseUrl.isBlank() ? DEFAULT_BASE_URL : baseUrl.replaceAll("/$", "");
        this.restClient = RestClient.builder()
            .defaultHeader("User-Agent", "ServNow/1.0 (academic; routing)")
            .build();
    }

    @Override
    public Map<Long, Double> distanciasRotaCarroKm(
        double latOrigem,
        double lonOrigem,
        List<PontoDestino> destinos
    ) {
        if (!enabled || destinos == null || destinos.isEmpty()) {
            return Map.of();
        }

        String coordenadas = montarCoordenadas(latOrigem, lonOrigem, destinos);
        String indicesDestinos = montarIndicesDestinos(destinos.size());

        URI uri = URI.create(
            baseUrl + "/table/v1/driving/" + coordenadas
                + "?sources=0&destinations=" + indicesDestinos
                + "&annotations=distance"
        );

        try {
            OsrmTableResponse response = restClient.get()
                .uri(uri)
                .retrieve()
                .body(OsrmTableResponse.class);

            if (response == null || !"Ok".equalsIgnoreCase(response.code) || response.distances == null
                || response.distances.length == 0 || response.distances[0] == null) {
                log.debug("OSRM Table sem distancias validas para origem com {} destinos.", destinos.size());
                return Map.of();
            }

            double[] linha = response.distances[0];
            Map<Long, Double> resultado = new HashMap<>();
            for (int i = 0; i < destinos.size(); i++) {
                int indiceColuna = i + 1;
                if (indiceColuna >= linha.length) {
                    break;
                }
                Double metros = linha[indiceColuna];
                if (metros == null || !Double.isFinite(metros) || metros < 0) {
                    continue;
                }
                resultado.put(destinos.get(i).id(), metrosParaKm(metros));
            }
            return resultado;
        } catch (RestClientException ex) {
            log.warn("Falha ao consultar OSRM Table ({} destinos): {}", destinos.size(), ex.getMessage());
            return Map.of();
        }
    }

    @Override
    public Optional<Double> distanciaRotaCarroKm(
        double latOrigem,
        double lonOrigem,
        double latDestino,
        double lonDestino
    ) {
        if (!enabled) {
            return Optional.empty();
        }

        URI uri = URI.create(
            baseUrl + "/route/v1/driving/"
                + lonOrigem + "," + latOrigem + ";" + lonDestino + "," + latDestino
                + "?overview=false&alternatives=false&steps=false"
        );

        try {
            OsrmRouteResponse response = restClient.get()
                .uri(uri)
                .retrieve()
                .body(OsrmRouteResponse.class);

            if (response == null || !"Ok".equalsIgnoreCase(response.code) || response.routes == null
                || response.routes.length == 0) {
                return Optional.empty();
            }

            double metros = response.routes[0].distance;
            if (!Double.isFinite(metros) || metros < 0) {
                return Optional.empty();
            }
            return Optional.of(metrosParaKm(metros));
        } catch (RestClientException ex) {
            log.warn("Falha ao consultar OSRM Route: {}", ex.getMessage());
            return Optional.empty();
        }
    }

    private static String montarCoordenadas(double latOrigem, double lonOrigem, List<PontoDestino> destinos) {
        StringBuilder builder = new StringBuilder();
        builder.append(lonOrigem).append(",").append(latOrigem);
        for (PontoDestino destino : destinos) {
            builder.append(";").append(destino.longitude()).append(",").append(destino.latitude());
        }
        return builder.toString();
    }

    private static String montarIndicesDestinos(int quantidade) {
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < quantidade; i++) {
            if (i > 0) {
                builder.append(";");
            }
            builder.append(i + 1);
        }
        return builder.toString();
    }

    private static double metrosParaKm(double metros) {
        return Math.round(metros / 100.0) / 10.0;
    }

    private static class OsrmTableResponse {
        public String code;
        public double[][] distances;
    }

    private static class OsrmRouteResponse {
        public String code;
        public OsrmRoute[] routes;

        private static class OsrmRoute {
            public double distance;
        }
    }
}
