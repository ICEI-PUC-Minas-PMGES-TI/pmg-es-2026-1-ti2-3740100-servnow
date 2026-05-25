package com.servnow.backend.notificacao.dto;

import java.time.OffsetDateTime;

import com.servnow.backend.notificacao.domain.TipoNotificacao;

public record NotificacaoResponse(
    Long id,
    TipoNotificacao tipo,
    String titulo,
    String mensagem,
    Long propostaId,
    Long solicitacaoId,
    boolean lida,
    OffsetDateTime criadoEm
) {
}
