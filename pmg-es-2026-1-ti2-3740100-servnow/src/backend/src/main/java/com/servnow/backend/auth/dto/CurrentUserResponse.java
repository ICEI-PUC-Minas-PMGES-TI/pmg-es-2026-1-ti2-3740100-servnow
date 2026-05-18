package com.servnow.backend.auth.dto;

public record CurrentUserResponse(
    Long id,
    String nome,
    String email,
    String tipoUsuario,
    String rua,
    String numero,
    String cep,
    String complemento,
    String bairro,
    String cidade,
    String estado,
    String fotoPerfilBase64,
    Integer fotoPerfilAjusteX,
    Integer fotoPerfilAjusteY,
    String fotoPerfilEnquadramento,
    String fotoBase64,
    String descricaoProfissional,
    String especialidades,
    String diasDisponiveis,
    String horarioInicio,
    String horarioFim,
    Integer raioAtendimentoKm,
    String documentoIdentidadeBase64
) {
}
