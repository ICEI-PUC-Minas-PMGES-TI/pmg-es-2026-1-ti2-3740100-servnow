package com.servnow.backend.notificacao.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.servnow.backend.notificacao.dto.NotificacaoResumoResponse;
import com.servnow.backend.notificacao.dto.NotificacaoResponse;
import com.servnow.backend.notificacao.service.NotificacaoService;
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
        return notificacaoService.listar(usuario);
    }

    @GetMapping("/resumo")
    public NotificacaoResumoResponse resumo(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return notificacaoService.resumo(usuario);
    }

    @PatchMapping("/{id}/lida")
    public NotificacaoResponse marcarComoLida(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long id
    ) {
        return notificacaoService.marcarComoLida(id, usuario);
    }

    @PatchMapping("/lidas")
    public void marcarTodasComoLidas(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        notificacaoService.marcarTodasComoLidas(usuario);
    }
}
