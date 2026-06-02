package com.servnow.backend.verificacaofacial.dto;

import java.time.OffsetDateTime;

public record VerificacaoFacialResponse(
    boolean aprovado,
    double similaridade,
    String mensagem,
    OffsetDateTime verificadoEm
) {
}
