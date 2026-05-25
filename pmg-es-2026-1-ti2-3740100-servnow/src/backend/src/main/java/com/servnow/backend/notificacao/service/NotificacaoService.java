package com.servnow.backend.notificacao.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.servnow.backend.notificacao.domain.Notificacao;
import com.servnow.backend.notificacao.domain.TipoNotificacao;
import com.servnow.backend.notificacao.dto.NotificacaoResumoResponse;
import com.servnow.backend.notificacao.dto.NotificacaoResponse;
import com.servnow.backend.notificacao.repository.NotificacaoRepository;
import com.servnow.backend.security.UsuarioAutenticado;
import com.servnow.backend.usuario.domain.Usuario;
import com.servnow.backend.usuario.repository.UsuarioRepository;

@Service
public class NotificacaoService {

    private final NotificacaoRepository notificacaoRepository;
    private final UsuarioRepository usuarioRepository;

    public NotificacaoService(
        NotificacaoRepository notificacaoRepository,
        UsuarioRepository usuarioRepository
    ) {
        this.notificacaoRepository = notificacaoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificacaoResponse> listar(UsuarioAutenticado usuarioAutenticado) {
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        return notificacaoRepository.findTop30ByUsuarioIdOrderByCriadoEmDesc(usuario.getId())
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public NotificacaoResumoResponse resumo(UsuarioAutenticado usuarioAutenticado) {
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        long total = notificacaoRepository.countByUsuarioIdAndLidaFalse(usuario.getId());
        return new NotificacaoResumoResponse(total);
    }

    @Transactional
    public NotificacaoResponse marcarComoLida(Long notificacaoId, UsuarioAutenticado usuarioAutenticado) {
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        Notificacao notificacao = notificacaoRepository.findByIdAndUsuarioId(notificacaoId, usuario.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notificacao nao encontrada."));
        notificacao.setLida(true);
        return toResponse(notificacaoRepository.save(notificacao));
    }

    @Transactional
    public void marcarTodasComoLidas(UsuarioAutenticado usuarioAutenticado) {
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        List<Notificacao> naoLidas = notificacaoRepository.findByUsuarioIdAndLidaFalse(usuario.getId());
        for (Notificacao notificacao : naoLidas) {
            notificacao.setLida(true);
        }
        notificacaoRepository.saveAll(naoLidas);
    }

    @Transactional
    public void criar(
        Usuario destinatario,
        TipoNotificacao tipo,
        String titulo,
        String mensagem,
        Long propostaId,
        Long solicitacaoId
    ) {
        Notificacao notificacao = new Notificacao();
        notificacao.setUsuario(destinatario);
        notificacao.setTipo(tipo);
        notificacao.setTitulo(titulo);
        notificacao.setMensagem(mensagem);
        notificacao.setPropostaId(propostaId);
        notificacao.setSolicitacaoId(solicitacaoId);
        notificacao.setLida(false);
        notificacaoRepository.save(notificacao);
    }

    private Usuario encontrarUsuario(UsuarioAutenticado usuarioAutenticado) {
        if (usuarioAutenticado == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Nao autenticado.");
        }
        return usuarioRepository.findById(usuarioAutenticado.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado."));
    }

    private NotificacaoResponse toResponse(Notificacao notificacao) {
        return new NotificacaoResponse(
            notificacao.getId(),
            notificacao.getTipo(),
            notificacao.getTitulo(),
            notificacao.getMensagem(),
            notificacao.getPropostaId(),
            notificacao.getSolicitacaoId(),
            notificacao.isLida(),
            notificacao.getCriadoEm()
        );
    }
}
