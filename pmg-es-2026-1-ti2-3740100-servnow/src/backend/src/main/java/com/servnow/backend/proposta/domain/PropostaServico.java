package com.servnow.backend.proposta.domain;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import com.servnow.backend.solicitacao.domain.SolicitacaoServico;
import com.servnow.backend.usuario.domain.Usuario;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "propostas_servico",
    uniqueConstraints = @UniqueConstraint(name = "uk_proposta_solicitacao_prestador", columnNames = {"solicitacao_id", "prestador_id"})
)
public class PropostaServico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "solicitacao_id", nullable = false)
    private SolicitacaoServico solicitacao;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prestador_id", nullable = false)
    private Usuario prestador;

    @Column(name = "valor_proposto", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorProposto;

    @Column(name = "mensagem", nullable = false, length = 800)
    private String mensagem;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusProposta status;

    @Column(name = "criado_em", nullable = false)
    private OffsetDateTime criadoEm;

    @Column(name = "respondido_em")
    private OffsetDateTime respondidoEm;

    @PrePersist
    public void prePersist() {
        if (status == null) {
            status = StatusProposta.PENDENTE;
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

    public Usuario getPrestador() {
        return prestador;
    }

    public void setPrestador(Usuario prestador) {
        this.prestador = prestador;
    }

    public BigDecimal getValorProposto() {
        return valorProposto;
    }

    public void setValorProposto(BigDecimal valorProposto) {
        this.valorProposto = valorProposto;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }

    public StatusProposta getStatus() {
        return status;
    }

    public void setStatus(StatusProposta status) {
        this.status = status;
    }

    public OffsetDateTime getCriadoEm() {
        return criadoEm;
    }

    public OffsetDateTime getRespondidoEm() {
        return respondidoEm;
    }

    public void setRespondidoEm(OffsetDateTime respondidoEm) {
        this.respondidoEm = respondidoEm;
    }
}
