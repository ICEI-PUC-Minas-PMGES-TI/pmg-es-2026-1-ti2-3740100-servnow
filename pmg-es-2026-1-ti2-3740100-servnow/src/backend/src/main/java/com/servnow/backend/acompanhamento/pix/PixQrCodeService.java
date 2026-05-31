package com.servnow.backend.acompanhamento.pix;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.EnumMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.servnow.backend.usuario.domain.Usuario;

@Service
public class PixQrCodeService {

    private static final int QR_SIZE = 360;

    public String gerarPayload(Usuario prestador, BigDecimal valor, String identificadorTransacao) {
        String chavePix = resolverChavePix(prestador);
        String cidade = prestador.getCidade() != null && !prestador.getCidade().isBlank()
            ? prestador.getCidade()
            : "BRASIL";
        return PixBrCodeGenerator.gerar(
            chavePix,
            prestador.getNome(),
            cidade,
            valor,
            identificadorTransacao
        );
    }

    public byte[] gerarImagemPng(Usuario prestador, BigDecimal valor, String identificadorTransacao) {
        return renderizarQrPng(gerarPayload(prestador, valor, identificadorTransacao));
    }

    public String resolverChavePix(Usuario prestador) {
        if (prestador.getChavePix() != null && !prestador.getChavePix().isBlank()) {
            return PixChaveNormalizer.normalizar(prestador.getChavePix());
        }
        if (prestador.getEmail() != null && !prestador.getEmail().isBlank()) {
            return PixChaveNormalizer.normalizar(prestador.getEmail());
        }
        throw new IllegalStateException("Prestador sem chave PIX cadastrada.");
    }

    private byte[] renderizarQrPng(String conteudo) {
        try {
            Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
            hints.put(EncodeHintType.CHARACTER_SET, StandardCharsets.UTF_8.name());
            hints.put(EncodeHintType.MARGIN, 1);

            BitMatrix matrix = new QRCodeWriter().encode(conteudo, BarcodeFormat.QR_CODE, QR_SIZE, QR_SIZE, hints);
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", output);
            return output.toByteArray();
        } catch (Exception exception) {
            throw new IllegalStateException("Nao foi possivel gerar o QR Code PIX.", exception);
        }
    }
}
