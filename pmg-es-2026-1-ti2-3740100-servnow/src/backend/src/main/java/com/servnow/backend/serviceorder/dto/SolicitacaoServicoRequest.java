package com.servnow.backend.serviceorder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SolicitacaoServicoRequest(
    @NotBlank(message = "O endereco e obrigatorio.")
    @Size(max = 200, message = "O endereco deve ter no maximo 200 caracteres.")
    String endereco,

    @NotBlank(message = "O tipo de servico e obrigatorio.")
    String tipoServico,

    @NotBlank(message = "A faixa de preco e obrigatoria.")
    String faixaPreco,

    @NotBlank(message = "A descricao e obrigatoria.")
    @Size(max = 1000, message = "A descricao deve ter no maximo 1000 caracteres.")
    String descricao,

    @NotNull(message = "A data do servico e obrigatoria.")
    String data,

    @NotNull(message = "O horario do servico e obrigatorio.")
    String horario,

    String imagemBase64
) {
}
