package com.servnow.backend.proposta.service;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.servnow.backend.notificacao.domain.TipoNotificacao;
import com.servnow.backend.notificacao.service.NotificacaoService;
import com.servnow.backend.perfil.service.AvaliacaoService;
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
    private final NotificacaoService notificacaoService;
    private final AvaliacaoService avaliacaoService;

    public PropostaServicoService(
        PropostaServicoRepository propostaRepository,
        SolicitacaoServicoRepository solicitacaoRepository,
        UsuarioRepository usuarioRepository,
        NotificacaoService notificacaoService,
        AvaliacaoService avaliacaoService
    ) {
        this.propostaRepository = propostaRepository;
        this.solicitacaoRepository = solicitacaoRepository;
        this.usuarioRepository = usuarioRepository;
        this.notificacaoService = notificacaoService;
        this.avaliacaoService = avaliacaoService;
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

        notificacaoService.criar(
            solicitacao.getCliente(),
            TipoNotificacao.NOVA_PROPOSTA,
            "Nova proposta recebida",
            prestador.getNome() + " enviou uma proposta para sua solicitacao de " + rotuloServico(solicitacao.getTipoServico()) + ".",
            salva.getId(),
            solicitacao.getId()
        );

        return toResponse(salva);
    }

    public List<PropostaServicoResponse> listarRecebidasCliente(UsuarioAutenticado usuarioAutenticado) {
        Usuario cliente = encontrarUsuario(usuarioAutenticado);
        validarTipo(cliente, TipoUsuario.CLIENTE);

        List<PropostaServico> propostas = propostaRepository.findBySolicitacaoClienteIdOrderByCriadoEmDesc(cliente.getId());
        Map<Long, Double> avaliacoesPrestadores = carregarAvaliacoesPrestadores(propostas);
        return propostas.stream()
            .map(proposta -> toResponse(proposta, avaliacoesPrestadores.get(proposta.getPrestador().getId())))
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

        OffsetDateTime agora = OffsetDateTime.now();
        List<PropostaServico> outrasPendentes = propostaRepository
            .findBySolicitacaoIdAndStatus(solicitacao.getId(), StatusProposta.PENDENTE)
            .stream()
            .filter(item -> !item.getId().equals(proposta.getId()))
            .toList();

        for (PropostaServico item : outrasPendentes) {
            item.setStatus(StatusProposta.CANCELADA);
            item.setRespondidoEm(agora);
        }

        proposta.setStatus(StatusProposta.ACEITA);
        proposta.setRespondidoEm(agora);
        propostaRepository.saveAll(outrasPendentes);
        propostaRepository.save(proposta);

        solicitacao.setPrestador(proposta.getPrestador());
        solicitacao.setStatus(StatusSolicitacao.AGENDADA);
        solicitacao.setAceitoEm(agora);
        solicitacao.setValorAceito(proposta.getValorProposto());
        solicitacaoRepository.save(solicitacao);

        String servico = rotuloServico(solicitacao.getTipoServico());
        notificacaoService.criar(
            proposta.getPrestador(),
            TipoNotificacao.SERVICO_AGENDADO,
            "Servico agendado",
            cliente.getNome() + " aceitou sua proposta. O servico de " + servico + " foi agendado.",
            proposta.getId(),
            solicitacao.getId()
        );
        notificacaoService.criar(
            cliente,
            TipoNotificacao.SERVICO_AGENDADO,
            "Servico agendado",
            "Voce aceitou a proposta de " + proposta.getPrestador().getNome() + ". O servico de " + servico + " esta agendado.",
            proposta.getId(),
            solicitacao.getId()
        );
        for (PropostaServico item : outrasPendentes) {
            notificacaoService.criar(
                item.getPrestador(),
                TipoNotificacao.PROPOSTA_CANCELADA,
                "Proposta cancelada",
                "Outra proposta foi aceita para a solicitacao de " + servico + ". Sua proposta foi cancelada automaticamente.",
                item.getId(),
                solicitacao.getId()
            );
        }

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

        SolicitacaoServico solicitacao = proposta.getSolicitacao();
        notificacaoService.criar(
            proposta.getPrestador(),
            TipoNotificacao.PROPOSTA_RECUSADA,
            "Proposta recusada",
            cliente.getNome() + " recusou sua proposta para a solicitacao de " + rotuloServico(solicitacao.getTipoServico()) + ".",
            salva.getId(),
            solicitacao.getId()
        );

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

    private String rotuloServico(String tipoServico) {
        if (tipoServico == null || tipoServico.isBlank()) {
            return "servico";
        }
        return tipoServico.toLowerCase().replace('_', ' ');
    }

    private PropostaServicoResponse toResponse(PropostaServico proposta) {
        return toResponse(proposta, null);
    }

    private PropostaServicoResponse toResponse(PropostaServico proposta, Double prestadorAvaliacaoMedia) {
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
            proposta.getRespondidoEm(),
            prestadorAvaliacaoMedia
        );
    }

    private Map<Long, Double> carregarAvaliacoesPrestadores(List<PropostaServico> propostas) {
        Set<Long> prestadorIds = propostas.stream()
            .map(proposta -> proposta.getPrestador().getId())
            .collect(Collectors.toSet());

        Map<Long, Double> avaliacoes = new HashMap<>();
        for (Long prestadorId : prestadorIds) {
            Usuario prestador = new Usuario();
            prestador.setId(prestadorId);
            prestador.setTipoUsuario(TipoUsuario.PRESTADOR);
            avaliacoes.put(prestadorId, avaliacaoService.calcularResumo(prestador).media());
        }
        return avaliacoes;
    }
}
