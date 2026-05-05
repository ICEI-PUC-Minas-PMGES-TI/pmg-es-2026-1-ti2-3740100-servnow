package com.servnow.backend.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.User;

import com.servnow.backend.usuario.domain.TipoUsuario;
import com.servnow.backend.usuario.domain.Usuario;

class JwtServiceTest {

    private static final String SECRET = "servnow-jwt-secret-2026-servnow-jwt-secret";

    @Test
    void gerarTokenIncluiEmailDoUsuarioComoSubject() {
        JwtService jwtService = new JwtService(SECRET, 86400000);
        Usuario usuario = usuario();

        String token = jwtService.gerarToken(usuario);

        assertThat(jwtService.extrairEmail(token)).isEqualTo("maria@email.com");
    }

    @Test
    void tokenValidoRetornaTrueParaMesmoUsuarioENaoExpirado() {
        JwtService jwtService = new JwtService(SECRET, 86400000);
        String token = jwtService.gerarToken(usuario());
        UserDetails userDetails = User.withUsername("maria@email.com")
            .password("hash")
            .authorities("ROLE_CLIENTE")
            .build();

        assertThat(jwtService.tokenValido(token, userDetails)).isTrue();
    }

    private Usuario usuario() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setNome("Maria");
        usuario.setEmail("maria@email.com");
        usuario.setTipoUsuario(TipoUsuario.CLIENTE);
        return usuario;
    }
}
