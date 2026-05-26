package com.servnow.backend.acompanhamento.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.servnow.backend.acompanhamento.dto.AcompanhamentoDetalheResponse;
import com.servnow.backend.acompanhamento.dto.AcompanhamentoDisponivelResponse;
import com.servnow.backend.acompanhamento.dto.AvaliarServicoRequest;
import com.servnow.backend.acompanhamento.dto.ConfirmarChegadaRequest;
import com.servnow.backend.acompanhamento.dto.ConfirmarPagamentoRequest;
import com.servnow.backend.acompanhamento.service.AcompanhamentoService;
import com.servnow.backend.security.UsuarioAutenticado;

import jakarta.validation.Valid;

@RestController
@RequestMapping({"/api/acompanhamento", "/api/acompanhamento/"})
public class AcompanhamentoController {

    private final AcompanhamentoService acompanhamentoService;

    public AcompanhamentoController(AcompanhamentoService acompanhamentoService) {
        this.acompanhamentoService = acompanhamentoService;
    }

    @GetMapping({"/disponiveis", "/disponiveis/"})
    public List<AcompanhamentoDisponivelResponse> listarDisponiveis(
        @AuthenticationPrincipal UsuarioAutenticado usuario
    ) {
        return acompanhamentoService.listarDisponiveis(usuario);
    }

    @GetMapping("/{solicitacaoId}")
    public AcompanhamentoDetalheResponse obterDetalhe(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long solicitacaoId
    ) {
        return acompanhamentoService.obterDetalhe(solicitacaoId, usuario);
    }

    @PostMapping("/{solicitacaoId}/iniciar")
    public AcompanhamentoDetalheResponse iniciar(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long solicitacaoId
    ) {
        return acompanhamentoService.iniciar(solicitacaoId, usuario);
    }

    @PostMapping("/{solicitacaoId}/renovar-codigo")
    public AcompanhamentoDetalheResponse renovarCodigo(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long solicitacaoId
    ) {
        return acompanhamentoService.renovarCodigo(solicitacaoId, usuario);
    }

    @PostMapping("/{solicitacaoId}/confirmar-chegada")
    public AcompanhamentoDetalheResponse confirmarChegada(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long solicitacaoId,
        @Valid @RequestBody ConfirmarChegadaRequest request
    ) {
        return acompanhamentoService.confirmarChegada(solicitacaoId, usuario, request);
    }

    @PostMapping(value = "/{solicitacaoId}/atualizacoes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AcompanhamentoDetalheResponse registrarAtualizacao(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long solicitacaoId,
        @RequestPart("descricao") String descricao,
        @RequestPart(value = "foto", required = false) MultipartFile foto
    ) {
        return acompanhamentoService.registrarAtualizacao(solicitacaoId, usuario, descricao, foto);
    }

    @PostMapping("/{solicitacaoId}/concluir-execucao")
    public AcompanhamentoDetalheResponse concluirExecucao(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long solicitacaoId
    ) {
        return acompanhamentoService.concluirExecucao(solicitacaoId, usuario);
    }

    @PostMapping("/{solicitacaoId}/confirmar-pagamento")
    public AcompanhamentoDetalheResponse confirmarPagamento(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long solicitacaoId,
        @Valid @RequestBody ConfirmarPagamentoRequest request
    ) {
        return acompanhamentoService.confirmarPagamento(solicitacaoId, usuario, request);
    }

    @PostMapping("/{solicitacaoId}/avaliar")
    public AcompanhamentoDetalheResponse avaliar(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long solicitacaoId,
        @Valid @RequestBody AvaliarServicoRequest request
    ) {
        return acompanhamentoService.avaliar(solicitacaoId, usuario, request);
    }

    @GetMapping("/{solicitacaoId}/atualizacoes/{atualizacaoId}/foto")
    public ResponseEntity<byte[]> obterFotoAtualizacao(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long solicitacaoId,
        @PathVariable Long atualizacaoId
    ) {
        byte[] conteudo = acompanhamentoService.obterFotoAtualizacao(solicitacaoId, atualizacaoId, usuario);
        return ResponseEntity.ok()
            .header(HttpHeaders.CACHE_CONTROL, "private, max-age=3600")
            .contentType(MediaType.IMAGE_JPEG)
            .body(conteudo);
    }
}
