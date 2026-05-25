package com.servnow.backend.proposta.service;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.servnow.backend.proposta.domain.PropostaServico;
import com.servnow.backend.proposta.domain.StatusProposta;
import com.servnow.backend.proposta.dto.PropostaCreateRequest;
import com.servnow.backend.proposta.dto.PropostaServicoResponse;
import com.servnow.backend.proposta.repository.PropostaServicoRepository;
import com.servnow.backend.security.UsuarioAutenticado;
import com.servnow.backend.solicitacao.domain.SolicitacaoServico;
import com.servnow.backend.solicitacao.domain.StatusSolicitacao;
import com.servnow.backend.solicitacao.repository.SolicitacaoServicoRepository;
import com.servnow.backend.usuario.domain.TipoUsuario;
import com.servnow.backend.usuario.domain.Usuario;
import com.servnow.backend.usuario.repository.UsuarioRepository;

@Service
public class PropostaServicoService {

    private final PropostaServicoRepository propostaRepository;
    private final SolicitacaoServicoRepository solicitacaoRepository;
    private final UsuarioRepository usuarioRepository;

    public PropostaServicoService(
        PropostaServicoRepository propostaRepository,
        SolicitacaoServicoRepository solicitacaoRepository,
        UsuarioRepository usuarioRepository
    ) {
        this.propostaRepository = propostaRepository;
        this.solicitacaoRepository = solicitacaoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public PropostaServicoResponse enviarProposta(UsuarioAutenticado usuarioAutenticado, PropostaCreateRequest request) {
        Usuario prestador = encontrarUsuario(usuarioAutenticado);
        validarTipo(prestador, TipoUsuario.PRESTADOR);

        SolicitacaoServico solicitacao = solicitacaoRepository.findById(request.solicitacaoId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitacao nao encontrada."));

        if (solicitacao.getStatus() == StatusSolicitacao.AGENDADA || solicitacao.getStatus() == StatusSolicitacao.CONCLUIDA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Esta solicitacao nao aceita novas propostas.");
        }

        PropostaServico proposta = propostaRepository
            .findBySolicitacaoIdAndPrestadorId(solicitacao.getId(), prestador.getId())
            .orElseGet(PropostaServico::new);

        proposta.setSolicitacao(solicitacao);
        proposta.setPrestador(prestador);
        proposta.setValorProposto(request.valor());
        proposta.setMensagem(request.mensagem().trim());
        proposta.setStatus(StatusProposta.PENDENTE);
        proposta.setRespondidoEm(null);

        PropostaServico salva = propostaRepository.save(proposta);
        if (solicitacao.getStatus() == StatusSolicitacao.PUBLICADO) {
            solicitacao.setStatus(StatusSolicitacao.AGUARDANDO_PROPOSTAS);
            solicitacaoRepository.save(solicitacao);
        }
        return toResponse(salva);
    }

    public List<PropostaServicoResponse> listarRecebidasCliente(UsuarioAutenticado usuarioAutenticado) {
        Usuario cliente = encontrarUsuario(usuarioAutenticado);
        validarTipo(cliente, TipoUsuario.CLIENTE);

        return propostaRepository.findBySolicitacaoClienteIdOrderByCriadoEmDesc(cliente.getId())
            .stream()
            .map(this::toResponse)
            .toList();
    }

    public List<PropostaServicoResponse> listarEnviadasPrestador(UsuarioAutenticado usuarioAutenticado) {
        Usuario prestador = encontrarUsuario(usuarioAutenticado);
        validarTipo(prestador, TipoUsuario.PRESTADOR);

        return propostaRepository.findByPrestadorIdOrderByCriadoEmDesc(prestador.getId())
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public PropostaServicoResponse aceitarProposta(Long propostaId, UsuarioAutenticado usuarioAutenticado) {
        Usuario cliente = encontrarUsuario(usuarioAutenticado);
        validarTipo(cliente, TipoUsuario.CLIENTE);

        PropostaServico proposta = propostaRepository.findByIdAndSolicitacaoClienteId(propostaId, cliente.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Proposta nao encontrada."));

        if (proposta.getStatus() != StatusProposta.PENDENTE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Somente propostas pendentes podem ser aceitas.");
        }

        SolicitacaoServico solicitacao = proposta.getSolicitacao();
        if (solicitacao.getStatus() == StatusSolicitacao.CONCLUIDA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solicitacao ja concluida.");
        }

        List<PropostaServico> pendentesDaSolicitacao = propostaRepository
            .findBySolicitacaoIdAndStatus(solicitacao.getId(), StatusProposta.PENDENTE);
        OffsetDateTime agora = OffsetDateTime.now();
        for (PropostaServico item : pendentesDaSolicitacao) {
            if (item.getId().equals(proposta.getId())) {
                continue;
            }
            item.setStatus(StatusProposta.RECUSADA);
            item.setRespondidoEm(agora);
        }

        proposta.setStatus(StatusProposta.ACEITA);
        proposta.setRespondidoEm(agora);
        propostaRepository.saveAll(pendentesDaSolicitacao);
        propostaRepository.save(proposta);

        solicitacao.setPrestador(proposta.getPrestador());
        solicitacao.setStatus(StatusSolicitacao.AGENDADA);
        solicitacao.setAceitoEm(agora);
        solicitacaoRepository.save(solicitacao);

        return toResponse(proposta);
    }

    @Transactional
    public PropostaServicoResponse recusarProposta(Long propostaId, UsuarioAutenticado usuarioAutenticado) {
        Usuario cliente = encontrarUsuario(usuarioAutenticado);
        validarTipo(cliente, TipoUsuario.CLIENTE);

        PropostaServico proposta = propostaRepository.findByIdAndSolicitacaoClienteId(propostaId, cliente.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Proposta nao encontrada."));

        if (proposta.getStatus() != StatusProposta.PENDENTE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Somente propostas pendentes podem ser recusadas.");
        }

        proposta.setStatus(StatusProposta.RECUSADA);
        proposta.setRespondidoEm(OffsetDateTime.now());
        PropostaServico salva = propostaRepository.save(proposta);
        return toResponse(salva);
    }

    private Usuario encontrarUsuario(UsuarioAutenticado usuarioAutenticado) {
        if (usuarioAutenticado == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Nao autenticado.");
        }
        return usuarioRepository.findById(usuarioAutenticado.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado."));
    }

    private void validarTipo(Usuario usuario, TipoUsuario tipoEsperado) {
        if (usuario.getTipoUsuario() != tipoEsperado) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acao nao permitida para este tipo de usuario.");
        }
    }

    private PropostaServicoResponse toResponse(PropostaServico proposta) {
        SolicitacaoServico solicitacao = proposta.getSolicitacao();
        return new PropostaServicoResponse(
            proposta.getId(),
            solicitacao.getId(),
            solicitacao.getTipoServico(),
            solicitacao.getEndereco(),
            solicitacao.getData(),
            solicitacao.getHorario(),
            solicitacao.getCliente().getId(),
            solicitacao.getCliente().getNome(),
            proposta.getPrestador().getId(),
            proposta.getPrestador().getNome(),
            proposta.getValorProposto(),
            proposta.getMensagem(),
            proposta.getStatus().name(),
            proposta.getCriadoEm(),
            proposta.getRespondidoEm()
        );
    }
}
