package com.servnow.backend.perfil.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.servnow.backend.ArmazenamentoImagens.ArquivoStorage;
import com.servnow.backend.perfil.dto.AvaliacoesRecebidasResponse;
import com.servnow.backend.perfil.dto.ClienteCadastroSyncRequest;
import com.servnow.backend.perfil.dto.PerfilPublicoResponse;
import com.servnow.backend.perfil.dto.PerfilResponse;
import com.servnow.backend.perfil.dto.PerfilUpdateRequest;
import com.servnow.backend.perfil.service.ClienteCadastroService;
import com.servnow.backend.perfil.service.PerfilService;
import com.servnow.backend.security.UsuarioAutenticado;
import com.servnow.backend.usuario.domain.Usuario;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/perfil")
public class PerfilController {

    private final PerfilService perfilService;
    private final ClienteCadastroService clienteCadastroService;
    private final ArquivoStorage arquivoStorage;

    public PerfilController(
        PerfilService perfilService,
        ClienteCadastroService clienteCadastroService,
        ArquivoStorage arquivoStorage
    ) {
        this.perfilService = perfilService;
        this.clienteCadastroService = clienteCadastroService;
        this.arquivoStorage = arquivoStorage;
    }

    @GetMapping
    public PerfilResponse buscar(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return perfilService.buscar(usuario);
    }

    @GetMapping("/cliente")
    public PerfilResponse buscarCliente(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return perfilService.buscarCliente(usuario);
    }

    @GetMapping("/prestador")
    public PerfilResponse buscarPrestador(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return perfilService.buscarPrestador(usuario);
    }

    @GetMapping("/publico/{id}")
    public PerfilPublicoResponse buscarPublico(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @org.springframework.web.bind.annotation.PathVariable Long id
    ) {
        return perfilService.buscarPublico(id, usuario);
    }

    @GetMapping("/avaliacoes-recebidas")
    public AvaliacoesRecebidasResponse listarAvaliacoesRecebidas(
        @AuthenticationPrincipal UsuarioAutenticado usuario
    ) {
        return perfilService.listarAvaliacoesRecebidas(usuario);
    }

    @PutMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public PerfilResponse atualizarJson(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @Valid @RequestBody PerfilUpdateRequest request
    ) {
        return perfilService.atualizar(usuario, request, null, null, null);
    }

