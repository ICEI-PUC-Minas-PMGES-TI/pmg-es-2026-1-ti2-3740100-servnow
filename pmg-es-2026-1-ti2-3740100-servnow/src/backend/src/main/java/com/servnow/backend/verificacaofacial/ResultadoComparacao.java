package com.servnow.backend.verificacaofacial;

public record ResultadoComparacao(
    boolean aprovado,
    double similaridade,
    String mensagem
) {
}
