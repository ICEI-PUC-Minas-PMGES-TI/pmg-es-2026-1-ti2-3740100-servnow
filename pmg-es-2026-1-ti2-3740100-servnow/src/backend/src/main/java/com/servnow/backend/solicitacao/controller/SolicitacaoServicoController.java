package com.servnow.backend.solicitacao.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
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

    @GetMapping({"/cliente/agendadas", "/cliente/agendadas/"})
    public List<SolicitacaoServicoResponse> listarAgendadasDoCliente(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return solicitacaoService.listarAgendadasDoCliente(usuario);
    }

    @GetMapping({"/prestador/agendadas", "/prestador/agendadas/"})
    public List<SolicitacaoServicoResponse> listarAgendadasDoPrestador(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return solicitacaoService.listarAgendadasDoPrestador(usuario);
    }

    @GetMapping({"/cliente/pagas", "/cliente/pagas/"})
    public List<SolicitacaoServicoResponse> listarPagasDoCliente(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return solicitacaoService.listarPagasDoCliente(usuario);
    }

    @GetMapping({"/prestador/pagas", "/prestador/pagas/"})
    public List<SolicitacaoServicoResponse> listarPagasDoPrestador(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return solicitacaoService.listarPagasDoPrestador(usuario);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public SolicitacaoServicoResponse editar(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long id,
        @Valid @RequestBody SolicitacaoServicoCreateRequest request,
        @RequestParam(value = "removerImagem", defaultValue = "false") boolean removerImagem
    ) {
        return solicitacaoService.editarDoCliente(id, usuario, request, null, removerImagem);
    }

    @PutMapping(value = "/{id}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, "multipart/form-data;charset=UTF-8"})
    public SolicitacaoServicoResponse editarComImagem(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long id,
        @Valid @RequestPart("dados") SolicitacaoServicoCreateRequest request,
        @RequestPart(value = "imagem", required = false) MultipartFile imagem,
        @RequestPart(value = "removerImagem", required = false) String removerImagem
    ) {
        return solicitacaoService.editarDoCliente(id, usuario, request, imagem, Boolean.parseBoolean(removerImagem));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long id
    ) {
        solicitacaoService.excluirDoCliente(id, usuario);
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

        return arquivoStorage.responderHttp(caminhoRelativo, "Arquivo de imagem nao encontrado.");
    }
}
