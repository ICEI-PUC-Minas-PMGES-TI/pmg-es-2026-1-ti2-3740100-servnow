package com.servnow.backend.perfil.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.servnow.backend.perfil.dto.PerfilResponse;
import com.servnow.backend.perfil.dto.PerfilUpdateRequest;
import com.servnow.backend.security.UsuarioAutenticado;
import com.servnow.backend.usuario.domain.TipoUsuario;
import com.servnow.backend.usuario.domain.Usuario;
import com.servnow.backend.usuario.repository.UsuarioRepository;

@Service
public class PerfilService {

    private static final int FOTO_BASE64_MAX_LENGTH = 200000;
    private static final int DOCUMENTO_BASE64_MAX_LENGTH = 7000000;

    private final UsuarioRepository usuarioRepository;

    public PerfilService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public PerfilResponse buscar(UsuarioAutenticado usuarioAutenticado) {
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        return toResponse(usuario);
    }

    public PerfilResponse buscarCliente(UsuarioAutenticado usuarioAutenticado) {
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        validarTipo(usuario, TipoUsuario.CLIENTE);
        return toResponse(usuario);
    }

    public PerfilResponse buscarPrestador(UsuarioAutenticado usuarioAutenticado) {
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        validarTipo(usuario, TipoUsuario.PRESTADOR);
        return toResponse(usuario);
    }

    public PerfilResponse atualizar(UsuarioAutenticado usuarioAutenticado, PerfilUpdateRequest request) {
        Usuario usuario = encontrarUsuario(usuarioAutenticado);

        atualizarNome(usuario, request);
        usuario.setRua(normalizarTexto(request.rua()));
        usuario.setNumero(normalizarTexto(request.numero()));
        usuario.setCep(normalizarTexto(request.cep()));
        usuario.setComplemento(normalizarTexto(request.complemento()));
        usuario.setBairro(normalizarTexto(request.bairro()));
        usuario.setCidade(normalizarTexto(request.cidade()));
        usuario.setEstado(normalizarEstado(request.estado()));
        usuario.setFotoPerfilBase64(normalizarFoto(request.fotoPerfilBase64()));
        atualizarEnquadramentoFotoPerfil(usuario, request);
        usuario.setFotoBase64(normalizarFoto(request.fotoBase64()));
        usuario.setDescricaoProfissional(normalizarTextoLongo(request.descricaoProfissional()));
        usuario.setEspecialidades(normalizarTexto(request.especialidades()));
        if (usuario.getTipoUsuario() == TipoUsuario.PRESTADOR) {
            atualizarDadosPrestador(usuario, request);
        }

        Usuario salvo = usuarioRepository.save(usuario);
        return toResponse(salvo);
    }

    public PerfilResponse atualizarCliente(UsuarioAutenticado usuarioAutenticado, PerfilUpdateRequest request) {
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        validarTipo(usuario, TipoUsuario.CLIENTE);
        atualizarNome(usuario, request);

        usuario.setRua(normalizarTexto(request.rua()));
        usuario.setNumero(normalizarTexto(request.numero()));
        usuario.setCep(normalizarTexto(request.cep()));
        usuario.setComplemento(normalizarTexto(request.complemento()));
        usuario.setBairro(normalizarTexto(request.bairro()));
        usuario.setCidade(normalizarTexto(request.cidade()));
        usuario.setEstado(normalizarEstado(request.estado()));
        usuario.setFotoPerfilBase64(normalizarFoto(request.fotoPerfilBase64()));
        atualizarEnquadramentoFotoPerfil(usuario, request);
        usuario.setFotoBase64(normalizarFoto(request.fotoBase64()));

        Usuario salvo = usuarioRepository.save(usuario);
        return toResponse(salvo);
    }

    public PerfilResponse atualizarPrestador(UsuarioAutenticado usuarioAutenticado, PerfilUpdateRequest request) {
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        validarTipo(usuario, TipoUsuario.PRESTADOR);
        atualizarNome(usuario, request);

        usuario.setFotoPerfilBase64(normalizarFoto(request.fotoPerfilBase64()));
        atualizarEnquadramentoFotoPerfil(usuario, request);
        usuario.setDescricaoProfissional(normalizarTextoLongo(request.descricaoProfissional()));
        usuario.setEspecialidades(normalizarTexto(request.especialidades()));
        atualizarDadosPrestador(usuario, request);

        Usuario salvo = usuarioRepository.save(usuario);
        return toResponse(salvo);
    }

