package com.servnow.backend.perfil.dto;

public record ClienteChavePixResponse(
    Long id,
    String rotulo,
    String chave,
    String tipo,
    boolean principal
) {
}
