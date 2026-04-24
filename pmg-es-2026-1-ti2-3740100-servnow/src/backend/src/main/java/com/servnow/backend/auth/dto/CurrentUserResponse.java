package com.servnow.backend.auth.dto;

public record CurrentUserResponse(
    Long id,
    String nome,
    String email,
    String tipoUsuario
) {
}
