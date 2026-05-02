package com.servnow.backend.perfil;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.servnow.backend.perfil.dto.PerfilResponse;
import com.servnow.backend.perfil.dto.PerfilUpdateRequest;
import com.servnow.backend.security.UsuarioAutenticado;
import com.servnow.backend.user.Usuario;
import com.servnow.backend.user.UsuarioRepository;

@Service
public class PerfilService {

    private final UsuarioRepository usuarioRepository;

    public PerfilService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public PerfilResponse buscar(UsuarioAutenticado usuarioAutenticado) {
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        return toResponse(usuario);
    }

    public PerfilResponse atualizar(UsuarioAutenticado usuarioAutenticado, PerfilUpdateRequest request) {
        Usuario usuario = encontrarUsuario(usuarioAutenticado);

        if (request.nome() != null && !request.nome().isBlank()) {
            usuario.setNome(request.nome().trim());
        }

        usuario.setRua(normalizarTexto(request.rua()));
        usuario.setNumero(normalizarTexto(request.numero()));
        usuario.setCep(normalizarTexto(request.cep()));
        usuario.setBairro(normalizarTexto(request.bairro()));
        usuario.setCidade(normalizarTexto(request.cidade()));
        usuario.setEstado(normalizarEstado(request.estado()));
        usuario.setFotoBase64(normalizarTextoLongo(request.fotoBase64()));
        usuario.setDescricaoProfissional(normalizarTextoLongo(request.descricaoProfissional()));
        usuario.setEspecialidades(normalizarTexto(request.especialidades()));

        Usuario salvo = usuarioRepository.save(usuario);
        return toResponse(salvo);
    }

    private Usuario encontrarUsuario(UsuarioAutenticado usuarioAutenticado) {
        return usuarioRepository.findById(usuarioAutenticado.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado."));
    }

    private String normalizarTexto(String valor) {
        if (valor == null) {
            return null;
        }
        String trim = valor.trim();
        return trim.isEmpty() ? null : trim;
    }

    private String normalizarTextoLongo(String valor) {
        if (valor == null) {
            return null;
        }
        return valor.isBlank() ? null : valor;
    }

    private String normalizarEstado(String valor) {
        String texto = normalizarTexto(valor);
        return texto == null ? null : texto.toUpperCase();
    }

    private PerfilResponse toResponse(Usuario usuario) {
        return new PerfilResponse(
            usuario.getId(),
            usuario.getNome(),
            usuario.getEmail(),
            usuario.getTipoUsuario().name(),
            usuario.getRua(),
            usuario.getNumero(),
            usuario.getCep(),
            usuario.getBairro(),
            usuario.getCidade(),
            usuario.getEstado(),
            usuario.getFotoBase64(),
            usuario.getDescricaoProfissional(),
            usuario.getEspecialidades()
        );
    }
}
