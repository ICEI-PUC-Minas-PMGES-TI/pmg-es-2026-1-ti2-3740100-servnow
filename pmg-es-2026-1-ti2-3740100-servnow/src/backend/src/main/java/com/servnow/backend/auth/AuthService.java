package com.servnow.backend.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.servnow.backend.auth.dto.AuthRequest;
import com.servnow.backend.auth.dto.AuthResponse;
import com.servnow.backend.auth.dto.RegisterRequest;
import com.servnow.backend.user.TipoUsuario;
import com.servnow.backend.user.Usuario;
import com.servnow.backend.user.UsuarioRepository;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public AuthResponse cadastrar(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (usuarioRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ja existe um usuario com esse e-mail.");
        }

        TipoUsuario tipoUsuario = parseTipoUsuario(request.tipoUsuario());

        Usuario usuario = new Usuario();
        usuario.setNome(request.nome().trim());
        usuario.setEmail(email);
        usuario.setSenha(passwordEncoder.encode(request.senha()));
        usuario.setTipoUsuario(tipoUsuario);

        Usuario salvo = usuarioRepository.save(usuario);
        return toResponse(salvo, "Usuario cadastrado com sucesso.");
    }

    public AuthResponse login(AuthRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.email().trim().toLowerCase())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha invalidos."));

        if (!passwordEncoder.matches(request.senha(), usuario.getSenha())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha invalidos.");
        }

        TipoUsuario tipoInformado = parseTipoUsuario(request.tipoUsuario());
        if (usuario.getTipoUsuario() != tipoInformado) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Este usuario foi cadastrado como " + usuario.getTipoUsuario().name().toLowerCase() + "."
            );
        }

        return toResponse(usuario, "Login realizado com sucesso.");
    }

    private TipoUsuario parseTipoUsuario(String valor) {
        try {
            return TipoUsuario.valueOf(valor.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo de usuario invalido.");
        }
    }

    private AuthResponse toResponse(Usuario usuario, String mensagem) {
        return new AuthResponse(
            usuario.getId(),
            usuario.getNome(),
            usuario.getEmail(),
            usuario.getTipoUsuario().name(),
            mensagem
        );
    }
}
