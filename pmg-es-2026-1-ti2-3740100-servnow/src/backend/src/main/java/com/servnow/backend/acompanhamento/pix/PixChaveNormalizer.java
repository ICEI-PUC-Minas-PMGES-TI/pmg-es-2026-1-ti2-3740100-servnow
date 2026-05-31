package com.servnow.backend.acompanhamento.pix;

import java.util.Locale;
import java.util.UUID;

/**
 * Normaliza chaves PIX para o formato exigido pelo BR Code (EMV).
 */
public final class PixChaveNormalizer {

    private PixChaveNormalizer() {
    }

    public static String normalizar(String chave) {
        if (chave == null || chave.isBlank()) {
            throw new IllegalArgumentException("Chave PIX vazia.");
        }

        String texto = chave.trim();

        if (texto.contains("@")) {
            return texto.toLowerCase(Locale.ROOT);
        }

        if (texto.startsWith("+")) {
            return normalizarTelefone(texto);
        }

        String apenasDigitos = texto.replaceAll("\\D", "");

        if (apenasDigitos.length() == 14) {
            return apenasDigitos;
        }

        if (apenasDigitos.length() == 11) {
            if (pareceTelefoneCelular(apenasDigitos) || texto.matches(".*\\D.*")) {
                return "+55" + apenasDigitos;
            }
            return apenasDigitos;
        }

        if (apenasDigitos.length() == 10) {
            return "+55" + apenasDigitos;
        }

        if (apenasDigitos.startsWith("55") && (apenasDigitos.length() == 12 || apenasDigitos.length() == 13)) {
            return "+" + apenasDigitos;
        }

        if (pareceChaveAleatoria(texto)) {
            return texto.toLowerCase(Locale.ROOT);
        }

        return texto;
    }

    private static String normalizarTelefone(String chave) {
        String digits = chave.replaceAll("\\D", "");
        if (digits.startsWith("55") && digits.length() >= 12 && digits.length() <= 13) {
            return "+" + digits;
        }
        if (digits.length() == 10 || digits.length() == 11) {
            return "+55" + digits;
        }
        throw new IllegalArgumentException("Telefone PIX invalido. Use +55DDD9XXXXXXXX.");
    }

    private static boolean pareceTelefoneCelular(String digits) {
        return digits.matches("\\d{2}9\\d{8}");
    }

    private static boolean pareceChaveAleatoria(String texto) {
        try {
            UUID.fromString(texto);
            return true;
        } catch (IllegalArgumentException ignored) {
            return false;
        }
    }
}
