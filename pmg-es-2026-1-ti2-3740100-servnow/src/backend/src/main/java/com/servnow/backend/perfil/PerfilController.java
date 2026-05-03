package com.servnow.backend.perfil;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.servnow.backend.perfil.dto.PerfilResponse;
import com.servnow.backend.perfil.dto.PerfilUpdateRequest;
import com.servnow.backend.security.UsuarioAutenticado;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/perfil")
public class PerfilController {

    private final PerfilService perfilService;

    public PerfilController(PerfilService perfilService) {
        this.perfilService = perfilService;
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

    @PutMapping
    public PerfilResponse atualizar(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @Valid @RequestBody PerfilUpdateRequest request
    ) {
        return perfilService.atualizar(usuario, request);
    }

    @PutMapping("/cliente")
    public PerfilResponse atualizarCliente(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @Valid @RequestBody PerfilUpdateRequest request
    ) {
        return perfilService.atualizarCliente(usuario, request);
    }

    @PutMapping("/prestador")
    public PerfilResponse atualizarPrestador(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @Valid @RequestBody PerfilUpdateRequest request
    ) {
        return perfilService.atualizarPrestador(usuario, request);
    }
}
