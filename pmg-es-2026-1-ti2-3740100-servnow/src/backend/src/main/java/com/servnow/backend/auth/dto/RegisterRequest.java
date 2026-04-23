package com.servnow.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "O nome e obrigatorio.")
    String nome,

    @Email(message = "Informe um e-mail valido.")
    @NotBlank(message = "O e-mail e obrigatorio.")
    String email,

    @NotBlank(message = "A senha e obrigatoria.")
    @Size(min = 6, message = "A senha deve ter pelo menos 6 caracteres.")
    String senha,

    @NotBlank(message = "O tipo de usuario e obrigatorio.")
    String tipoUsuario
) {
}
