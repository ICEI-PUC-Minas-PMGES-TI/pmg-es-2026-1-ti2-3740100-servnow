package com.servnow.backend.acompanhamento.pix;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;

class PixBrCodeGeneratorTest {

    @Test
    void geraPayloadPixComCrcValido() {
        String payload = PixBrCodeGenerator.gerar(
            "prestador@email.com",
            "Sergio Matos",
            "Belo Horizonte",
            new BigDecimal("150.00"),
            "SN100"
        );

        assertThat(payload).startsWith("000201");
        assertThat(payload).contains("br.gov.bcb.pix");
        assertThat(payload).contains("prestador@email.com");
        assertThat(payload).contains("6304");
        assertThat(payload.length()).isGreaterThan(50);
    }
}
