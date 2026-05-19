package com.servnow.backend.solicitacao.domain;

import java.time.LocalDate;
import java.time.OffsetDateTime;

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

    @Column(name = "tipo_servico", nullable = false, length = 80)
    private String tipoServico;

    @Column(name = "icone_servico", length = 80)
    private String iconeServico;

    @Column(name = "faixa_preco", nullable = false, length = 30)
    private String faixaPreco;

    @Column(nullable = false, length = 800)
    private String descricao;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String endereco;

    @Column(nullable = false, length = 20)
    private String cep;

    @Column(nullable = false, length = 200)
    private String rua;

    @Column(nullable = false, length = 20)
    private String numero;

    @Column(length = 100)
    private String complemento;

    @Column(nullable = false, length = 100)
    private String bairro;

    @Column(nullable = false, length = 100)
    private String cidade;

    @Column(nullable = false, length = 2)
    private String estado;

    @Column(name = "data_servico", nullable = false)
    private LocalDate data;

    @Column(name = "horario_servico", nullable = false, length = 5)
    private String horario;

    /**
     * Caminho relativo ao diretorio de upload (ex.: solicitacoes/uuid.jpg). Nulo quando nao ha foto.
     */
    @Column(name = "imagem_arquivo_relativo", length = 255)
    private String imagemArquivoRelativo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
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

    public Usuario getCliente() {
        return cliente;
    }

    public void setCliente(Usuario cliente) {
        this.cliente = cliente;
    }

    public Usuario getPrestador() {
        return prestador;
    }

    public void setPrestador(Usuario prestador) {
        this.prestador = prestador;
    }

    public String getTipoServico() {
        return tipoServico;
    }

    public void setTipoServico(String tipoServico) {
        this.tipoServico = tipoServico;
    }

    public String getIconeServico() {
        return iconeServico;
    }

    public void setIconeServico(String iconeServico) {
        this.iconeServico = iconeServico;
    }

    public String getFaixaPreco() {
        return faixaPreco;
    }

    public void setFaixaPreco(String faixaPreco) {
        this.faixaPreco = faixaPreco;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public String getRua() {
        return rua;
    }

    public void setRua(String rua) {
        this.rua = rua;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getComplemento() {
        return complemento;
    }

    public void setComplemento(String complemento) {
        this.complemento = complemento;
    }

    public String getBairro() {
        return bairro;
    }

    public void setBairro(String bairro) {
        this.bairro = bairro;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public String getHorario() {
        return horario;
    }

    public void setHorario(String horario) {
        this.horario = horario;
    }

    public String getImagemArquivoRelativo() {
        return imagemArquivoRelativo;
    }

    public void setImagemArquivoRelativo(String imagemArquivoRelativo) {
        this.imagemArquivoRelativo = imagemArquivoRelativo;
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

    public OffsetDateTime getAceitoEm() {
        return aceitoEm;
    }

    public void setAceitoEm(OffsetDateTime aceitoEm) {
        this.aceitoEm = aceitoEm;
    }
}
