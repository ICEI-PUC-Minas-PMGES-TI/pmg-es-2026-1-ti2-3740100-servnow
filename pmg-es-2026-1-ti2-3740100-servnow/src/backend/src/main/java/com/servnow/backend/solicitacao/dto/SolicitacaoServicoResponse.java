package com.servnow.backend.solicitacao.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record SolicitacaoServicoResponse(
    Long id,
    Long clienteId,
    String clienteNome,
    Long prestadorId,
    String prestadorNome,
    String endereco,
    String cep,
    String rua,
    String numero,
    String complemento,
    String bairro,
    String cidade,
    String estado,
    String tipoServico,
    String iconeServico,
    String faixaPreco,
    String descricao,
    LocalDate data,
    String horario,
    String imagemBase64,
    String status,
    OffsetDateTime criadoEm,
    OffsetDateTime aceitoEm
) {
}
