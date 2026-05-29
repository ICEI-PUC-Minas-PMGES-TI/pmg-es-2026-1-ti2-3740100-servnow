package com.servnow.backend.acompanhamento.pix;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.util.Locale;

/**
 * Gera payload estatico PIX (padrao EMV BR Code) para QR Code de cobranca.
 */
public final class PixBrCodeGenerator {

    private PixBrCodeGenerator() {
    }

    public static String gerar(
        String chavePix,
        String nomeRecebedor,
        String cidade,
        BigDecimal valor,
        String identificadorTransacao
    ) {
        String chave = chavePix.trim();
        String nome = normalizarTexto(nomeRecebedor, 25);
        String cidadeNorm = normalizarTexto(cidade == null || cidade.isBlank() ? "BRASIL" : cidade, 15);
        String txid = normalizarTexto(
            identificadorTransacao == null || identificadorTransacao.isBlank()
                ? "SERVNOW"
                : identificadorTransacao,
            25
        );

        String merchantAccount = tlv("00", "br.gov.bcb.pix") + tlv("01", chave);
        StringBuilder payload = new StringBuilder();
        payload.append(tlv("00", "01"));
        payload.append(tlv("26", merchantAccount));
        payload.append(tlv("52", "0000"));
        payload.append(tlv("53", "986"));
        if (valor != null && valor.compareTo(BigDecimal.ZERO) > 0) {
            payload.append(tlv("54", formatarValor(valor)));
        }
        payload.append(tlv("58", "BR"));
        payload.append(tlv("59", nome));
        payload.append(tlv("60", cidadeNorm));
        payload.append(tlv("62", tlv("05", txid)));

        String semCrc = payload + "6304";
        return semCrc + calcularCrc16(semCrc);
    }

    private static String tlv(String id, String valor) {
        return id + String.format(Locale.ROOT, "%02d", valor.length()) + valor;
    }

    private static String formatarValor(BigDecimal valor) {
        return valor.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    private static String normalizarTexto(String texto, int tamanhoMaximo) {
        String semAcento = Normalizer.normalize(texto.trim(), Normalizer.Form.NFD)
            .replaceAll("\\p{M}+", "")
            .replaceAll("[^a-zA-Z0-9 @.&-]", " ")
            .replaceAll("\\s+", " ")
            .trim()
            .toUpperCase(Locale.ROOT);
        if (semAcento.isEmpty()) {
            semAcento = "SERVNOW";
        }
        return semAcento.length() <= tamanhoMaximo ? semAcento : semAcento.substring(0, tamanhoMaximo);
    }

    private static String calcularCrc16(String payload) {
        int polinomio = 0x1021;
        int resultado = 0xFFFF;
        byte[] bytes = payload.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        for (byte b : bytes) {
            resultado ^= (b & 0xFF) << 8;
            for (int i = 0; i < 8; i++) {
                if ((resultado & 0x8000) != 0) {
                    resultado = (resultado << 1) ^ polinomio;
                } else {
                    resultado <<= 1;
                }
                resultado &= 0xFFFF;
            }
        }
        return String.format(Locale.ROOT, "%04X", resultado);
    }
}
