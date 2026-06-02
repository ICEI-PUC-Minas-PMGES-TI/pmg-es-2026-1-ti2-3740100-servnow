package com.servnow.backend.indicadores.dto;

import java.math.BigDecimal;

public record IndicadorSeriePontoResponse(
    String label,
    BigDecimal valor,
    BigDecimal percentual
) {
}
