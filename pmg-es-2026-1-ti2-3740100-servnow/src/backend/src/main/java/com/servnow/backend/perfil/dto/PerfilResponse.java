package com.servnow.backend.perfil.dto;

import java.util.List;

public record PerfilResponse(
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
    String fotoPerfilUrl,
    Integer fotoPerfilAjusteX,
    Integer fotoPerfilAjusteY,
    String fotoPerfilEnquadramento,
    String fotoLocalUrl,
    String descricaoProfissional,
    String especialidades,
    String diasDisponiveis,
    String horarioInicio,
    String horarioFim,
    Integer raioAtendimentoKm,
    String documentoIdentidadeUrl,
    String chavePix,
    Double avaliacaoMedia,
    Long totalAvaliacoes,
    Double latitude,
    Double longitude,
    List<ClienteEnderecoResponse> enderecos,
    List<ClienteChavePixResponse> chavesPix,
    Boolean perfilCompleto,
    List<String> pendenciasPerfil
) {
}
