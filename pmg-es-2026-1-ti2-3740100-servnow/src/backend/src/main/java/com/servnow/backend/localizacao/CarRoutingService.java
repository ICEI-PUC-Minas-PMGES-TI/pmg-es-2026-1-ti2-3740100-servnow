package com.servnow.backend.localizacao;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Distancia por rota de carro (estilo Waze/Maps), independente do provedor (OSRM, OpenRouteService, etc.).
 */
public interface CarRoutingService {

    record PontoDestino(long id, double latitude, double longitude) {
    }

    Map<Long, Double> distanciasRotaCarroKm(double latOrigem, double lonOrigem, List<PontoDestino> destinos);

    Optional<Double> distanciaRotaCarroKm(
        double latOrigem,
        double lonOrigem,
        double latDestino,
        double lonDestino
    );
}