    @PutMapping(value = {"", "/"}, consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, "multipart/form-data;charset=UTF-8"})
    public PerfilResponse atualizarMultipart(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @Valid @RequestPart("dados") PerfilUpdateRequest request,
        @RequestPart(value = "fotoPerfil", required = false) MultipartFile fotoPerfil,
        @RequestPart(value = "fotoLocal", required = false) MultipartFile fotoLocal,
        @RequestPart(value = "documentoIdentidade", required = false) MultipartFile documentoIdentidade
    ) {
        return perfilService.atualizar(usuario, request, fotoPerfil, fotoLocal, documentoIdentidade);
    }

    @PutMapping(value = "/cliente", consumes = MediaType.APPLICATION_JSON_VALUE)
    public PerfilResponse atualizarClienteJson(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @Valid @RequestBody PerfilUpdateRequest request
    ) {
        return perfilService.atualizarCliente(usuario, request, null, null, null);
    }

    @PutMapping(value = "/cliente", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, "multipart/form-data;charset=UTF-8"})
    public PerfilResponse atualizarClienteMultipart(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @Valid @RequestPart("dados") PerfilUpdateRequest request,
        @RequestPart(value = "fotoPerfil", required = false) MultipartFile fotoPerfil,
        @RequestPart(value = "fotoLocal", required = false) MultipartFile fotoLocal,
        @RequestPart(value = "documentoIdentidade", required = false) MultipartFile documentoIdentidade
    ) {
        return perfilService.atualizarCliente(usuario, request, fotoPerfil, fotoLocal, documentoIdentidade);
    }

    @PutMapping(value = "/cliente/cadastros", consumes = MediaType.APPLICATION_JSON_VALUE)
    public PerfilResponse sincronizarCadastrosCliente(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @Valid @RequestBody ClienteCadastroSyncRequest request
    ) {
        Usuario perfil = perfilService.encontrarParaLeituraArquivo(usuario.getId(), usuario);
        clienteCadastroService.sincronizar(perfil, request);
        return perfilService.buscarCliente(usuario);
    }

    @PostMapping(value = "/cliente/enderecos/{id}/foto", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, "multipart/form-data;charset=UTF-8"})
    public PerfilResponse salvarFotoEnderecoCliente(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long id,
        @RequestPart("foto") MultipartFile foto
    ) {
        Usuario perfil = perfilService.encontrarParaLeituraArquivo(usuario.getId(), usuario);
        clienteCadastroService.salvarFotoEndereco(perfil, id, foto);
        return perfilService.buscarCliente(usuario);
    }

    @GetMapping("/cliente/enderecos/{id}/foto")
    public ResponseEntity<byte[]> obterFotoEnderecoCliente(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long id
    ) {
        Usuario perfil = perfilService.encontrarParaLeituraArquivo(usuario.getId(), usuario);
        return responderArquivo(
            clienteCadastroService.caminhoFotoEndereco(perfil, id),
            "Foto do endereco nao encontrada."
        );
    }

    @PutMapping(value = "/prestador", consumes = MediaType.APPLICATION_JSON_VALUE)
    public PerfilResponse atualizarPrestadorJson(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @Valid @RequestBody PerfilUpdateRequest request
    ) {
        return perfilService.atualizarPrestador(usuario, request, null, null, null);
    }

    @PutMapping(value = "/prestador", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, "multipart/form-data;charset=UTF-8"})
    public PerfilResponse atualizarPrestadorMultipart(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @Valid @RequestPart("dados") PerfilUpdateRequest request,
        @RequestPart(value = "fotoPerfil", required = false) MultipartFile fotoPerfil,
        @RequestPart(value = "fotoLocal", required = false) MultipartFile fotoLocal,
        @RequestPart(value = "documentoIdentidade", required = false) MultipartFile documentoIdentidade
    ) {
        return perfilService.atualizarPrestador(usuario, request, fotoPerfil, fotoLocal, documentoIdentidade);
    }

    @GetMapping("/foto-perfil")
    public ResponseEntity<byte[]> obterFotoPerfil(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        Usuario perfil = perfilService.encontrarParaLeituraArquivo(usuario.getId(), usuario);
        return responderArquivo(perfilService.caminhoFotoPerfil(perfil), "Foto de perfil nao encontrada.");
    }

    @GetMapping("/publico/{id}/foto-perfil")
    public ResponseEntity<byte[]> obterFotoPerfilPublico(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @org.springframework.web.bind.annotation.PathVariable Long id
    ) {
        Usuario perfil = perfilService.encontrarParaLeituraArquivoPublico(id, usuario);
        return responderArquivo(perfilService.caminhoFotoPerfilPublico(perfil), "Foto de perfil nao encontrada.");
    }

    @GetMapping("/foto-local")
    public ResponseEntity<byte[]> obterFotoLocal(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        Usuario perfil = perfilService.encontrarParaLeituraArquivo(usuario.getId(), usuario);
        return responderArquivo(perfilService.caminhoFotoLocal(perfil), "Foto nao encontrada.");
    }

    @GetMapping("/documento-identidade")
    public ResponseEntity<byte[]> obterDocumentoIdentidade(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        Usuario perfil = perfilService.encontrarParaLeituraArquivo(usuario.getId(), usuario);
        return responderArquivo(
            perfilService.caminhoDocumentoIdentidade(perfil),
            "Documento de identidade nao encontrado."
        );
    }

    private ResponseEntity<byte[]> responderArquivo(String caminhoRelativo, String mensagemNaoEncontrado) {
        return arquivoStorage.responderHttp(caminhoRelativo, mensagemNaoEncontrado);
    }
}
