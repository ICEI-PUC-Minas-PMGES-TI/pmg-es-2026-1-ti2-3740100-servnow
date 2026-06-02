package com.servnow.backend.verificacaofacial.service;

import java.time.OffsetDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
import com.servnow.backend.verificacaofacial.dto.VerificacaoFacialResponse;
import com.servnow.backend.verificacaofacial.repository.VerificacaoFacialAuditoriaRepository;

@Service
public class VerificacaoFacialService {

    private final FaceVerificationProperties properties;
    private final ComparadorFacial comparadorFacial;
    private final SolicitacaoServicoRepository solicitacaoRepository;
    private final OrdemServicoRepository ordemRepository;
    private final UsuarioRepository usuarioRepository;
    private final VerificacaoFacialAuditoriaRepository auditoriaRepository;

    public VerificacaoFacialService(
        FaceVerificationProperties properties,
        ComparadorFacial comparadorFacial,
        SolicitacaoServicoRepository solicitacaoRepository,
        OrdemServicoRepository ordemRepository,
        UsuarioRepository usuarioRepository,
        VerificacaoFacialAuditoriaRepository auditoriaRepository
    ) {
        this.properties = properties;
        this.comparadorFacial = comparadorFacial;
        this.solicitacaoRepository = solicitacaoRepository;
        this.ordemRepository = ordemRepository;
        this.usuarioRepository = usuarioRepository;
        this.auditoriaRepository = auditoriaRepository;
    }

    @Transactional
    public VerificacaoFacialResponse verificarIdentidade(
        Long solicitacaoId,
        UsuarioAutenticado usuarioAutenticado,
        RegistrarVerificacaoFacialRequest request
    ) {
        if (!properties.enabled()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Verificacao facial desabilitada.");
        }

        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        if (usuario.getTipoUsuario() != TipoUsuario.PRESTADOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Somente o prestador pode verificar a identidade.");
        }

        SolicitacaoServico solicitacao = buscarSolicitacaoParticipante(solicitacaoId, usuario);
        if (solicitacao.getPrestador() == null || !solicitacao.getPrestador().getId().equals(usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a este acompanhamento.");
        }

        String fotoPerfil = usuario.getFotoPerfilArquivoRelativo();
        if (fotoPerfil == null || fotoPerfil.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Cadastre uma foto de perfil com o rosto visivel antes de confirmar a chegada."
            );
        }

        OrdemServico ordem = ordemRepository.findWithDetalhesBySolicitacaoId(solicitacaoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Inicie o acompanhamento antes da verificacao."));
        if (ordem.getEtapa() != EtapaOrdemServico.AGUARDANDO_CHEGADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A verificacao facial so e necessaria antes da chegada.");
        }

        ResultadoComparacao resultado = comparadorFacial.comparar(request.similaridade());
        registrarAuditoria(ordem, resultado);

        if (!resultado.aprovado()) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, resultado.mensagem());
        }

        OffsetDateTime agora = OffsetDateTime.now();
        ordem.setIdentidadeVerificadaEm(agora);
        ordem.setIdentidadeSimilaridade(resultado.similaridade());
        ordemRepository.save(ordem);

        return new VerificacaoFacialResponse(true, resultado.similaridade(), resultado.mensagem(), agora);
    }

    public void exigirVerificacaoFacial(OrdemServico ordem) {
        if (!properties.enabled()) {
            return;
        }
        if (ordem.getIdentidadeVerificadaEm() == null) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Confirme sua identidade com a verificacao facial antes de informar o codigo de chegada."
            );
        }
    }

    public void limparVerificacao(OrdemServico ordem) {
        ordem.setIdentidadeVerificadaEm(null);
        ordem.setIdentidadeSimilaridade(null);
    }

    private void registrarAuditoria(OrdemServico ordem, ResultadoComparacao resultado) {
        VerificacaoFacialAuditoria auditoria = new VerificacaoFacialAuditoria();
        auditoria.setOrdemServico(ordem);
        auditoria.setSimilaridade(resultado.similaridade());
        auditoria.setAprovado(resultado.aprovado());
        auditoriaRepository.save(auditoria);
    }

    private SolicitacaoServico buscarSolicitacaoParticipante(Long solicitacaoId, Usuario usuario) {
        SolicitacaoServico solicitacao = solicitacaoRepository.findById(solicitacaoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitacao nao encontrada."));
        boolean participante = switch (usuario.getTipoUsuario()) {
            case PRESTADOR -> solicitacao.getPrestador() != null
                && solicitacao.getPrestador().getId().equals(usuario.getId());
            default -> false;
        };
        if (!participante) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a este acompanhamento.");
        }
        return solicitacao;
    }

    private Usuario encontrarUsuario(UsuarioAutenticado usuarioAutenticado) {
        if (usuarioAutenticado == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Nao autenticado.");
        }
        return usuarioRepository.findById(usuarioAutenticado.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado."));
    }
}
