package com.servnow.backend.notification;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.servnow.backend.notification.dto.NotificacaoResponse;
import com.servnow.backend.notification.dto.NotificacaoResumoResponse;
import com.servnow.backend.security.UsuarioAutenticado;

@RestController
@RequestMapping("/api/notificacoes")
public class NotificacaoController {

    private final NotificacaoService notificacaoService;

    public NotificacaoController(NotificacaoService notificacaoService) {
        this.notificacaoService = notificacaoService;
    }

    @GetMapping
    public List<NotificacaoResponse> listar(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return notificacaoService.listarDoUsuario(usuario);
    }

    @GetMapping("/resumo")
    public NotificacaoResumoResponse resumo(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return notificacaoService.resumoDoUsuario(usuario);
    }

    @PatchMapping("/{id}/lida")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void marcarComoLida(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable Long id) {
        notificacaoService.marcarComoLida(usuario, id);
    }
}
