package com.servnow.backend.verificacaofacial.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record RegistrarVerificacaoFacialRequest(
    @NotNull
    @DecimalMin("0")
    @DecimalMax("100")
    Double similaridade
) {
}
