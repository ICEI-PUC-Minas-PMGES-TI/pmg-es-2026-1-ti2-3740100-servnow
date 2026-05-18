package com.servnow.backend.solicitacao.web;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.servnow.backend.security.UsuarioAutenticado;
import com.servnow.backend.solicitacao.dto.SolicitacaoServicoCreateRequest;
import com.servnow.backend.solicitacao.dto.SolicitacaoServicoResponse;
import com.servnow.backend.solicitacao.service.SolicitacaoServicoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping({"/api/solicitacoes", "/api/solicitacoeS"})
public class SolicitacaoServicoController {

    private final SolicitacaoServicoService solicitacaoService;

    public SolicitacaoServicoController(SolicitacaoServicoService solicitacaoService) {
        this.solicitacaoService = solicitacaoService;
    }

    @PostMapping({"", "/"})
    @ResponseStatus(HttpStatus.CREATED)
    public SolicitacaoServicoResponse criar(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @Valid @RequestBody SolicitacaoServicoCreateRequest request
    ) {
        return solicitacaoService.criar(usuario, request);
    }

    @GetMapping({"/cliente", "/cliente/"})
    public List<SolicitacaoServicoResponse> listarDoCliente(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return solicitacaoService.listarDoCliente(usuario);
    }

    @GetMapping({"/prestador", "/prestador/"})
    public List<SolicitacaoServicoResponse> listarParaPrestadores(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return solicitacaoService.listarParaPrestadores(usuario);
    }
}
