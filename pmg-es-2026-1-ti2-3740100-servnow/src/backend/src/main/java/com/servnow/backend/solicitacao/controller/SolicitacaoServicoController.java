package com.servnow.backend.solicitacao.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.servnow.backend.ArmazenamentoImagens.ArquivoStorage;
import com.servnow.backend.security.UsuarioAutenticado;
import com.servnow.backend.solicitacao.domain.SolicitacaoServico;
import com.servnow.backend.solicitacao.dto.SolicitacaoServicoCreateRequest;
import com.servnow.backend.solicitacao.dto.SolicitacaoServicoResponse;
import com.servnow.backend.solicitacao.service.SolicitacaoServicoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping({"/api/solicitacoes", "/api/solicitacoeS"})
public class SolicitacaoServicoController {

    private final SolicitacaoServicoService solicitacaoService;
    private final ArquivoStorage arquivoStorage;

    public SolicitacaoServicoController(
        SolicitacaoServicoService solicitacaoService,
        ArquivoStorage arquivoStorage
    ) {
        this.solicitacaoService = solicitacaoService;
        this.arquivoStorage = arquivoStorage;
    }

    @PostMapping(value = {"", "/"}, consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, "multipart/form-data;charset=UTF-8"})
    @ResponseStatus(HttpStatus.CREATED)
    public SolicitacaoServicoResponse criar(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @Valid @RequestPart("dados") SolicitacaoServicoCreateRequest request,
        @RequestPart(value = "imagem", required = false) MultipartFile imagem
    ) {
        return solicitacaoService.criar(usuario, request, imagem);
    }

    /**
     * Compatibilidade: clientes que ainda enviam JSON puro (sem foto em arquivo).
     */
    @PostMapping(value = {"", "/"}, consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public SolicitacaoServicoResponse criarJson(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @Valid @RequestBody SolicitacaoServicoCreateRequest request
    ) {
        return solicitacaoService.criar(usuario, request, null);
    }

    @GetMapping({"/cliente", "/cliente/"})
    public List<SolicitacaoServicoResponse> listarDoCliente(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return solicitacaoService.listarDoCliente(usuario);
    }

    @GetMapping({"/prestador", "/prestador/"})
    public List<SolicitacaoServicoResponse> listarParaPrestadores(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return solicitacaoService.listarParaPrestadores(usuario);
    }

    @GetMapping("/{id}/imagem")
    public ResponseEntity<byte[]> obterImagem(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long id
    ) {
        SolicitacaoServico solicitacao = solicitacaoService.encontrarParaLeituraImagem(id, usuario);
        String caminhoRelativo = solicitacao.getImagemArquivoRelativo();
        if (caminhoRelativo == null || caminhoRelativo.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Esta solicitacao nao possui imagem.");
        }

        Path arquivo = arquivoStorage.resolverAbsoluto(caminhoRelativo);
        if (arquivo == null || !Files.isRegularFile(arquivo)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Arquivo de imagem nao encontrado.");
        }

        try {
            byte[] conteudo = Files.readAllBytes(arquivo);
            String contentType = Files.probeContentType(arquivo);
            if (contentType == null) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "private, max-age=3600")
                .contentType(MediaType.parseMediaType(contentType))
                .body(conteudo);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Nao foi possivel ler a imagem.");
        }
    }
}
