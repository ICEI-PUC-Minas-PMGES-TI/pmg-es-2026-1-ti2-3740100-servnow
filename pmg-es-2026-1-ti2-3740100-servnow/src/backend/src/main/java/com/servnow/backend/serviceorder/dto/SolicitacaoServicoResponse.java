package com.servnow.backend.serviceorder.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;

public record SolicitacaoServicoResponse(
    Long id,
    Long clienteId,
    String clienteNome,
    Long prestadorId,
    String prestadorNome,
    String endereco,
    String tipoServico,
    String faixaPreco,
    String descricao,
    LocalDate data,
    LocalTime horario,
    String imagemBase64,
    String status,
    OffsetDateTime criadoEm,
    OffsetDateTime aceitoEm
) {
}
