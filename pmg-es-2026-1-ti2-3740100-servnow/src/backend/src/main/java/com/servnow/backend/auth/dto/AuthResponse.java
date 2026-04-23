package com.servnow.backend.auth.dto;

public record AuthResponse(
    Long id,
    String nome,
    String email,
    String tipoUsuario,
    String mensagem
) {
}
