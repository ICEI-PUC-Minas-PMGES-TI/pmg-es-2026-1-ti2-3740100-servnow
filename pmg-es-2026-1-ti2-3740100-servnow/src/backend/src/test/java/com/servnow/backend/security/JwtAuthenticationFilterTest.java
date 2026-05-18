package com.servnow.backend.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private UsuarioDetailsService usuarioDetailsService;

    @AfterEach
    void limparContexto() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void autenticaUsandoXAuthorizationQuandoAuthorizationNaoTemBearerValido() throws Exception {
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtService, usuarioDetailsService);
        UsuarioAutenticado usuario = usuarioAutenticado();

        when(jwtService.extrairEmail("token-valido")).thenReturn("cliente@email.com");
        when(usuarioDetailsService.loadUserByUsername("cliente@email.com")).thenReturn(usuario);
        when(jwtService.tokenValido("token-valido", usuario)).thenReturn(true);

        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/solicitacoes");
        request.addHeader("Authorization", "Token malformado");
        request.addHeader("X-Authorization", "Bearer token-valido");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal()).isSameAs(usuario);
    }

    @Test
    void aceitaBearerSemDiferenciarMaiusculasMinusculas() throws Exception {
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtService, usuarioDetailsService);
        UsuarioAutenticado usuario = usuarioAutenticado();

        when(jwtService.extrairEmail("token-valido")).thenReturn("cliente@email.com");
        when(usuarioDetailsService.loadUserByUsername("cliente@email.com")).thenReturn(usuario);
        when(jwtService.tokenValido("token-valido", usuario)).thenReturn(true);

        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/solicitacoes");
        request.addHeader("Authorization", "bearer token-valido");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
    }

    private UsuarioAutenticado usuarioAutenticado() {
        return new UsuarioAutenticado(
            1L,
            "Cliente",
            "cliente@email.com",
            "hash",
            "CLIENTE",
            List.of(new SimpleGrantedAuthority("ROLE_CLIENTE"))
        );
    }
}
