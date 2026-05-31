package com.servnow.backend.proposta.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.servnow.backend.notificacao.service.NotificacaoService;
import com.servnow.backend.perfil.service.AvaliacaoService;
import com.servnow.backend.proposta.domain.PropostaServico;
import com.servnow.backend.proposta.domain.StatusProposta;
import com.servnow.backend.proposta.repository.PropostaServicoRepository;
import com.servnow.backend.security.UsuarioAutenticado;
import com.servnow.backend.solicitacao.domain.SolicitacaoServico;
import com.servnow.backend.solicitacao.domain.StatusSolicitacao;
import com.servnow.backend.solicitacao.repository.SolicitacaoServicoRepository;
import com.servnow.backend.usuario.domain.TipoUsuario;
import com.servnow.backend.usuario.domain.Usuario;
import com.servnow.backend.usuario.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class PropostaServicoServiceTest {

    @Mock
    private PropostaServicoRepository propostaRepository;

    @Mock
    private SolicitacaoServicoRepository solicitacaoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private NotificacaoService notificacaoService;

    @Mock
    private AvaliacaoService avaliacaoService;

    @InjectMocks
    private PropostaServicoService propostaService;

    @Test
    void aceitarPropostaCancelaDemaisPendentesDaMesmaSolicitacao() {
        Usuario cliente = usuario(1L, TipoUsuario.CLIENTE);
        Usuario prestadorAceito = usuario(10L, TipoUsuario.PRESTADOR);
        Usuario prestadorOutro = usuario(11L, TipoUsuario.PRESTADOR);
        SolicitacaoServico solicitacao = solicitacao(cliente, 100L);

        PropostaServico aceita = proposta(1L, solicitacao, prestadorAceito, StatusProposta.PENDENTE);
        PropostaServico outra = proposta(2L, solicitacao, prestadorOutro, StatusProposta.PENDENTE);

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(propostaRepository.findByIdAndSolicitacaoClienteId(1L, 1L)).thenReturn(Optional.of(aceita));
        when(propostaRepository.findBySolicitacaoIdAndStatus(100L, StatusProposta.PENDENTE))
            .thenReturn(List.of(aceita, outra));
        when(propostaRepository.save(any(PropostaServico.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(propostaRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(solicitacaoRepository.save(any(SolicitacaoServico.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = propostaService.aceitarProposta(1L, usuarioAutenticadoCliente());

        assertThat(response.status()).isEqualTo("ACEITA");
        assertThat(aceita.getStatus()).isEqualTo(StatusProposta.ACEITA);
        assertThat(outra.getStatus()).isEqualTo(StatusProposta.CANCELADA);
        assertThat(outra.getRespondidoEm()).isNotNull();
        assertThat(solicitacao.getStatus()).isEqualTo(StatusSolicitacao.AGENDADA);
        assertThat(solicitacao.getPrestador()).isSameAs(prestadorAceito);
        assertThat(solicitacao.getValorAceito()).isEqualByComparingTo(new BigDecimal("150.00"));

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<PropostaServico>> captor = ArgumentCaptor.forClass(List.class);
        verify(propostaRepository).saveAll(captor.capture());
        assertThat(captor.getValue()).containsExactly(outra);
        verify(propostaRepository).save(aceita);
        verify(solicitacaoRepository).save(solicitacao);
    }

    private static Usuario usuario(Long id, TipoUsuario tipo) {
        Usuario usuario = new Usuario();
        usuario.setId(id);
        usuario.setNome("Usuario " + id);
        usuario.setEmail("user" + id + "@email.com");
        usuario.setTipoUsuario(tipo);
        return usuario;
    }

    private static SolicitacaoServico solicitacao(Usuario cliente, Long id) {
        SolicitacaoServico solicitacao = new SolicitacaoServico();
        definirId(solicitacao, id);
        solicitacao.setCliente(cliente);
        solicitacao.setTipoServico("ELETRICO");
        solicitacao.setDescricao("Trocar tomada");
        solicitacao.setEndereco("Rua A, 123");
        solicitacao.setData(LocalDate.now().plusDays(2));
        solicitacao.setHorario("10:00");
        solicitacao.setStatus(StatusSolicitacao.AGUARDANDO_PROPOSTAS);
        return solicitacao;
    }

    private static PropostaServico proposta(
        Long id,
        SolicitacaoServico solicitacao,
        Usuario prestador,
        StatusProposta status
    ) {
        PropostaServico proposta = new PropostaServico();
        proposta.setSolicitacao(solicitacao);
        proposta.setPrestador(prestador);
        proposta.setValorProposto(new BigDecimal("150.00"));
        proposta.setMensagem("Proposta " + id);
        proposta.setStatus(status);
        definirId(proposta, id);
        return proposta;
    }

    private static void definirId(Object entidade, Long id) {
        try {
            var field = entidade.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(entidade, id);
        } catch (ReflectiveOperationException exception) {
            throw new IllegalStateException(exception);
        }
    }

    private static UsuarioAutenticado usuarioAutenticadoCliente() {
        return new UsuarioAutenticado(1L, "Cliente", "cliente@email.com", "hash", "CLIENTE", List.of());
    }
}
