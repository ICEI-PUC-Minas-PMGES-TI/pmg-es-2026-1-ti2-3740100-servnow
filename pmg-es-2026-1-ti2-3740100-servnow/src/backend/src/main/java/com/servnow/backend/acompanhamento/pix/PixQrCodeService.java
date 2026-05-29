package com.servnow.backend.acompanhamento.pix;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;

import org.springframework.stereotype.Service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.servnow.backend.usuario.domain.Usuario;

@Service
public class PixQrCodeService {

    private static final int QR_SIZE = 320;

    public byte[] gerarImagemPng(Usuario prestador, BigDecimal valor, String identificadorTransacao) {
        String chavePix = resolverChavePix(prestador);
        String cidade = prestador.getCidade() != null && !prestador.getCidade().isBlank()
            ? prestador.getCidade()
            : "BRASIL";
        String payload = PixBrCodeGenerator.gerar(
            chavePix,
            prestador.getNome(),
            cidade,
            valor,
            identificadorTransacao
        );
        return renderizarQrPng(payload);
    }

    public String resolverChavePix(Usuario prestador) {
        if (prestador.getChavePix() != null && !prestador.getChavePix().isBlank()) {
            return prestador.getChavePix().trim();
        }
        if (prestador.getEmail() != null && !prestador.getEmail().isBlank()) {
            return prestador.getEmail().trim().toLowerCase();
        }
        throw new IllegalStateException("Prestador sem chave PIX cadastrada.");
    }

    private byte[] renderizarQrPng(String conteudo) {
        try {
            BitMatrix matrix = new QRCodeWriter().encode(conteudo, BarcodeFormat.QR_CODE, QR_SIZE, QR_SIZE);
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", output);
            return output.toByteArray();
        } catch (Exception exception) {
            throw new IllegalStateException("Nao foi possivel gerar o QR Code PIX.", exception);
        }
    }
}
