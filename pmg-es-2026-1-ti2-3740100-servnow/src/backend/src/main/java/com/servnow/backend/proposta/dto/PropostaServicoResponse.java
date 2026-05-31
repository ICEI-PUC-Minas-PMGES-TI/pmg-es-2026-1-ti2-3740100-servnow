package com.servnow.backend.proposta.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record PropostaServicoResponse(
    Long id,
    Long solicitacaoId,
    String solicitacaoTipoServico,
    String solicitacaoEndereco,
    LocalDate solicitacaoData,
    String solicitacaoHorario,
    Long clienteId,
    String clienteNome,
    Long prestadorId,
    String prestadorNome,
    BigDecimal valor,
    String mensagem,
    String status,
    OffsetDateTime criadoEm,
    OffsetDateTime respondidoEm,
    Double prestadorAvaliacaoMedia
) {
}