    private void atualizarDadosPrestador(Usuario usuario, PerfilUpdateRequest request) {
        usuario.setDiasDisponiveis(validarDiasDisponiveis(request.diasDisponiveis()));
        usuario.setHorarioInicio(validarHorario(request.horarioInicio(), "Horario de inicio invalido."));
        usuario.setHorarioFim(validarHorario(request.horarioFim(), "Horario de fim invalido."));
        validarIntervaloHorarios(usuario.getHorarioInicio(), usuario.getHorarioFim());
        usuario.setRaioAtendimentoKm(validarRaioAtendimento(request.raioAtendimentoKm()));
        usuario.setDocumentoIdentidadeBase64(validarDocumentoIdentidade(request.documentoIdentidadeBase64()));
    }

    private Usuario encontrarUsuario(UsuarioAutenticado usuarioAutenticado) {
        return usuarioRepository.findById(usuarioAutenticado.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado."));
    }

    private void atualizarNome(Usuario usuario, PerfilUpdateRequest request) {
        if (request.nome() != null && !request.nome().isBlank()) {
            usuario.setNome(request.nome().trim());
        }
    }

    private void validarTipo(Usuario usuario, TipoUsuario tipoEsperado) {
        if (usuario.getTipoUsuario() != tipoEsperado) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Perfil nao permitido para este tipo de usuario.");
        }
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

    private String normalizarFoto(String valor) {
        String foto = normalizarTextoLongo(valor);
        if (foto != null && foto.length() > FOTO_BASE64_MAX_LENGTH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A foto e muito grande. Escolha uma imagem menor.");
        }
        return foto;
    }

    private void atualizarEnquadramentoFotoPerfil(Usuario usuario, PerfilUpdateRequest request) {
        usuario.setFotoPerfilAjusteX(normalizarPercentual(request.fotoPerfilAjusteX()));
        usuario.setFotoPerfilAjusteY(normalizarPercentual(request.fotoPerfilAjusteY()));
        usuario.setFotoPerfilEnquadramento(normalizarEnquadramento(request.fotoPerfilEnquadramento()));
    }

    private Integer normalizarPercentual(Integer valor) {
        if (valor == null) {
            return 50;
        }
        return Math.max(0, Math.min(100, valor));
    }

    private String normalizarEnquadramento(String valor) {
        String texto = normalizarTexto(valor);
        if (texto == null) {
            return "cover";
        }
        return "contain".equalsIgnoreCase(texto) ? "contain" : "cover";
    }

    private String normalizarEstado(String valor) {
        String texto = normalizarTexto(valor);
        return texto == null ? null : texto.toUpperCase();
    }

    private String validarDiasDisponiveis(String valor) {
        String texto = normalizarTexto(valor);
        if (texto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecione pelo menos um dia disponivel.");
        }
        return texto;
    }

    private String validarHorario(String valor, String mensagem) {
        String texto = normalizarTexto(valor);
        if (texto == null || !texto.matches("^([01]\\d|2[0-3]):[0-5]\\d$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, mensagem);
        }
        return texto;
    }

    private void validarIntervaloHorarios(String horarioInicio, String horarioFim) {
        if (horarioInicio.compareTo(horarioFim) >= 0) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "O horario de inicio deve ser anterior ao horario de fim."
            );
        }
    }

    private Integer validarRaioAtendimento(Integer valor) {
        if (valor == null || valor < 1 || valor > 30) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O raio de atendimento deve estar entre 1 e 30 km.");
        }
        return valor;
    }

    private String validarDocumentoIdentidade(String valor) {
        String documento = normalizarTextoLongo(valor);
        if (documento == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Envie o documento de identidade.");
        }
        if (!documento.startsWith("data:image/") && !documento.startsWith("data:application/pdf")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O documento deve ser PDF ou imagem.");
        }
        if (documento.length() > DOCUMENTO_BASE64_MAX_LENGTH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O documento deve ter no maximo 5 MB.");
        }
        return documento;
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
            usuario.getComplemento(),
            usuario.getBairro(),
            usuario.getCidade(),
            usuario.getEstado(),
            usuario.getFotoPerfilBase64(),
            usuario.getFotoPerfilAjusteX() == null ? 50 : usuario.getFotoPerfilAjusteX(),
            usuario.getFotoPerfilAjusteY() == null ? 50 : usuario.getFotoPerfilAjusteY(),
            usuario.getFotoPerfilEnquadramento() == null ? "cover" : usuario.getFotoPerfilEnquadramento(),
            usuario.getFotoBase64(),
            usuario.getDescricaoProfissional(),
            usuario.getEspecialidades(),
            usuario.getDiasDisponiveis(),
            usuario.getHorarioInicio(),
            usuario.getHorarioFim(),
            usuario.getRaioAtendimentoKm(),
            usuario.getDocumentoIdentidadeBase64()
        );
    }
}
