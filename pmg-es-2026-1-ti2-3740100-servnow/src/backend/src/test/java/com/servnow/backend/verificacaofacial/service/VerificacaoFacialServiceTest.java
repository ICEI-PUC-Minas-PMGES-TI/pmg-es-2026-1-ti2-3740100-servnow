package com.servnow.backend.verificacaofacial.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import com.servnow.backend.acompanhamento.domain.EtapaOrdemServico;
import com.servnow.backend.acompanhamento.domain.OrdemServico;
import com.servnow.backend.acompanhamento.repository.OrdemServicoRepository;
import com.servnow.backend.security.UsuarioAutenticado;
import com.servnow.backend.solicitacao.domain.SolicitacaoServico;
import com.servnow.backend.solicitacao.repository.SolicitacaoServicoRepository;
import com.servnow.backend.usuario.domain.TipoUsuario;
import com.servnow.backend.usuario.domain.Usuario;
import com.servnow.backend.usuario.repository.UsuarioRepository;
import com.servnow.backend.verificacaofacial.ComparadorFacial;
import com.servnow.backend.verificacaofacial.FaceVerificationProperties;
import com.servnow.backend.verificacaofacial.ResultadoComparacao;
import com.servnow.backend.verificacaofacial.domain.VerificacaoFacialAuditoria;
import com.servnow.backend.verificacaofacial.dto.RegistrarVerificacaoFacialRequest;
import com.servnow.backend.verificacaofacial.repository.VerificacaoFacialAuditoriaRepository;

@ExtendWith(MockitoExtension.class)
class VerificacaoFacialServiceTest {

    @Mock
    private ComparadorFacial comparadorFacial;

    @Mock
    private SolicitacaoServicoRepository solicitacaoRepository;

    @Mock
    private OrdemServicoRepository ordemRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private VerificacaoFacialAuditoriaRepository auditoriaRepository;

    private VerificacaoFacialService service;

    @BeforeEach
    void setUp() {
        service = new VerificacaoFacialService(
            new FaceVerificationProperties(true, 55),
            comparadorFacial,
            solicitacaoRepository,
            ordemRepository,
            usuarioRepository,
            auditoriaRepository
        );
    }

    @Test
    void verificarIdentidadeAprovaQuandoSimilaridadeSuficiente() {
        Usuario prestador = prestadorComFoto();
        SolicitacaoServico solicitacao = solicitacao(prestador);
        OrdemServico ordem = ordemAguardandoChegada(solicitacao);

        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(prestador));
        when(solicitacaoRepository.findById(100L)).thenReturn(Optional.of(solicitacao));
        when(ordemRepository.findWithDetalhesBySolicitacaoId(100L)).thenReturn(Optional.of(ordem));
        when(comparadorFacial.comparar(72.5)).thenReturn(
            new ResultadoComparacao(true, 72.5, "Identidade verificada com sucesso.")
        );
        when(ordemRepository.save(any(OrdemServico.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.verificarIdentidade(
            100L,
            autenticado(10L, TipoUsuario.PRESTADOR),
            new RegistrarVerificacaoFacialRequest(72.5)
        );

        assertThat(response.aprovado()).isTrue();
        assertThat(response.similaridade()).isEqualTo(72.5);
        assertThat(ordem.getIdentidadeVerificadaEm()).isNotNull();
        assertThat(ordem.getIdentidadeSimilaridade()).isEqualTo(72.5);

        ArgumentCaptor<VerificacaoFacialAuditoria> captor = ArgumentCaptor.forClass(VerificacaoFacialAuditoria.class);
        verify(auditoriaRepository).save(captor.capture());
        assertThat(captor.getValue().isAprovado()).isTrue();
    }

    @Test
    void verificarIdentidadeRejeitaQuandoComparadorNega() {
        Usuario prestador = prestadorComFoto();
        SolicitacaoServico solicitacao = solicitacao(prestador);
        OrdemServico ordem = ordemAguardandoChegada(solicitacao);

        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(prestador));
        when(solicitacaoRepository.findById(100L)).thenReturn(Optional.of(solicitacao));
        when(ordemRepository.findWithDetalhesBySolicitacaoId(100L)).thenReturn(Optional.of(ordem));
        when(comparadorFacial.comparar(30.0)).thenReturn(
            new ResultadoComparacao(false, 30.0, "Rosto nao corresponde suficientemente a foto de perfil.")
        );

        assertThatThrownBy(() -> service.verificarIdentidade(
            100L,
            autenticado(10L, TipoUsuario.PRESTADOR),
            new RegistrarVerificacaoFacialRequest(30.0)
        ))
            .isInstanceOf(ResponseStatusException.class)
            .satisfies(ex -> assertThat(((ResponseStatusException) ex).getReason())
                .contains("Rosto nao corresponde"));
    }

    @Test
    void exigirVerificacaoFacialBloqueiaSemVerificacao() {
        OrdemServico ordem = new OrdemServico();

        assertThatThrownBy(() -> service.exigirVerificacaoFacial(ordem))
            .isInstanceOf(ResponseStatusException.class)
            .satisfies(ex -> assertThat(((ResponseStatusException) ex).getReason())
                .contains("verificacao facial"));
    }

    private static UsuarioAutenticado autenticado(Long id, TipoUsuario tipo) {
        return new UsuarioAutenticado(id, "Prestador", "p@test.com", "hash", tipo.name(), java.util.List.of());
    }

    private static Usuario prestadorComFoto() {
        Usuario usuario = new Usuario();
        usuario.setId(10L);
        usuario.setNome("Prestador");
        usuario.setEmail("p@test.com");
        usuario.setTipoUsuario(TipoUsuario.PRESTADOR);
        usuario.setFotoPerfilArquivoRelativo("perfil/foto.jpg");
        return usuario;
    }

    private static SolicitacaoServico solicitacao(Usuario prestador) {
        Usuario cliente = new Usuario();
        cliente.setId(1L);
        cliente.setNome("Cliente");

        SolicitacaoServico solicitacao = new SolicitacaoServico();
        solicitacao.setCliente(cliente);
        solicitacao.setPrestador(prestador);
        return solicitacao;
    }

    private static OrdemServico ordemAguardandoChegada(SolicitacaoServico solicitacao) {
        OrdemServico ordem = new OrdemServico();
        ordem.setSolicitacao(solicitacao);
        ordem.setEtapa(EtapaOrdemServico.AGUARDANDO_CHEGADA);
        return ordem;
    }
}
