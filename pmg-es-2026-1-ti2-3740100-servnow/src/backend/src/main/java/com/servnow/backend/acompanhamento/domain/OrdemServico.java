package com.servnow.backend.acompanhamento.domain;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import com.servnow.backend.solicitacao.domain.SolicitacaoServico;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "ordens_servico")
public class OrdemServico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "solicitacao_id", nullable = false, unique = true)
    private SolicitacaoServico solicitacao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private EtapaOrdemServico etapa;

    @Column(name = "codigo_verificacao", length = 4)
    private String codigoVerificacao;

    @Column(name = "codigo_expira_em")
    private OffsetDateTime codigoExpiraEm;

    @Column(name = "iniciado_em")
    private OffsetDateTime iniciadoEm;

    @Column(name = "previsto_termino_em")
    private OffsetDateTime previstoTerminoEm;

    @Column(name = "concluido_em")
    private OffsetDateTime concluidoEm;

    @Column(name = "valor_final", precision = 10, scale = 2)
    private BigDecimal valorFinal;

    @Column(name = "metodo_pagamento", length = 20)
    private String metodoPagamento;

    @Column(name = "metodo_pagamento_selecionado", length = 20)
    private String metodoPagamentoSelecionado;

    @Column(name = "nota_avaliacao")
    private Short notaAvaliacao;

    @Column(name = "comentario_avaliacao", length = 200)
    private String comentarioAvaliacao;

    @Column(name = "nota_avaliacao_prestador")
    private Short notaAvaliacaoPrestador;

    @Column(name = "comentario_avaliacao_prestador", length = 200)
    private String comentarioAvaliacaoPrestador;

    @Column(name = "percentual_concluido")
    private Integer percentualConcluido;

    @Column(name = "observacao_reagendamento", length = 300)
    private String observacaoReagendamento;

    @Column(name = "identidade_verificada_em")
    private OffsetDateTime identidadeVerificadaEm;

    @Column(name = "identidade_similaridade")
    private Double identidadeSimilaridade;

    @Column(name = "criado_em", nullable = false)
    private OffsetDateTime criadoEm;

    @OneToMany(mappedBy = "ordemServico", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AtualizacaoServico> atualizacoes = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (etapa == null) {
            etapa = EtapaOrdemServico.AGUARDANDO_CHEGADA;
        }
        if (criadoEm == null) {
            criadoEm = OffsetDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public SolicitacaoServico getSolicitacao() {
        return solicitacao;
    }

    public void setSolicitacao(SolicitacaoServico solicitacao) {
        this.solicitacao = solicitacao;
    }

    public EtapaOrdemServico getEtapa() {
        return etapa;
    }

    public void setEtapa(EtapaOrdemServico etapa) {
        this.etapa = etapa;
    }

    public String getCodigoVerificacao() {
        return codigoVerificacao;
    }

    public void setCodigoVerificacao(String codigoVerificacao) {
        this.codigoVerificacao = codigoVerificacao;
    }

    public OffsetDateTime getCodigoExpiraEm() {
        return codigoExpiraEm;
    }

    public void setCodigoExpiraEm(OffsetDateTime codigoExpiraEm) {
        this.codigoExpiraEm = codigoExpiraEm;
    }

    public OffsetDateTime getIniciadoEm() {
        return iniciadoEm;
    }

    public void setIniciadoEm(OffsetDateTime iniciadoEm) {
        this.iniciadoEm = iniciadoEm;
    }

    public OffsetDateTime getPrevistoTerminoEm() {
        return previstoTerminoEm;
    }

    public void setPrevistoTerminoEm(OffsetDateTime previstoTerminoEm) {
        this.previstoTerminoEm = previstoTerminoEm;
    }

    public OffsetDateTime getConcluidoEm() {
        return concluidoEm;
    }

    public void setConcluidoEm(OffsetDateTime concluidoEm) {
        this.concluidoEm = concluidoEm;
    }

    public BigDecimal getValorFinal() {
        return valorFinal;
    }

    public void setValorFinal(BigDecimal valorFinal) {
        this.valorFinal = valorFinal;
    }

    public String getMetodoPagamento() {
        return metodoPagamento;
    }

    public void setMetodoPagamento(String metodoPagamento) {
        this.metodoPagamento = metodoPagamento;
    }

    public String getMetodoPagamentoSelecionado() {
        return metodoPagamentoSelecionado;
    }

    public void setMetodoPagamentoSelecionado(String metodoPagamentoSelecionado) {
        this.metodoPagamentoSelecionado = metodoPagamentoSelecionado;
    }

    public Short getNotaAvaliacao() {
        return notaAvaliacao;
    }

    public void setNotaAvaliacao(Short notaAvaliacao) {
        this.notaAvaliacao = notaAvaliacao;
    }

    public String getComentarioAvaliacao() {
        return comentarioAvaliacao;
    }

    public void setComentarioAvaliacao(String comentarioAvaliacao) {
        this.comentarioAvaliacao = comentarioAvaliacao;
    }

    public Short getNotaAvaliacaoPrestador() {
        return notaAvaliacaoPrestador;
    }

    public void setNotaAvaliacaoPrestador(Short notaAvaliacaoPrestador) {
        this.notaAvaliacaoPrestador = notaAvaliacaoPrestador;
    }

    public String getComentarioAvaliacaoPrestador() {
        return comentarioAvaliacaoPrestador;
    }

    public void setComentarioAvaliacaoPrestador(String comentarioAvaliacaoPrestador) {
        this.comentarioAvaliacaoPrestador = comentarioAvaliacaoPrestador;
    }

    public Integer getPercentualConcluido() {
        return percentualConcluido;
    }

    public void setPercentualConcluido(Integer percentualConcluido) {
        this.percentualConcluido = percentualConcluido;
    }

    public String getObservacaoReagendamento() {
        return observacaoReagendamento;
    }

    public void setObservacaoReagendamento(String observacaoReagendamento) {
        this.observacaoReagendamento = observacaoReagendamento;
    }

    public OffsetDateTime getIdentidadeVerificadaEm() {
        return identidadeVerificadaEm;
    }

    public void setIdentidadeVerificadaEm(OffsetDateTime identidadeVerificadaEm) {
        this.identidadeVerificadaEm = identidadeVerificadaEm;
    }

    public Double getIdentidadeSimilaridade() {
        return identidadeSimilaridade;
    }

    public void setIdentidadeSimilaridade(Double identidadeSimilaridade) {
        this.identidadeSimilaridade = identidadeSimilaridade;
    }

    public OffsetDateTime getCriadoEm() {
        return criadoEm;
    }

    public List<AtualizacaoServico> getAtualizacoes() {
        return atualizacoes;
    }
}
