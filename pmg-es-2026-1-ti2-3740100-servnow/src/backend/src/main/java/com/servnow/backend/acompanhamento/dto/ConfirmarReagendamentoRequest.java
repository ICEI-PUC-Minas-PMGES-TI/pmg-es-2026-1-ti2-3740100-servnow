package com.servnow.backend.acompanhamento.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record ConfirmarReagendamentoRequest(
    @NotNull(message = "Informe a nova data do servico.")
    LocalDate data,
    @NotBlank(message = "Informe o novo horario do servico.")
    @Pattern(regexp = "\\d{2}:\\d{2}", message = "O horario deve estar no formato HH:mm.")
    String horario
) {
}
