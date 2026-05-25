package com.servnow.backend.perfil.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.servnow.backend.ArmazenamentoImagens.ArquivoStorage;
import com.servnow.backend.localizacao.GeocodingService;
import com.servnow.backend.perfil.dto.PerfilResponse;
import com.servnow.backend.perfil.dto.PerfilUpdateRequest;
import com.servnow.backend.security.UsuarioAutenticado;
import com.servnow.backend.usuario.domain.TipoUsuario;
import com.servnow.backend.usuario.domain.Usuario;
import com.servnow.backend.usuario.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class PerfilServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private ArquivoStorage arquivoStorage;

    @Mock
    private GeocodingService geocodingService;

    @InjectMocks
    private PerfilService perfilService;

    @Test
    void buscarRetornaDadosDoUsuarioAutenticado() {
        Usuario usuario = usuario(TipoUsuario.CLIENTE);
        usuario.setRua("Rua A");
        usuario.setCidade("Belo Horizonte");
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));

        PerfilResponse response = perfilService.buscar(usuarioAutenticado());

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.nome()).isEqualTo("Maria");
        assertThat(response.tipoUsuario()).isEqualTo("CLIENTE");
        assertThat(response.rua()).isEqualTo("Rua A");
        assertThat(response.cidade()).isEqualTo("Belo Horizonte");
    }

    @Test
    void buscarClienteRecusaUsuarioPrestador() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario(TipoUsuario.PRESTADOR)));

        assertThatThrownBy(() -> perfilService.buscarCliente(usuarioAutenticado()))
            .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN)
            );
    }

    @Test
    void atualizarClienteNormalizaCamposDeEndereco() {
        Usuario usuario = usuario(TipoUsuario.CLIENTE);
        PerfilUpdateRequest request = new PerfilUpdateRequest(
            " Maria Silva ",
            " Rua A ",
            " 123 ",
            " 30100-000 ",
            " Apto 301 ",
            " Centro ",
            " Belo Horizonte ",
            " mg ",
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        );

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(usuario)).thenReturn(usuario);

        PerfilResponse response = perfilService.atualizarCliente(usuarioAutenticado(), request, null, null, null);

        assertThat(response.nome()).isEqualTo("Maria Silva");
        assertThat(response.rua()).isEqualTo("Rua A");
        assertThat(response.numero()).isEqualTo("123");
        assertThat(response.complemento()).isEqualTo("Apto 301");
        assertThat(response.estado()).isEqualTo("MG");
    }

    @Test
    void atualizarPrestadorExigeDocumentoQuandoNaoHaArquivoSalvo() {
        Usuario usuario = usuario(TipoUsuario.PRESTADOR);
        PerfilUpdateRequest request = new PerfilUpdateRequest(
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            "SEGUNDA",
            "08:00",
            "17:00",
            10
        );

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));

        assertThatThrownBy(() -> perfilService.atualizarPrestador(usuarioAutenticado(), request, null, null, null))
            .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST)
            );
    }

    private Usuario usuario(TipoUsuario tipoUsuario) {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setNome("Maria");
        usuario.setEmail("maria@email.com");
        usuario.setSenha("hash");
        usuario.setTipoUsuario(tipoUsuario);
        return usuario;
    }

    private UsuarioAutenticado usuarioAutenticado() {
        return new UsuarioAutenticado(1L, "Maria", "maria@email.com", "hash", "CLIENTE", java.util.List.of());
    }
}
