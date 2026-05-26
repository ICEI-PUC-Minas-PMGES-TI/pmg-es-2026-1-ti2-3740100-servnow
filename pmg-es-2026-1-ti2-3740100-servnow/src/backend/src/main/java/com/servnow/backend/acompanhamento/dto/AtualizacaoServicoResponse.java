package com.servnow.backend.acompanhamento.dto;

import java.time.OffsetDateTime;

public record AtualizacaoServicoResponse(
    Long id,
    String descricao,
    String fotoUrl,
    OffsetDateTime criadoEm
) {
}
