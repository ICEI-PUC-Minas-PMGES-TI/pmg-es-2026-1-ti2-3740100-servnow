package com.servnow.backend.verificacaofacial;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ComparadorFacialPorSimilaridadeTest {

    private final ComparadorFacialPorSimilaridade comparador =
        new ComparadorFacialPorSimilaridade(new FaceVerificationProperties(true, 55));

    @Test
    void aprovaAcimaDoLimiar() {
        ResultadoComparacao resultado = comparador.comparar(60);
        assertThat(resultado.aprovado()).isTrue();
        assertThat(resultado.similaridade()).isEqualTo(60);
    }

    @Test
    void rejeitaAbaixoDoLimiar() {
        ResultadoComparacao resultado = comparador.comparar(40);
        assertThat(resultado.aprovado()).isFalse();
    }

    @Test
    void rejeitaSimilaridadeInvalida() {
        ResultadoComparacao resultado = comparador.comparar(150);
        assertThat(resultado.aprovado()).isFalse();
    }
}
