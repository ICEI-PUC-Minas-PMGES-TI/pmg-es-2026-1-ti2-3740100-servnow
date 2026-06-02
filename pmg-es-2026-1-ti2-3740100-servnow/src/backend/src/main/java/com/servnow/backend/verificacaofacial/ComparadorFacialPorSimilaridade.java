package com.servnow.backend.verificacaofacial;

import org.springframework.stereotype.Component;

@Component
public class ComparadorFacialPorSimilaridade implements ComparadorFacial {

    private final FaceVerificationProperties properties;

    public ComparadorFacialPorSimilaridade(FaceVerificationProperties properties) {
        this.properties = properties;
    }

    @Override
    public ResultadoComparacao comparar(double similaridadeInformada) {
        if (Double.isNaN(similaridadeInformada) || Double.isInfinite(similaridadeInformada)) {
            return new ResultadoComparacao(false, 0, "Similaridade invalida.");
        }
        if (similaridadeInformada < 0 || similaridadeInformada > 100) {
            return new ResultadoComparacao(false, similaridadeInformada, "Similaridade fora do intervalo permitido.");
        }

        double limiar = properties.similarityThreshold();
        boolean aprovado = similaridadeInformada >= limiar;
        String mensagem = aprovado
            ? "Identidade verificada com sucesso."
            : "Rosto nao corresponde suficientemente a foto de perfil. Tente novamente com boa iluminacao.";
        return new ResultadoComparacao(aprovado, similaridadeInformada, mensagem);
    }
}
