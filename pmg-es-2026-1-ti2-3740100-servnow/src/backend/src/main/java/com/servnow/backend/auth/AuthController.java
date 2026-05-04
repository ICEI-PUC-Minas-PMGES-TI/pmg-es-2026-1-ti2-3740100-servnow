package com.servnow.backend.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.servnow.backend.auth.dto.AuthRequest;
import com.servnow.backend.auth.dto.AuthResponse;
import com.servnow.backend.auth.dto.CurrentUserResponse;
import com.servnow.backend.auth.dto.RegisterRequest;
import com.servnow.backend.security.UsuarioAutenticado;
import com.servnow.backend.user.Usuario;
import com.servnow.backend.user.UsuarioRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UsuarioRepository usuarioRepository;

    public AuthController(AuthService authService, UsuarioRepository usuarioRepository) {
        this.authService = authService;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.cadastrar(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public CurrentUserResponse me(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        Usuario completo = usuarioRepository.findById(usuario.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado."));

        return new CurrentUserResponse(
            completo.getId(),
            completo.getNome(),
            completo.getEmail(),
            completo.getTipoUsuario().name(),
            completo.getRua(),
            completo.getNumero(),
            completo.getCep(),
            completo.getBairro(),
            completo.getCidade(),
            completo.getEstado(),
            completo.getFotoPerfilBase64(),
            completo.getFotoBase64(),
            completo.getDescricaoProfissional(),
            completo.getEspecialidades()
        );
    }
}
