package com.servnow.backend.proposta.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.servnow.backend.proposta.dto.PropostaCreateRequest;
import com.servnow.backend.proposta.dto.PropostaServicoResponse;
import com.servnow.backend.proposta.service.PropostaServicoService;
import com.servnow.backend.security.UsuarioAutenticado;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/propostas")
public class PropostaServicoController {

    private final PropostaServicoService propostaService;

    public PropostaServicoController(PropostaServicoService propostaService) {
        this.propostaService = propostaService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PropostaServicoResponse enviar(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @Valid @RequestBody PropostaCreateRequest request
    ) {
        return propostaService.enviarProposta(usuario, request);
    }

    @GetMapping("/cliente")
    public List<PropostaServicoResponse> listarRecebidasDoCliente(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return propostaService.listarRecebidasCliente(usuario);
    }

    @GetMapping("/prestador")
    public List<PropostaServicoResponse> listarEnviadasDoPrestador(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return propostaService.listarEnviadasPrestador(usuario);
    }

    @PostMapping("/{id}/aceitar")
    public PropostaServicoResponse aceitar(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long id
    ) {
        return propostaService.aceitarProposta(id, usuario);
    }

    @PostMapping("/{id}/recusar")
    public PropostaServicoResponse recusar(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long id
    ) {
        return propostaService.recusarProposta(id, usuario);
    }
}
