package com.servnow.backend.security;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

public class UsuarioAutenticado extends User {

    private final Long id;
    private final String nome;
    private final String email;
    private final String tipoUsuario;

    public UsuarioAutenticado(
        Long id,
        String nome,
        String email,
        String senha,
        String tipoUsuario,
        Collection<? extends GrantedAuthority> authorities
    ) {
        super(email, senha, authorities);
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.tipoUsuario = tipoUsuario;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    public String getTipoUsuario() {
        return tipoUsuario;
    }
}
