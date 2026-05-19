package com.servnow.backend.perfil.dto;

public record PerfilUpdateRequest(
    String nome,
    String rua,
    String numero,
    String cep,
    String complemento,
    String bairro,
    String cidade,
    String estado,
    Integer fotoPerfilAjusteX,
    Integer fotoPerfilAjusteY,
    String fotoPerfilEnquadramento,
    Boolean removerFotoPerfil,
    Boolean removerFotoLocal,
    Boolean removerDocumentoIdentidade,
    String descricaoProfissional,
    String especialidades,
    String diasDisponiveis,
    String horarioInicio,
    String horarioFim,
    Integer raioAtendimentoKm
) {
}
