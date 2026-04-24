package com.servnow.backend.serviceorder;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;

import com.servnow.backend.user.Usuario;

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

@Entity
@Table(name = "solicitacoes_servico")
public class SolicitacaoServico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Usuario cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prestador_id")
    private Usuario prestador;

    @Column(nullable = false, length = 200)
    private String endereco;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_servico", nullable = false, length = 30)
    private TipoServico tipoServico;

    @Enumerated(EnumType.STRING)
    @Column(name = "faixa_preco", nullable = false, length = 30)
    private FaixaPreco faixaPreco;

    @Column(nullable = false, length = 1000)
    private String descricao;

    @Column(name = "data_servico", nullable = false)
    private LocalDate data;

    @Column(name = "horario_servico", nullable = false)
    private LocalTime horario;

    @Column(name = "imagem_base64", length = 200000)
    private String imagemBase64;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusSolicitacao status;

    @Column(name = "criado_em", nullable = false)
    private OffsetDateTime criadoEm;

    @Column(name = "aceito_em")
    private OffsetDateTime aceitoEm;

    @PrePersist
    public void prePersist() {
        if (status == null) {
            status = StatusSolicitacao.PUBLICADO;
        }

        if (criadoEm == null) {
            criadoEm = OffsetDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getCliente() {
        return cliente;
    }

    public void setCliente(Usuario cliente) {
        this.cliente = cliente;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public TipoServico getTipoServico() {
        return tipoServico;
    }

    public void setTipoServico(TipoServico tipoServico) {
        this.tipoServico = tipoServico;
    }

    public FaixaPreco getFaixaPreco() {
        return faixaPreco;
    }

    public void setFaixaPreco(FaixaPreco faixaPreco) {
        this.faixaPreco = faixaPreco;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public LocalTime getHorario() {
        return horario;
    }

    public void setHorario(LocalTime horario) {
        this.horario = horario;
    }

    public String getImagemBase64() {
        return imagemBase64;
    }

    public void setImagemBase64(String imagemBase64) {
        this.imagemBase64 = imagemBase64;
    }

    public StatusSolicitacao getStatus() {
        return status;
    }

    public void setStatus(StatusSolicitacao status) {
        this.status = status;
    }

    public OffsetDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(OffsetDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }

    public Usuario getPrestador() {
        return prestador;
    }

    public void setPrestador(Usuario prestador) {
        this.prestador = prestador;
    }

    public OffsetDateTime getAceitoEm() {
        return aceitoEm;
    }

    public void setAceitoEm(OffsetDateTime aceitoEm) {
        this.aceitoEm = aceitoEm;
    }
}
