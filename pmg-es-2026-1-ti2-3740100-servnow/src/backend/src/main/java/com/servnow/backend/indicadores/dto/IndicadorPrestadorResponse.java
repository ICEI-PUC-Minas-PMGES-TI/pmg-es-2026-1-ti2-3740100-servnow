package com.servnow.backend.indicadores.dto;

import java.math.BigDecimal;
import java.util.List;

public record IndicadorPrestadorResponse(
    String periodo,
    BigDecimal ganhosPropriosTotal,
    List<IndicadorSeriePontoResponse> ganhosPropriosSerie,
    BigDecimal avaliacaoMedia,
    long totalAvaliacoes,
    BigDecimal efetividadePercentual,
    long servicosConcluidos,
    long servicosRecebidos,
    List<IndicadorSeriePontoResponse> efetividadeSerie,
    BigDecimal participacaoPlataformaPercentual,
    BigDecimal crescimentoParticipacaoMensal,
    BigDecimal ganhoPrestadorPeriodo,
    BigDecimal ganhoPlataformaPeriodo,
    List<IndicadorSeriePontoResponse> participacaoPlataformaSerie,
    List<ParticipacaoCategoriaResponse> participacaoPorCategoria
) {
}
