package com.servnow.backend.perfil.dto;

import java.time.OffsetDateTime;

public record AvaliacaoRecebidaResponse(
    Long ordemServicoId,
    String autorNome,
    String tipoServico,
    Short nota,
    String comentario,
    OffsetDateTime avaliadoEm
) {
}
