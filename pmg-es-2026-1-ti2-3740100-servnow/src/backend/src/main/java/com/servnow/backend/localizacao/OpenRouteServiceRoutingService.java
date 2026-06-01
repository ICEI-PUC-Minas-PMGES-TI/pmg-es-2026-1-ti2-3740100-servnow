package com.servnow.backend.localizacao;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Roteamento via OpenRouteService (cota gratuita em openrouteservice.org).
 * Ative com {@code servnow.routing.provider=openrouteservice} e a chave em
 * {@code OPENROUTESERVICE_API_KEY}.
 */
@Service
@ConditionalOnProperty(name = "servnow.routing.provider", havingValue = "openrouteservice")
public class OpenRouteServiceRoutingService implements CarRoutingService {

    private static final Logger log = LoggerFactory.getLogger(OpenRouteServiceRoutingService.class);

    private final RestClient restClient;
    private final boolean enabled;
    private final String baseUrl;

    public OpenRouteServiceRoutingService(
        @Value("${servnow.openrouteservice.enabled:true}") boolean enabledFlag,
        @Value("${servnow.openrouteservice.api-key:}") String apiKey,
        @Value("${servnow.openrouteservice.base-url:https://api.openrouteservice.org}") String baseUrl
    ) {
        String chave = apiKey == null ? "" : apiKey.trim();
        this.enabled = enabledFlag && !chave.isBlank();
        this.baseUrl = baseUrl == null || baseUrl.isBlank()
            ? "https://api.openrouteservice.org"
            : baseUrl.replaceAll("/$", "");
        this.restClient = RestClient.builder()
            .defaultHeader("Authorization", chave)
            .defaultHeader("User-Agent", "ServNow/1.0 (academic; routing)")
            .build();
        if (enabledFlag && chave.isBlank()) {
            log.warn(
                "OpenRouteService selecionado, mas OPENROUTESERVICE_API_KEY vazia — distancia usara fallback (linha reta)."
            );
        }
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

        double[][] locations = new double[destinos.size() + 1][2];
        locations[0] = new double[] { lonOrigem, latOrigem };
        for (int i = 0; i < destinos.size(); i++) {
            PontoDestino destino = destinos.get(i);
            locations[i + 1] = new double[] { destino.longitude(), destino.latitude() };
        }

        int[] destinations = new int[destinos.size()];
        for (int i = 0; i < destinos.size(); i++) {
            destinations[i] = i + 1;
        }

        try {
            OrsMatrixResponse response = restClient.post()
                .uri(baseUrl + "/v2/matrix/driving-car")
                .contentType(MediaType.APPLICATION_JSON)
                .body(new OrsMatrixRequest(locations, new int[] { 0 }, destinations))
                .retrieve()
                .body(OrsMatrixResponse.class);

            if (response == null || response.distances == null || response.distances.length == 0
                || response.distances[0] == null) {
                return Map.of();
            }

            double[] linha = response.distances[0];
            Map<Long, Double> resultado = new HashMap<>();
            for (int i = 0; i < destinos.size(); i++) {
                if (i >= linha.length) {
                    break;
                }
                Double metros = linha[i];
                if (metros == null || !Double.isFinite(metros) || metros < 0) {
                    continue;
                }
                resultado.put(destinos.get(i).id(), metrosParaKm(metros));
            }
            return resultado;
        } catch (RestClientException ex) {
            log.warn("Falha ao consultar OpenRouteService Matrix ({} destinos): {}", destinos.size(), ex.getMessage());
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
        return distanciasRotaCarroKm(
            latOrigem,
            lonOrigem,
            List.of(new PontoDestino(0L, latDestino, lonDestino))
        ).values().stream().findFirst();
    }

    private static double metrosParaKm(double metros) {
        return Math.round(metros / 100.0) / 10.0;
    }

    private record OrsMatrixRequest(double[][] locations, int[] sources, int[] destinations) {
    }

    private static class OrsMatrixResponse {
        public double[][] distances;
    }
}
