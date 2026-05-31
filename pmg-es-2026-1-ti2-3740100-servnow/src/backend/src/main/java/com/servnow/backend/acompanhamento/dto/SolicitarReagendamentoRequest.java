package com.servnow.backend.acompanhamento.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SolicitarReagendamentoRequest(
    @NotNull(message = "Informe o percentual concluido.")
    @Min(value = 1, message = "O percentual deve ser no minimo 1%.")
    @Max(value = 99, message = "O percentual deve ser no maximo 99%.")
    Integer percentualConcluido,
    @Size(max = 300, message = "A observacao deve ter no maximo 300 caracteres.")
    String observacao
) {
}
