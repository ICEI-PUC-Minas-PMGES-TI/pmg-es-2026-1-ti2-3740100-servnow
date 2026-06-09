package com.servnow.backend.acompanhamento.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SolicitarReagendamentoRequest(
    @NotBlank(message = "Descreva o motivo do reagendamento para o cliente.")
    @Size(max = 300, message = "A observacao deve ter no maximo 300 caracteres.")
    String observacao
) {
}
