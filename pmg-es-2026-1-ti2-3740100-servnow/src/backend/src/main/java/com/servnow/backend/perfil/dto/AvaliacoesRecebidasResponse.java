package com.servnow.backend.perfil.dto;

import java.util.List;

public record AvaliacoesRecebidasResponse(
    Double avaliacaoMedia,
    Long totalAvaliacoes,
    String comentarioDestaque,
    List<AvaliacaoRecebidaResponse> avaliacoes
) {
}
