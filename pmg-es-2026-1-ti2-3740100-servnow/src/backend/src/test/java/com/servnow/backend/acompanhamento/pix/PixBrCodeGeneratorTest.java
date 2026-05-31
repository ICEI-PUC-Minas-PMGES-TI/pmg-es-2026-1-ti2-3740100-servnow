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
        assertThat(payload).contains("010211");
        assertThat(payload).contains("br.gov.bcb.pix");
        assertThat(payload).contains("prestador@email.com");
        assertThat(payload).contains("6304");
        assertThat(validarCrc(payload)).isTrue();
    }

    @Test
    void validaExemploPublicoConhecido() {
        String semCrc = "00020126590014BR.GOV.BCB.PIX0122manoelcampos@gmail.com0211PIX em Java52040000530398654041.005802BR5925Manoel Campos da Silva Fh6006Palmas62070503***6304";
        String payload = semCrc + "FEC1";
        assertThat(validarCrc(payload)).isTrue();
    }

    @Test
    void normalizaTelefoneParaFormatoPix() {
        String payload = PixBrCodeGenerator.gerar(
            "(31) 99876-5432",
            "Prestador Teste",
            "Belo Horizonte",
            new BigDecimal("10.00"),
            "SN1"
        );

        assertThat(payload).contains("+5531998765432");
        assertThat(validarCrc(payload)).isTrue();
    }

    private static boolean validarCrc(String payload) {
        String informado = payload.substring(payload.length() - 4);
        String semCrc = payload.substring(0, payload.length() - 4);
        String calculado = calcularCrc(semCrc);
        return informado.equalsIgnoreCase(calculado);
    }

    private static String calcularCrc(String payload) {
        int polinomio = 0x1021;
        int resultado = 0xFFFF;
        byte[] bytes = payload.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        for (byte b : bytes) {
            for (int i = 0; i < 8; i++) {
                boolean bit = ((b >> (7 - i) & 1) == 1);
                boolean c15 = ((resultado >> 15 & 1) == 1);
                resultado <<= 1;
                if (c15 ^ bit) {
                    resultado ^= polinomio;
                }
            }
            resultado &= 0xFFFF;
        }
        return String.format(java.util.Locale.ROOT, "%04X", resultado);
    }
}
