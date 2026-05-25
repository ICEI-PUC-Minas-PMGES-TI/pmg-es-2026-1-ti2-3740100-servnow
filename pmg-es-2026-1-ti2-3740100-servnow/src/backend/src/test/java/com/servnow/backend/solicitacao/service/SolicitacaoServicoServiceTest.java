package com.servnow.backend.solicitacao.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.servnow.backend.ArmazenamentoImagens.ArquivoStorage;
import com.servnow.backend.localizacao.DistanceService;
import com.servnow.backend.localizacao.GeoCoordinates;
import com.servnow.backend.localizacao.GeocodingService;
import com.servnow.backend.security.UsuarioAutenticado;
import com.servnow.backend.solicitacao.domain.SolicitacaoServico;
import com.servnow.backend.solicitacao.domain.StatusSolicitacao;
import com.servnow.backend.solicitacao.dto.SolicitacaoServicoCreateRequest;
import com.servnow.backend.solicitacao.dto.SolicitacaoServicoResponse;
import com.servnow.backend.solicitacao.repository.SolicitacaoServicoRepository;
import com.servnow.backend.usuario.domain.TipoUsuario;
import com.servnow.backend.usuario.domain.Usuario;
import com.servnow.backend.usuario.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class SolicitacaoServicoServiceTest {

    @Mock
    private SolicitacaoServicoRepository solicitacaoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private ArquivoStorage arquivoStorage;

    @Mock
    private GeocodingService geocodingService;

    @Mock
    private DistanceService distanceService;

    @InjectMocks
    private SolicitacaoServicoService solicitacaoService;

    @Test
    void criarSalvaSolicitacaoPertencenteAoClienteAutenticado() {
        Usuario cliente = usuario(1L, "Cliente Solicitacao", "cliente@email.com", TipoUsuario.CLIENTE);
        SolicitacaoServicoCreateRequest request = request("Eletrica", "Trocar tomada");

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(geocodingService.geocode(any(SolicitacaoServico.class)))
            .thenReturn(Optional.of(new GeoCoordinates(-19.9167, -43.9345)));
        when(solicitacaoRepository.save(any(SolicitacaoServico.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SolicitacaoServicoResponse response = solicitacaoService.criar(usuarioAutenticadoCliente(), request, null);

        ArgumentCaptor<SolicitacaoServico> captor = ArgumentCaptor.forClass(SolicitacaoServico.class);
        verify(solicitacaoRepository).save(captor.capture());
        SolicitacaoServico solicitacaoSalva = captor.getValue();

        assertThat(solicitacaoSalva.getCliente()).isSameAs(cliente);
        assertThat(solicitacaoSalva.getCliente().getId()).isEqualTo(1L);
        assertThat(solicitacaoSalva.getTipoServico()).isEqualTo("ELETRICO");
        assertThat(solicitacaoSalva.getDescricao()).isEqualTo("Trocar tomada");
        assertThat(solicitacaoSalva.getStatus()).isEqualTo(StatusSolicitacao.PUBLICADO);
        assertThat(solicitacaoSalva.getEndereco()).isEqualTo("Rua A, 123, Apto 2 - Centro, Belo Horizonte - MG, CEP 30100-000");
        assertThat(solicitacaoSalva.getLatitude()).isEqualTo(-19.9167);
        assertThat(solicitacaoSalva.getLongitude()).isEqualTo(-43.9345);
        assertThat(response.clienteId()).isEqualTo(1L);
        assertThat(response.latitude()).isEqualTo(-19.9167);
        assertThat(response.longitude()).isEqualTo(-43.9345);
        assertThat(response.clienteNome()).isEqualTo("Cliente Solicitacao");
        assertThat(response.status()).isEqualTo("PUBLICADO");
    }

    @Test
    void listarDoClienteBuscaSomenteSolicitacoesDoClienteAutenticado() {
        Usuario cliente = usuario(1L, "Cliente Solicitacao", "cliente@email.com", TipoUsuario.CLIENTE);
        SolicitacaoServico primeira = solicitacao(cliente, "Eletrica", "Trocar tomada");
        SolicitacaoServico segunda = solicitacao(cliente, "Hidraulica", "Arrumar pia");

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(solicitacaoRepository.findByClienteIdOrderByCriadoEmDesc(1L))
            .thenReturn(List.of(primeira, segunda));

        List<SolicitacaoServicoResponse> response = solicitacaoService.listarDoCliente(usuarioAutenticadoCliente());

        verify(solicitacaoRepository).findByClienteIdOrderByCriadoEmDesc(1L);
        assertThat(response).hasSize(2);
        assertThat(response)
            .extracting(SolicitacaoServicoResponse::clienteId)
            .containsOnly(1L);
        assertThat(response)
            .extracting(SolicitacaoServicoResponse::tipoServico)
            .containsExactly("Eletrica", "Hidraulica");
    }

    @Test
    void criarRecusaQuandoUsuarioNaoFoiAutenticado() {
        assertThatThrownBy(() -> solicitacaoService.criar(null, request("Eletrica", "Trocar tomada"), null))
            .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED)
            );

        verify(solicitacaoRepository, never()).save(any(SolicitacaoServico.class));
    }

    @Test
    void criarRecusaUsuarioPrestador() {
        Usuario prestador = usuario(2L, "Prestador", "prestador@email.com", TipoUsuario.PRESTADOR);
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(prestador));

        assertThatThrownBy(() -> solicitacaoService.criar(usuarioAutenticadoCliente(), request("Pintura", "Pintar sala"), null))
            .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN)
            );

        verify(solicitacaoRepository, never()).save(any(SolicitacaoServico.class));
    }

    @Test
    void editarDoClienteAtualizaSolicitacaoERepublicaComoPublicada() {
        Usuario cliente = usuario(1L, "Cliente Solicitacao", "cliente@email.com", TipoUsuario.CLIENTE);
        SolicitacaoServico existente = solicitacao(cliente, "Hidraulica", "Arrumar pia");
        existente.setStatus(StatusSolicitacao.AGUARDANDO_PROPOSTAS);

        SolicitacaoServicoCreateRequest request = request("Pintura", "Pintar quarto");

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(solicitacaoRepository.findById(10L)).thenReturn(Optional.of(existente));
        when(solicitacaoRepository.save(any(SolicitacaoServico.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SolicitacaoServicoResponse response = solicitacaoService.editarDoCliente(10L, usuarioAutenticadoCliente(), request, null, false);

        assertThat(existente.getTipoServico()).isEqualTo("PINTURA");
        assertThat(existente.getDescricao()).isEqualTo("Pintar quarto");
        assertThat(existente.getStatus()).isEqualTo(StatusSolicitacao.PUBLICADO);
        assertThat(existente.getPrestador()).isNull();
        assertThat(existente.getAceitoEm()).isNull();
        assertThat(response.status()).isEqualTo("PUBLICADO");
        verify(solicitacaoRepository).save(existente);
    }

    @Test
    void editarDoClienteRecusaSolicitacaoAgendada() {
        Usuario cliente = usuario(1L, "Cliente Solicitacao", "cliente@email.com", TipoUsuario.CLIENTE);
        SolicitacaoServico existente = solicitacao(cliente, "Hidraulica", "Arrumar pia");
        existente.setStatus(StatusSolicitacao.AGENDADA);

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(solicitacaoRepository.findById(10L)).thenReturn(Optional.of(existente));

        assertThatThrownBy(() -> solicitacaoService.editarDoCliente(10L, usuarioAutenticadoCliente(), request("Pintura", "Pintar quarto"), null, false))
            .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                assertThat(exception.getReason()).isEqualTo("Nao e possivel editar uma solicitacao agendada.");
            });

        verify(solicitacaoRepository, never()).save(any(SolicitacaoServico.class));
    }

    @Test
    void excluirDoClienteRemoveSolicitacaoDoProprioCliente() {
        Usuario cliente = usuario(1L, "Cliente Solicitacao", "cliente@email.com", TipoUsuario.CLIENTE);
        SolicitacaoServico existente = solicitacao(cliente, "Hidraulica", "Arrumar pia");

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(solicitacaoRepository.findById(10L)).thenReturn(Optional.of(existente));
        when(solicitacaoRepository.deleteByIdAndClienteId(10L, 1L)).thenReturn(1L);

        solicitacaoService.excluirDoCliente(10L, usuarioAutenticadoCliente());

        verify(solicitacaoRepository, times(1)).deleteByIdAndClienteId(10L, 1L);
    }

    @Test
    void excluirDoClienteRetornaNotFoundQuandoSolicitacaoNaoExiste() {
        Usuario cliente = usuario(1L, "Cliente Solicitacao", "cliente@email.com", TipoUsuario.CLIENTE);
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(solicitacaoRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> solicitacaoService.excluirDoCliente(404L, usuarioAutenticadoCliente()))
            .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND)
            );

        verify(solicitacaoRepository, never()).deleteByIdAndClienteId(any(Long.class), any(Long.class));
    }

    @Test
    void editarDoClientePermiteTrocarImagem() {
        Usuario cliente = usuario(1L, "Cliente Solicitacao", "cliente@email.com", TipoUsuario.CLIENTE);
        SolicitacaoServico existente = solicitacao(cliente, "Hidraulica", "Arrumar pia");
        existente.setImagemArquivoRelativo("solicitacoes/antiga.jpg");

        SolicitacaoServicoCreateRequest request = request("Pintura", "Pintar quarto");
        MockMultipartFile imagemNova = new MockMultipartFile("imagem", "nova.jpg", "image/jpeg", "123".getBytes());

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(solicitacaoRepository.findById(11L)).thenReturn(Optional.of(existente));
        when(arquivoStorage.salvar(imagemNova)).thenReturn("solicitacoes/nova.jpg");
        when(solicitacaoRepository.save(any(SolicitacaoServico.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SolicitacaoServicoResponse response = solicitacaoService.editarDoCliente(11L, usuarioAutenticadoCliente(), request, imagemNova, false);

        assertThat(existente.getImagemArquivoRelativo()).isEqualTo("solicitacoes/nova.jpg");
        assertThat(response.imagemUrl()).endsWith("/imagem");
        verify(arquivoStorage).excluirSeExistir("solicitacoes/antiga.jpg");
    }

    private SolicitacaoServicoCreateRequest request(String tipoServico, String descricao) {
        return new SolicitacaoServicoCreateRequest(
            tipoServico,
            tipoServico,
            "DE_150_A_300",
            descricao,
            "30100-000",
            "Rua A",
            "123",
            "Apto 2",
            "Centro",
            "Belo Horizonte",
            "mg",
            LocalDate.of(2026, 5, 20),
            "14:00"
        );
    }

    private SolicitacaoServico solicitacao(Usuario cliente, String tipoServico, String descricao) {
        SolicitacaoServico solicitacao = new SolicitacaoServico();
        solicitacao.setCliente(cliente);
        solicitacao.setTipoServico(tipoServico);
        solicitacao.setFaixaPreco("R$ 100 a R$ 300");
        solicitacao.setDescricao(descricao);
        solicitacao.setCep("30100-000");
        solicitacao.setRua("Rua A");
        solicitacao.setNumero("123");
        solicitacao.setBairro("Centro");
        solicitacao.setCidade("Belo Horizonte");
        solicitacao.setEstado("MG");
        solicitacao.setEndereco("Rua A, 123 - Centro, Belo Horizonte - MG, CEP 30100-000");
        solicitacao.setStatus(StatusSolicitacao.AGUARDANDO_PROPOSTAS);
        return solicitacao;
    }

    private Usuario usuario(Long id, String nome, String email, TipoUsuario tipoUsuario) {
        Usuario usuario = new Usuario();
        usuario.setId(id);
        usuario.setNome(nome);
        usuario.setEmail(email);
        usuario.setSenha("hash");
        usuario.setTipoUsuario(tipoUsuario);
        return usuario;
    }

    private UsuarioAutenticado usuarioAutenticadoCliente() {
        return new UsuarioAutenticado(1L, "Cliente Solicitacao", "cliente@email.com", "hash", "CLIENTE", List.of());
    }
}
