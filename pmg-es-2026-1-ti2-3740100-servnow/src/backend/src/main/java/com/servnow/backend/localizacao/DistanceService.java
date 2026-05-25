package com.servnow.backend.localizacao;

import org.springframework.stereotype.Service;

@Service
public class DistanceService {

    private static final double RAIO_TERRA_KM = 6371.0;

    public Double distanciaKm(GeoCoordinates origem, GeoCoordinates destino) {
        if (origem == null || destino == null) {
            return null;
        }
        return distanciaKm(origem.latitude(), origem.longitude(), destino.latitude(), destino.longitude());
    }

    public Double distanciaKm(Double latOrigem, Double lonOrigem, Double latDestino, Double lonDestino) {
        if (latOrigem == null || lonOrigem == null || latDestino == null || lonDestino == null) {
            return null;
        }

        double lat1 = Math.toRadians(latOrigem);
        double lat2 = Math.toRadians(latDestino);
        double deltaLat = Math.toRadians(latDestino - latOrigem);
        double deltaLon = Math.toRadians(lonDestino - lonOrigem);

        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
            + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return Math.round(RAIO_TERRA_KM * c * 10.0) / 10.0;
    }
}
