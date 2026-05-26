package com.servnow.backend.acompanhamento.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AcompanhamentoDisponivelResponse(
    Long solicitacaoId,
    String tipoServico,
    String contraparteNome,
    LocalDate data,
    String horario,
    BigDecimal valorAceito,
    String etapa
) {
}
