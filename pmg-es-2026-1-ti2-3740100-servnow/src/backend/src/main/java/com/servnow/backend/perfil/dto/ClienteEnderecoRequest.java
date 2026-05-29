package com.servnow.backend.perfil.dto;

public record ClienteEnderecoRequest(
    Long id,
    String rotulo,
    String rua,
    String numero,
    String cep,
    String complemento,
    String bairro,
    String cidade,
    String estado,
    Boolean principal,
    Boolean removerFoto
) {
}
