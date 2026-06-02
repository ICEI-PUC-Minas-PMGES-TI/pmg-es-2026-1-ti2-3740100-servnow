package com.servnow.backend.indicadores.dto;

import java.math.BigDecimal;

public record ParticipacaoCategoriaResponse(
    String tipoServico,
    BigDecimal ganhoPrestador,
    BigDecimal ganhoPlataforma,
    BigDecimal percentual
) {
}
