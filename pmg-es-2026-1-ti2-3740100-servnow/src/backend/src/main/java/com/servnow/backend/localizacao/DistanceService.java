package com.servnow.backend.localizacao;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.servnow.backend.solicitacao.domain.SolicitacaoServico;
import com.servnow.backend.usuario.domain.Usuario;

@Service
public class DistanceService {

    private static final double RAIO_TERRA_KM = 6371.0;

    private final CarRoutingService carRoutingService;

    public DistanceService(CarRoutingService carRoutingService) {
        this.carRoutingService = carRoutingService;
    }

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

    public DistanciaCalculada calcularParaPrestador(Usuario prestador, SolicitacaoServico solicitacao) {
        if (prestador == null || solicitacao == null) {
            return null;
        }
        return calcular(
            prestador.getLatitude(),
            prestador.getLongitude(),
            solicitacao.getLatitude(),
            solicitacao.getLongitude()
        );
    }

    public Map<Long, DistanciaCalculada> calcularEmLoteParaPrestador(Usuario prestador, List<SolicitacaoServico> solicitacoes) {
        if (prestador == null || solicitacaoSemCoordenadas(prestador.getLatitude(), prestador.getLongitude())) {
            return Map.of();
        }

        List<CarRoutingService.PontoDestino> destinos = new ArrayList<>();
        for (SolicitacaoServico solicitacao : solicitacoes) {
            if (solicitacao.getId() == null) {
                continue;
            }
            if (solicitacaoSemCoordenadas(solicitacao.getLatitude(), solicitacao.getLongitude())) {
                continue;
            }
            destinos.add(new CarRoutingService.PontoDestino(
                solicitacao.getId(),
                solicitacao.getLatitude(),
                solicitacao.getLongitude()
            ));
        }

        Map<Long, Double> rotasKm = carRoutingService.distanciasRotaCarroKm(
            prestador.getLatitude(),
            prestador.getLongitude(),
            destinos
        );

        Map<Long, DistanciaCalculada> resultado = new HashMap<>();
        for (SolicitacaoServico solicitacao : solicitacoes) {
            if (solicitacao.getId() == null) {
                continue;
            }
            DistanciaCalculada calculada = montarResultado(
                prestador.getLatitude(),
                prestador.getLongitude(),
                solicitacao.getLatitude(),
                solicitacao.getLongitude(),
                rotasKm.get(solicitacao.getId())
            );
            if (calculada != null) {
                resultado.put(solicitacao.getId(), calculada);
            }
        }
        return resultado;
    }

    private DistanciaCalculada calcular(
        Double latOrigem,
        Double lonOrigem,
        Double latDestino,
        Double lonDestino
    ) {
        if (solicitacaoSemCoordenadas(latOrigem, lonOrigem) || solicitacaoSemCoordenadas(latDestino, lonDestino)) {
            return null;
        }

        Optional<Double> rotaKm = carRoutingService.distanciaRotaCarroKm(
            latOrigem,
            lonOrigem,
            latDestino,
            lonDestino
        );
        return montarResultado(latOrigem, lonOrigem, latDestino, lonDestino, rotaKm.orElse(null));
    }

    private DistanciaCalculada montarResultado(
        Double latOrigem,
        Double lonOrigem,
        Double latDestino,
        Double lonDestino,
        Double rotaKm
    ) {
        if (rotaKm != null) {
            return new DistanciaCalculada(rotaKm, false);
        }
        Double linhaRetaKm = distanciaKm(latOrigem, lonOrigem, latDestino, lonDestino);
        if (linhaRetaKm == null) {
            return null;
        }
        return new DistanciaCalculada(linhaRetaKm, true);
    }

    private boolean solicitacaoSemCoordenadas(Double latitude, Double longitude) {
        return latitude == null || longitude == null || !Double.isFinite(latitude) || !Double.isFinite(longitude);
    }
}
