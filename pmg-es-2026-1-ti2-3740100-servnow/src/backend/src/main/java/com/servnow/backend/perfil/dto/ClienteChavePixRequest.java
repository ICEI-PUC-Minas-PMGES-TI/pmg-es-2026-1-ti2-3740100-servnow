package com.servnow.backend.perfil.dto;

public record ClienteChavePixRequest(
    Long id,
    String rotulo,
    String chave,
    String tipo,
    Boolean principal
) {
}
