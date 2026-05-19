package com.servnow.backend.usuario.domain;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, unique = true, length = 160)
    private String email;

    @Column(nullable = false, length = 255)
    private String senha;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_usuario", nullable = false, length = 20)
    private TipoUsuario tipoUsuario;

    @Column(name = "criado_em", nullable = false)
    private OffsetDateTime criadoEm;

    // ===== Campos do perfil do cliente =====
    @Column(length = 200)
    private String rua;

    @Column(length = 20)
    private String numero;

    @Column(length = 20)
    private String cep;

    @Column(length = 100)
    private String complemento;

    @Column(length = 100)
    private String bairro;

    @Column(length = 100)
    private String cidade;

    @Column(length = 2)
    private String estado;

    @Column(name = "foto_perfil_arquivo", length = 255)
    private String fotoPerfilArquivoRelativo;

    @Column(name = "foto_perfil_ajuste_x")
    private Integer fotoPerfilAjusteX;

    @Column(name = "foto_perfil_ajuste_y")
    private Integer fotoPerfilAjusteY;

    @Column(name = "foto_perfil_enquadramento", length = 20)
    private String fotoPerfilEnquadramento;

    @Column(name = "foto_local_arquivo", length = 255)
    private String fotoLocalArquivoRelativo;

    // ===== Campos do perfil do prestador =====
    @Column(name = "descricao_profissional", length = 500)
    private String descricaoProfissional;

    @Column(length = 255)
    private String especialidades;

    @Column(name = "dias_disponiveis", length = 120)
    private String diasDisponiveis;

    @Column(name = "horario_inicio", length = 5)
    private String horarioInicio;

    @Column(name = "horario_fim", length = 5)
    private String horarioFim;

    @Column(name = "raio_atendimento_km")
    private Integer raioAtendimentoKm;

    @Column(name = "documento_identidade_arquivo", length = 255)
    private String documentoIdentidadeArquivoRelativo;

    @PrePersist
    public void prePersist() {
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

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public TipoUsuario getTipoUsuario() {
        return tipoUsuario;
    }

    public void setTipoUsuario(TipoUsuario tipoUsuario) {
        this.tipoUsuario = tipoUsuario;
    }

    public OffsetDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(OffsetDateTime criadoEm) {
        this.criadoEm = criadoEm;
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

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
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

    public String getFotoPerfilArquivoRelativo() {
        return fotoPerfilArquivoRelativo;
    }

    public void setFotoPerfilArquivoRelativo(String fotoPerfilArquivoRelativo) {
        this.fotoPerfilArquivoRelativo = fotoPerfilArquivoRelativo;
    }

    public Integer getFotoPerfilAjusteX() {
        return fotoPerfilAjusteX;
    }

    public void setFotoPerfilAjusteX(Integer fotoPerfilAjusteX) {
        this.fotoPerfilAjusteX = fotoPerfilAjusteX;
    }

    public Integer getFotoPerfilAjusteY() {
        return fotoPerfilAjusteY;
    }

    public void setFotoPerfilAjusteY(Integer fotoPerfilAjusteY) {
        this.fotoPerfilAjusteY = fotoPerfilAjusteY;
    }

    public String getFotoPerfilEnquadramento() {
        return fotoPerfilEnquadramento;
    }

    public void setFotoPerfilEnquadramento(String fotoPerfilEnquadramento) {
        this.fotoPerfilEnquadramento = fotoPerfilEnquadramento;
    }

    public String getFotoLocalArquivoRelativo() {
        return fotoLocalArquivoRelativo;
    }

    public void setFotoLocalArquivoRelativo(String fotoLocalArquivoRelativo) {
        this.fotoLocalArquivoRelativo = fotoLocalArquivoRelativo;
    }

    public String getDescricaoProfissional() {
        return descricaoProfissional;
    }

    public void setDescricaoProfissional(String descricaoProfissional) {
        this.descricaoProfissional = descricaoProfissional;
    }

    public String getEspecialidades() {
        return especialidades;
    }

    public void setEspecialidades(String especialidades) {
        this.especialidades = especialidades;
    }

    public String getDiasDisponiveis() {
        return diasDisponiveis;
    }

    public void setDiasDisponiveis(String diasDisponiveis) {
        this.diasDisponiveis = diasDisponiveis;
    }

    public String getHorarioInicio() {
        return horarioInicio;
    }

    public void setHorarioInicio(String horarioInicio) {
        this.horarioInicio = horarioInicio;
    }

    public String getHorarioFim() {
        return horarioFim;
    }

    public void setHorarioFim(String horarioFim) {
        this.horarioFim = horarioFim;
    }

    public Integer getRaioAtendimentoKm() {
        return raioAtendimentoKm;
    }

    public void setRaioAtendimentoKm(Integer raioAtendimentoKm) {
        this.raioAtendimentoKm = raioAtendimentoKm;
    }

    public String getDocumentoIdentidadeArquivoRelativo() {
        return documentoIdentidadeArquivoRelativo;
    }

    public void setDocumentoIdentidadeArquivoRelativo(String documentoIdentidadeArquivoRelativo) {
        this.documentoIdentidadeArquivoRelativo = documentoIdentidadeArquivoRelativo;
    }
}
