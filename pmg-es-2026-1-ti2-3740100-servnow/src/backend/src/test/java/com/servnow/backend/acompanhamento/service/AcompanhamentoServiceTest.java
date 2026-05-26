package com.servnow.backend.acompanhamento.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import com.servnow.backend.ArmazenamentoImagens.ArquivoStorage;
import com.servnow.backend.acompanhamento.domain.EtapaOrdemServico;
import com.servnow.backend.acompanhamento.domain.OrdemServico;
import com.servnow.backend.acompanhamento.dto.ConfirmarChegadaRequest;
import com.servnow.backend.acompanhamento.repository.AtualizacaoServicoRepository;
import com.servnow.backend.acompanhamento.repository.OrdemServicoRepository;
import com.servnow.backend.security.UsuarioAutenticado;
import com.servnow.backend.solicitacao.domain.SolicitacaoServico;
import com.servnow.backend.solicitacao.domain.StatusSolicitacao;
import com.servnow.backend.solicitacao.repository.SolicitacaoServicoRepository;
import com.servnow.backend.usuario.domain.TipoUsuario;
import com.servnow.backend.usuario.domain.Usuario;
import com.servnow.backend.usuario.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class AcompanhamentoServiceTest {

    @Mock
    private SolicitacaoServicoRepository solicitacaoRepository;

    @Mock
    private OrdemServicoRepository ordemRepository;

    @Mock
    private AtualizacaoServicoRepository atualizacaoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private ArquivoStorage arquivoStorage;

    @InjectMocks
    private AcompanhamentoService acompanhamentoService;

    @Test
    void confirmarChegadaRecusaCodigoInvalido() {
        Usuario prestador = usuario(10L, TipoUsuario.PRESTADOR);
        Usuario cliente = usuario(1L, TipoUsuario.CLIENTE);
        SolicitacaoServico solicitacao = solicitacaoAgendada(cliente, prestador, 100L);
        OrdemServico ordem = ordem(solicitacao, "1234");

        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(prestador));
        when(solicitacaoRepository.findById(100L)).thenReturn(Optional.of(solicitacao));
        when(ordemRepository.findWithDetalhesBySolicitacaoId(100L)).thenReturn(Optional.of(ordem));

        assertThatThrownBy(() -> acompanhamentoService.confirmarChegada(
            100L,
            usuarioAutenticado(10L, TipoUsuario.PRESTADOR),
            new ConfirmarChegadaRequest("9999")
        ))
            .isInstanceOf(ResponseStatusException.class)
            .satisfies(ex -> assertThat(((ResponseStatusException) ex).getReason())
                .isEqualTo("Codigo de verificacao invalido."));
    }

    @Test
    void confirmarChegadaAvancaParaEmAndamento() {
        Usuario prestador = usuario(10L, TipoUsuario.PRESTADOR);
        Usuario cliente = usuario(1L, TipoUsuario.CLIENTE);
        SolicitacaoServico solicitacao = solicitacaoAgendada(cliente, prestador, 100L);
        OrdemServico ordem = ordem(solicitacao, "4823");

        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(prestador));
        when(solicitacaoRepository.findById(100L)).thenReturn(Optional.of(solicitacao));
        when(ordemRepository.findWithDetalhesBySolicitacaoId(100L)).thenReturn(Optional.of(ordem));
        when(ordemRepository.save(any(OrdemServico.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = acompanhamentoService.confirmarChegada(
            100L,
            usuarioAutenticado(10L, TipoUsuario.PRESTADOR),
            new ConfirmarChegadaRequest("4823")
        );

        assertThat(response.etapa()).isEqualTo("EM_ANDAMENTO");
        assertThat(ordem.getEtapa()).isEqualTo(EtapaOrdemServico.EM_ANDAMENTO);
        assertThat(ordem.getIniciadoEm()).isNotNull();
    }

    @Test
    void confirmarChegadaNegadoParaCliente() {
        Usuario cliente = usuario(1L, TipoUsuario.CLIENTE);
        Usuario prestador = usuario(10L, TipoUsuario.PRESTADOR);
        SolicitacaoServico solicitacao = solicitacaoAgendada(cliente, prestador, 100L);

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(solicitacaoRepository.findById(100L)).thenReturn(Optional.of(solicitacao));

        assertThatThrownBy(() -> acompanhamentoService.confirmarChegada(
            100L,
            usuarioAutenticado(1L, TipoUsuario.CLIENTE),
            new ConfirmarChegadaRequest("4823")
        ))
            .isInstanceOf(ResponseStatusException.class)
            .satisfies(ex -> assertThat(((ResponseStatusException) ex).getReason())
                .isEqualTo("Somente o prestador pode confirmar a chegada."));
    }

    @Test
    void acessoNegadoParaTerceiro() {
        Usuario outro = usuario(99L, TipoUsuario.CLIENTE);
        Usuario cliente = usuario(1L, TipoUsuario.CLIENTE);
        Usuario prestador = usuario(10L, TipoUsuario.PRESTADOR);
        SolicitacaoServico solicitacao = solicitacaoAgendada(cliente, prestador, 100L);

        when(usuarioRepository.findById(99L)).thenReturn(Optional.of(outro));
        when(solicitacaoRepository.findById(100L)).thenReturn(Optional.of(solicitacao));

        assertThatThrownBy(() -> acompanhamentoService.obterDetalhe(
            100L,
            usuarioAutenticado(99L, TipoUsuario.CLIENTE)
        ))
            .isInstanceOf(ResponseStatusException.class)
            .satisfies(ex -> assertThat(((ResponseStatusException) ex).getReason())
                .isEqualTo("Acesso negado a este acompanhamento."));
    }

    private static UsuarioAutenticado usuarioAutenticado(Long id, TipoUsuario tipo) {
        return new UsuarioAutenticado(id, "Usuario", "user@test.com", "hash", tipo.name(), List.of());
    }

    private static Usuario usuario(Long id, TipoUsuario tipo) {
        Usuario usuario = new Usuario();
        usuario.setId(id);
        usuario.setNome("Usuario " + id);
        usuario.setEmail("u" + id + "@test.com");
        usuario.setTipoUsuario(tipo);
        return usuario;
    }

    private static SolicitacaoServico solicitacaoAgendada(Usuario cliente, Usuario prestador, Long id) {
        SolicitacaoServico solicitacao = new SolicitacaoServico();
        solicitacao.setCliente(cliente);
        solicitacao.setPrestador(prestador);
        solicitacao.setTipoServico("ELETRICO");
        solicitacao.setFaixaPreco("ATE_150");
        solicitacao.setDescricao("Teste");
        solicitacao.setEndereco("Rua A, 1");
        solicitacao.setCep("30000-000");
        solicitacao.setRua("Rua A");
        solicitacao.setNumero("1");
        solicitacao.setBairro("Centro");
        solicitacao.setCidade("BH");
        solicitacao.setEstado("MG");
        solicitacao.setData(LocalDate.now());
        solicitacao.setHorario("14:00");
        solicitacao.setStatus(StatusSolicitacao.AGENDADA);
        solicitacao.setValorAceito(new BigDecimal("150.00"));
        try {
            var field = SolicitacaoServico.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(solicitacao, id);
        } catch (ReflectiveOperationException ignored) {
            // id opcional nos testes
        }
        return solicitacao;
    }

    private static OrdemServico ordem(SolicitacaoServico solicitacao, String codigo) {
        OrdemServico ordem = new OrdemServico();
        ordem.setSolicitacao(solicitacao);
        ordem.setEtapa(EtapaOrdemServico.AGUARDANDO_CHEGADA);
        ordem.setCodigoVerificacao(codigo);
        ordem.setCodigoExpiraEm(OffsetDateTime.now().plusMinutes(30));
        return ordem;
    }
}
