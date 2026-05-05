package com.servnow.backend.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.servnow.backend.auth.dto.AuthRequest;
import com.servnow.backend.auth.dto.AuthResponse;
import com.servnow.backend.auth.dto.RegisterRequest;
import com.servnow.backend.security.JwtService;
import com.servnow.backend.usuario.domain.TipoUsuario;
import com.servnow.backend.usuario.domain.Usuario;
import com.servnow.backend.usuario.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void cadastrarCriaUsuarioComEmailNormalizadoSenhaCriptografadaEToken() {
        RegisterRequest request = new RegisterRequest(" Maria ", "MARIA@EMAIL.COM ", "123456", "cliente");
        Usuario salvo = usuario(1L, "Maria", "maria@email.com", "hash", TipoUsuario.CLIENTE);

        when(usuarioRepository.existsByEmail("maria@email.com")).thenReturn(false);
        when(passwordEncoder.encode("123456")).thenReturn("hash");
        when(usuarioRepository.save(org.mockito.ArgumentMatchers.any(Usuario.class))).thenReturn(salvo);
        when(jwtService.gerarToken(salvo)).thenReturn("token");

        AuthResponse response = authService.cadastrar(request);

        ArgumentCaptor<Usuario> usuarioCaptor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(usuarioCaptor.capture());
        Usuario usuarioParaSalvar = usuarioCaptor.getValue();

        assertThat(usuarioParaSalvar.getNome()).isEqualTo("Maria");
        assertThat(usuarioParaSalvar.getEmail()).isEqualTo("maria@email.com");
        assertThat(usuarioParaSalvar.getSenha()).isEqualTo("hash");
        assertThat(usuarioParaSalvar.getTipoUsuario()).isEqualTo(TipoUsuario.CLIENTE);
        assertThat(response.token()).isEqualTo("token");
        assertThat(response.mensagem()).isEqualTo("Usuario cadastrado com sucesso.");
    }

    @Test
    void cadastrarRecusaEmailJaExistente() {
        RegisterRequest request = new RegisterRequest("Maria", "maria@email.com", "123456", "cliente");
        when(usuarioRepository.existsByEmail("maria@email.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.cadastrar(request))
            .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT)
            );

        verify(usuarioRepository, never()).save(org.mockito.ArgumentMatchers.any(Usuario.class));
    }

    @Test
    void loginRetornaTokenQuandoCredenciaisSaoValidas() {
        AuthRequest request = new AuthRequest("maria@email.com", "123456", "cliente");
        Usuario usuario = usuario(1L, "Maria", "maria@email.com", "hash", TipoUsuario.CLIENTE);

        when(usuarioRepository.findByEmail("maria@email.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("123456", "hash")).thenReturn(true);
        when(jwtService.gerarToken(usuario)).thenReturn("token");

        AuthResponse response = authService.login(request);

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.email()).isEqualTo("maria@email.com");
        assertThat(response.tipoUsuario()).isEqualTo("CLIENTE");
        assertThat(response.token()).isEqualTo("token");
        assertThat(response.mensagem()).isEqualTo("Login realizado com sucesso.");
    }

    @Test
    void loginRecusaTipoUsuarioDiferente() {
        AuthRequest request = new AuthRequest("maria@email.com", "123456", "prestador");
        Usuario usuario = usuario(1L, "Maria", "maria@email.com", "hash", TipoUsuario.CLIENTE);

        when(usuarioRepository.findByEmail("maria@email.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("123456", "hash")).thenReturn(true);

        assertThatThrownBy(() -> authService.login(request))
            .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED)
            );
    }

    private Usuario usuario(Long id, String nome, String email, String senha, TipoUsuario tipoUsuario) {
        Usuario usuario = new Usuario();
        usuario.setId(id);
        usuario.setNome(nome);
        usuario.setEmail(email);
        usuario.setSenha(senha);
        usuario.setTipoUsuario(tipoUsuario);
        return usuario;
    }
}
