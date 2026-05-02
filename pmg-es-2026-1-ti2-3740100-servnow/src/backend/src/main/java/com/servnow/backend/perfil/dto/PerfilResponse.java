package com.servnow.backend.perfil.dto;

public record PerfilResponse(
    Long id,
    String nome,
    String email,
    String tipoUsuario,
    String rua,
    String numero,
    String cep,
    String bairro,
    String cidade,
    String estado,
    String fotoBase64,
    String descricaoProfissional,
    String especialidades
) {
}
