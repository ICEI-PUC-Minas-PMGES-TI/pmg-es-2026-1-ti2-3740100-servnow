package com.servnow.backend.proposta.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PropostaCreateRequest(
    @NotNull(message = "Informe a solicitacao.")
    Long solicitacaoId,

    @NotNull(message = "Informe o valor da proposta.")
    @DecimalMin(value = "1.00", message = "O valor minimo da proposta e R$ 1,00.")
    @Digits(integer = 8, fraction = 2, message = "Valor da proposta invalido.")
    BigDecimal valor,

    @NotBlank(message = "Escreva uma mensagem para o cliente.")
    @Size(max = 800, message = "A mensagem deve ter no maximo 800 caracteres.")
    String mensagem
) {
}
