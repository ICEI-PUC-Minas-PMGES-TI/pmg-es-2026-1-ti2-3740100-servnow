package com.servnow.backend.indicadores.dto;

import java.math.BigDecimal;
import java.util.List;

public record IndicadorPrestadorResponse(
    String periodo,
    BigDecimal ganhosPropriosTotal,
    List<IndicadorSeriePontoResponse> ganhosPropriosSerie,
    BigDecimal efetividadePercentual,
    long servicosConcluidos,
    long servicosConcluidosPlataforma,
    List<IndicadorSeriePontoResponse> efetividadeSerie,
    BigDecimal participacaoPlataformaPercentual,
    BigDecimal ganhoPrestadorPeriodo,
    BigDecimal ganhoPlataformaPeriodo,
    List<IndicadorSeriePontoResponse> participacaoPlataformaSerie,
    List<ParticipacaoCategoriaResponse> participacaoPorCategoria
) {
}
