package com.servnow.backend.acompanhamento.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ConfirmarChegadaRequest(
    @NotBlank(message = "Informe o codigo de verificacao.")
    @Pattern(regexp = "\\d{4}", message = "O codigo deve ter 4 digitos.")
    String codigo
) {
}
