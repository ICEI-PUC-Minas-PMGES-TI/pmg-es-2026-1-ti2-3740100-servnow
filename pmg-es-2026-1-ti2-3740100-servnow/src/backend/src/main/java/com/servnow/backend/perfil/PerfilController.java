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

    @PutMapping
    public PerfilResponse atualizar(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @Valid @RequestBody PerfilUpdateRequest request
    ) {
        return perfilService.atualizar(usuario, request);
    }
}
