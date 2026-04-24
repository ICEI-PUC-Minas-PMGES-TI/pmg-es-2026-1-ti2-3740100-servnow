package com.servnow.backend.security;

import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.servnow.backend.user.Usuario;
import com.servnow.backend.user.UsuarioRepository;

@Service
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmail(username.trim().toLowerCase())
            .orElseThrow(() -> new UsernameNotFoundException("Usuario nao encontrado."));

        return new UsuarioAutenticado(
            usuario.getId(),
            usuario.getNome(),
            usuario.getEmail(),
            usuario.getSenha(),
            usuario.getTipoUsuario().name(),
            List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getTipoUsuario().name()))
        );
    }
}
