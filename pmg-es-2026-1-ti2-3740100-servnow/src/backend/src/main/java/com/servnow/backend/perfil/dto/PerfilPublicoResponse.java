package com.servnow.backend.perfil.dto;

import java.time.OffsetDateTime;

public record PerfilPublicoResponse(
    Long id,
    String nome,
    String tipoUsuario,
    String bairro,
    String cidade,
    String estado,
    String fotoPerfilUrl,
    String descricao,
    String especialidades,
    String diasDisponiveis,
    String horarioInicio,
    String horarioFim,
    Integer raioAtendimentoKm,
    Double avaliacaoMedia,
    Integer totalAvaliacoes,
    String comentarioDestaque,
    OffsetDateTime criadoEm
) {
}
