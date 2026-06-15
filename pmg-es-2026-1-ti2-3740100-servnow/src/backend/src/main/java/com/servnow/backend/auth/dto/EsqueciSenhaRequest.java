package com.servnow.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EsqueciSenhaRequest(
    @NotBlank(message = "Informe o e-mail.")
    @Email(message = "Informe um e-mail valido.")
    String email
) {
}
