package com.servnow.backend.serviceorder;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.servnow.backend.security.UsuarioAutenticado;
import com.servnow.backend.serviceorder.dto.SolicitacaoServicoRequest;
import com.servnow.backend.serviceorder.dto.SolicitacaoServicoResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/solicitacoes-servico")
public class SolicitacaoServicoController {

    private final SolicitacaoServicoService solicitacaoServicoService;

    public SolicitacaoServicoController(SolicitacaoServicoService solicitacaoServicoService) {
        this.solicitacaoServicoService = solicitacaoServicoService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SolicitacaoServicoResponse criar(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @Valid @RequestBody SolicitacaoServicoRequest request
    ) {
        return solicitacaoServicoService.criar(usuario, request);
    }

    @GetMapping("/minhas")
    public List<SolicitacaoServicoResponse> listarMinhas(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return solicitacaoServicoService.listarDoCliente(usuario);
    }

    @PutMapping("/{id}")
    public SolicitacaoServicoResponse atualizar(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long id,
        @Valid @RequestBody SolicitacaoServicoRequest request
    ) {
        return solicitacaoServicoService.atualizar(usuario, id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable Long id) {
        solicitacaoServicoService.excluir(usuario, id);
    }

    @GetMapping("/publicadas")
    public List<SolicitacaoServicoResponse> listarPublicadas(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @RequestParam(required = false) String tipoServico,
        @RequestParam(required = false) String faixaPreco,
        @RequestParam(required = false) String data,
        @RequestParam(required = false) Integer distanciaKm
    ) {
        return solicitacaoServicoService.listarPublicadasParaPrestadores(
            usuario,
            tipoServico,
            faixaPreco,
            data,
            distanciaKm
        );
    }

    @PostMapping("/{id}/aceitar")
    public SolicitacaoServicoResponse aceitar(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long id
    ) {
        return solicitacaoServicoService.aceitarSolicitacao(usuario, id);
    }
}
