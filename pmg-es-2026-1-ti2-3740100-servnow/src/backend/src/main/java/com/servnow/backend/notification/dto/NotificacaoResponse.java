package com.servnow.backend.notification.dto;

import java.time.OffsetDateTime;

public record NotificacaoResponse(
    Long id,
    String titulo,
    String mensagem,
    boolean lida,
    OffsetDateTime criadoEm
) {
}
