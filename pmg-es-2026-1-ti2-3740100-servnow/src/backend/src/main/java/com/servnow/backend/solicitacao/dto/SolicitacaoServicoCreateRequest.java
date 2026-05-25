package com.servnow.backend.solicitacao.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SolicitacaoServicoCreateRequest(
    @NotBlank(message = "Informe o tipo de servico.")
    @Size(max = 80, message = "O tipo de servico deve ter no maximo 80 caracteres.")
    String tipoServico,

    @Size(max = 80, message = "O icone de servico deve ter no maximo 80 caracteres.")
    String iconeServico,

    @NotBlank(message = "Informe a faixa de preco.")
    @Size(max = 60, message = "A faixa de preco deve ter no maximo 60 caracteres.")
    String faixaPreco,

    @NotBlank(message = "Descreva o servico.")
    @Size(max = 800, message = "A descricao deve ter no maximo 800 caracteres.")
    String descricao,

    @NotBlank(message = "Informe o CEP.")
    @Pattern(regexp = "^\\d{5}-?\\d{3}$", message = "CEP invalido.")
    String cep,

    @NotBlank(message = "Informe a rua.")
    @Size(max = 200, message = "A rua deve ter no maximo 200 caracteres.")
    String rua,

    @NotBlank(message = "Informe o numero.")
    @Size(max = 20, message = "O numero deve ter no maximo 20 caracteres.")
    String numero,

    @Size(max = 100, message = "O complemento deve ter no maximo 100 caracteres.")
    String complemento,

    @NotBlank(message = "Informe o bairro.")
    @Size(max = 100, message = "O bairro deve ter no maximo 100 caracteres.")
    String bairro,

    @NotBlank(message = "Informe a cidade.")
    @Size(max = 100, message = "A cidade deve ter no maximo 100 caracteres.")
    String cidade,

    @NotBlank(message = "Informe o estado.")
    @Pattern(regexp = "^[A-Za-z]{2}$", message = "Estado invalido.")
    String estado,

    @NotNull(message = "Informe a data do servico.")
    LocalDate data,

    @NotBlank(message = "Informe o horario do servico.")
    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "Horario invalido.")
    String horario
) {
}
