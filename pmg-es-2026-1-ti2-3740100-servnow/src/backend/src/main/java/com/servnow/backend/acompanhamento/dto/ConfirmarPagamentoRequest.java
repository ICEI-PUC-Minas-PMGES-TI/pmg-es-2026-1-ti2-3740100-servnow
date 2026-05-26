package com.servnow.backend.acompanhamento.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ConfirmarPagamentoRequest(
    @NotBlank(message = "Informe o metodo de pagamento.")
    @Pattern(regexp = "PIX|CREDITO|DEBITO", message = "Metodo de pagamento invalido.")
    String metodoPagamento
) {
}
