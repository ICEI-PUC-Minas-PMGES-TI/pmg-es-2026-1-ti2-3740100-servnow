package com.servnow.backend.acompanhamento.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record AcompanhamentoDetalheResponse(
    Long solicitacaoId,
    String tipoServico,
    String descricao,
    String endereco,
    LocalDate data,
    String horario,
    Long clienteId,
    String clienteNome,
    Long prestadorId,
    String prestadorNome,
    BigDecimal valorAceito,
    String statusSolicitacao,
    Long ordemServicoId,
    String etapa,
    String codigoVerificacao,
    OffsetDateTime codigoExpiraEm,
    OffsetDateTime iniciadoEm,
    OffsetDateTime previstoTerminoEm,
    BigDecimal valorFinal,
    String metodoPagamento,
    String metodoPagamentoSelecionado,
    Short notaAvaliacao,
    String comentarioAvaliacao,
    Short notaAvaliacaoPrestador,
    String comentarioAvaliacaoPrestador,
    Integer percentualConcluido,
    String observacaoReagendamento,
    OffsetDateTime identidadeVerificadaEm,
    Double identidadeSimilaridade,
    boolean verificacaoFacialObrigatoria,
    List<AtualizacaoServicoResponse> atualizacoes
) {
}
