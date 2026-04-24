package com.servnow.backend.notification;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.servnow.backend.notification.dto.NotificacaoResponse;
import com.servnow.backend.notification.dto.NotificacaoResumoResponse;
import com.servnow.backend.security.UsuarioAutenticado;
import com.servnow.backend.user.Usuario;

@Service
public class NotificacaoService {

    private final NotificacaoRepository notificacaoRepository;

    public NotificacaoService(NotificacaoRepository notificacaoRepository) {
        this.notificacaoRepository = notificacaoRepository;
    }

    public void notificar(Usuario usuario, String titulo, String mensagem) {
        Notificacao notificacao = new Notificacao();
        notificacao.setUsuario(usuario);
        notificacao.setTitulo(titulo);
        notificacao.setMensagem(mensagem);
        notificacao.setLida(false);
        notificacaoRepository.save(notificacao);
    }

    public List<NotificacaoResponse> listarDoUsuario(UsuarioAutenticado usuarioAutenticado) {
        return notificacaoRepository.findAllByUsuarioIdOrderByCriadoEmDesc(usuarioAutenticado.getId()).stream()
            .map(this::toResponse)
            .toList();
    }

    public NotificacaoResumoResponse resumoDoUsuario(UsuarioAutenticado usuarioAutenticado) {
        return new NotificacaoResumoResponse(
            notificacaoRepository.countByUsuarioIdAndLidaFalse(usuarioAutenticado.getId())
        );
    }

    public void marcarComoLida(UsuarioAutenticado usuarioAutenticado, Long id) {
        Notificacao notificacao = notificacaoRepository.findByIdAndUsuarioId(id, usuarioAutenticado.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notificacao nao encontrada."));

        notificacao.setLida(true);
        notificacaoRepository.save(notificacao);
    }

    private NotificacaoResponse toResponse(Notificacao notificacao) {
        return new NotificacaoResponse(
            notificacao.getId(),
            notificacao.getTitulo(),
            notificacao.getMensagem(),
            notificacao.isLida(),
            notificacao.getCriadoEm()
        );
    }
}
