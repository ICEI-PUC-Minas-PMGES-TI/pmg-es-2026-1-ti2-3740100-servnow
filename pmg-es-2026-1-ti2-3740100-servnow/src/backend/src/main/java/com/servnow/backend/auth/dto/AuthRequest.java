package com.servnow.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AuthRequest(
    @Email(message = "Informe um e-mail valido.")
    @NotBlank(message = "O e-mail e obrigatorio.")
    String email,

    @NotBlank(message = "A senha e obrigatoria.")
    String senha,

    @NotBlank(message = "O tipo de usuario e obrigatorio.")
    String tipoUsuario
) {
}
