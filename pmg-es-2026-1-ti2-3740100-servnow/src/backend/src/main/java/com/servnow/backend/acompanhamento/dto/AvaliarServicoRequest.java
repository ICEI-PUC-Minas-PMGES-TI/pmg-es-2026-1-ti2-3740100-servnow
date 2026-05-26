package com.servnow.backend.acompanhamento.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record AvaliarServicoRequest(
    @Min(value = 1, message = "A nota minima e 1.")
    @Max(value = 5, message = "A nota maxima e 5.")
    short nota,
    @Size(max = 200, message = "O comentario deve ter no maximo 200 caracteres.")
    String comentario
) {
}
