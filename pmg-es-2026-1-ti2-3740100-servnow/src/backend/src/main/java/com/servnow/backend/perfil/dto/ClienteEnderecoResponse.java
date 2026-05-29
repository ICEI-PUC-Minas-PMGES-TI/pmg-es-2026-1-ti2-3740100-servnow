package com.servnow.backend.perfil.dto;

public record ClienteEnderecoResponse(
    Long id,
    String rotulo,
    String rua,
    String numero,
    String cep,
    String complemento,
    String bairro,
    String cidade,
    String estado,
    String fotoUrl,
    boolean principal
) {
}
