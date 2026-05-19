package com.servnow.backend.perfil.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.servnow.backend.ArmazenamentoImagens.ArquivoStorage;
import com.servnow.backend.perfil.dto.PerfilResponse;
import com.servnow.backend.perfil.dto.PerfilUpdateRequest;
import com.servnow.backend.security.UsuarioAutenticado;
import com.servnow.backend.usuario.domain.TipoUsuario;
import com.servnow.backend.usuario.domain.Usuario;
import com.servnow.backend.usuario.repository.UsuarioRepository;

@Service
public class PerfilService {

    private final UsuarioRepository usuarioRepository;
    private final ArquivoStorage arquivoStorage;

    public PerfilService(UsuarioRepository usuarioRepository, ArquivoStorage arquivoStorage) {
        this.usuarioRepository = usuarioRepository;
        this.arquivoStorage = arquivoStorage;
    }

    public PerfilResponse buscar(UsuarioAutenticado usuarioAutenticado) {
        return toResponse(encontrarUsuario(usuarioAutenticado));
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

    public PerfilResponse atualizar(
        UsuarioAutenticado usuarioAutenticado,
        PerfilUpdateRequest request,
        MultipartFile fotoPerfil,
        MultipartFile fotoLocal,
        MultipartFile documentoIdentidade
    ) {
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        aplicarAtualizacaoComum(usuario, request, fotoPerfil, fotoLocal);
        if (usuario.getTipoUsuario() == TipoUsuario.PRESTADOR) {
            atualizarDadosPrestador(usuario, request, documentoIdentidade);
        }
        return toResponse(usuarioRepository.save(usuario));
    }

    public PerfilResponse atualizarCliente(
        UsuarioAutenticado usuarioAutenticado,
        PerfilUpdateRequest request,
        MultipartFile fotoPerfil,
        MultipartFile fotoLocal,
        MultipartFile documentoIdentidade
    ) {
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        validarTipo(usuario, TipoUsuario.CLIENTE);
        aplicarAtualizacaoComum(usuario, request, fotoPerfil, fotoLocal);
        return toResponse(usuarioRepository.save(usuario));
    }

    public PerfilResponse atualizarPrestador(
        UsuarioAutenticado usuarioAutenticado,
        PerfilUpdateRequest request,
        MultipartFile fotoPerfil,
        MultipartFile fotoLocal,
        MultipartFile documentoIdentidade
    ) {
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        validarTipo(usuario, TipoUsuario.PRESTADOR);
        atualizarNome(usuario, request);
        aplicarFotoPerfil(usuario, request, fotoPerfil);
        atualizarEnquadramentoFotoPerfil(usuario, request);
        usuario.setDescricaoProfissional(normalizarTextoLongo(request.descricaoProfissional()));
        usuario.setEspecialidades(normalizarTexto(request.especialidades()));
        atualizarDadosPrestador(usuario, request, documentoIdentidade);
        return toResponse(usuarioRepository.save(usuario));
    }

    public Usuario encontrarParaLeituraArquivo(Long usuarioId, UsuarioAutenticado autenticado) {
        if (!autenticado.getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado ao arquivo.");
        }
        return encontrarUsuario(autenticado);
    }

    public String caminhoFotoPerfil(Usuario usuario) {
        return usuario.getFotoPerfilArquivoRelativo();
    }

    public String caminhoFotoLocal(Usuario usuario) {
        return usuario.getFotoLocalArquivoRelativo();
    }

    public String caminhoDocumentoIdentidade(Usuario usuario) {
        return usuario.getDocumentoIdentidadeArquivoRelativo();
    }

    private void aplicarAtualizacaoComum(
        Usuario usuario,
        PerfilUpdateRequest request,
        MultipartFile fotoPerfil,
        MultipartFile fotoLocal
    ) {
        atualizarNome(usuario, request);
        usuario.setRua(normalizarTexto(request.rua()));
        usuario.setNumero(normalizarTexto(request.numero()));
        usuario.setCep(normalizarTexto(request.cep()));
        usuario.setComplemento(normalizarTexto(request.complemento()));
        usuario.setBairro(normalizarTexto(request.bairro()));
        usuario.setCidade(normalizarTexto(request.cidade()));
        usuario.setEstado(normalizarEstado(request.estado()));
        aplicarFotoPerfil(usuario, request, fotoPerfil);
        atualizarEnquadramentoFotoPerfil(usuario, request);
        aplicarFotoLocal(usuario, request, fotoLocal);
        usuario.setDescricaoProfissional(normalizarTextoLongo(request.descricaoProfissional()));
        usuario.setEspecialidades(normalizarTexto(request.especialidades()));
    }

    private void atualizarDadosPrestador(
        Usuario usuario,
        PerfilUpdateRequest request,
        MultipartFile documentoIdentidade
    ) {
        usuario.setDiasDisponiveis(validarDiasDisponiveis(request.diasDisponiveis()));
        usuario.setHorarioInicio(validarHorario(request.horarioInicio(), "Horario de inicio invalido."));
        usuario.setHorarioFim(validarHorario(request.horarioFim(), "Horario de fim invalido."));
        validarIntervaloHorarios(usuario.getHorarioInicio(), usuario.getHorarioFim());
        usuario.setRaioAtendimentoKm(validarRaioAtendimento(request.raioAtendimentoKm()));
        aplicarDocumentoIdentidade(usuario, request, documentoIdentidade);
    }

    private void aplicarFotoPerfil(Usuario usuario, PerfilUpdateRequest request, MultipartFile arquivo) {
        if (Boolean.TRUE.equals(request.removerFotoPerfil())) {
            arquivoStorage.excluirSeExistir(usuario.getFotoPerfilArquivoRelativo());
            usuario.setFotoPerfilArquivoRelativo(null);
            return;
        }
        if (arquivo != null && !arquivo.isEmpty()) {
            arquivoStorage.excluirSeExistir(usuario.getFotoPerfilArquivoRelativo());
            usuario.setFotoPerfilArquivoRelativo(
                arquivoStorage.salvarImagem(arquivo, ArquivoStorage.PASTA_PERFIL)
            );
        }
    }

    private void aplicarFotoLocal(Usuario usuario, PerfilUpdateRequest request, MultipartFile arquivo) {
        if (Boolean.TRUE.equals(request.removerFotoLocal())) {
            arquivoStorage.excluirSeExistir(usuario.getFotoLocalArquivoRelativo());
            usuario.setFotoLocalArquivoRelativo(null);
            return;
        }
        if (arquivo != null && !arquivo.isEmpty()) {
            arquivoStorage.excluirSeExistir(usuario.getFotoLocalArquivoRelativo());
            usuario.setFotoLocalArquivoRelativo(
                arquivoStorage.salvarImagem(arquivo, ArquivoStorage.PASTA_FOTO_LOCAL)
            );
        }
    }

    private void aplicarDocumentoIdentidade(
        Usuario usuario,
        PerfilUpdateRequest request,
        MultipartFile arquivo
    ) {
        if (Boolean.TRUE.equals(request.removerDocumentoIdentidade())) {
            arquivoStorage.excluirSeExistir(usuario.getDocumentoIdentidadeArquivoRelativo());
            usuario.setDocumentoIdentidadeArquivoRelativo(null);
            return;
        }
        if (arquivo != null && !arquivo.isEmpty()) {
            arquivoStorage.excluirSeExistir(usuario.getDocumentoIdentidadeArquivoRelativo());
            usuario.setDocumentoIdentidadeArquivoRelativo(arquivoStorage.salvarDocumento(arquivo));
            return;
        }
        if (usuario.getDocumentoIdentidadeArquivoRelativo() == null
            || usuario.getDocumentoIdentidadeArquivoRelativo().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Envie o documento de identidade.");
        }
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
            urlFotoPerfil(usuario),
            usuario.getFotoPerfilAjusteX() == null ? 50 : usuario.getFotoPerfilAjusteX(),
            usuario.getFotoPerfilAjusteY() == null ? 50 : usuario.getFotoPerfilAjusteY(),
            usuario.getFotoPerfilEnquadramento() == null ? "cover" : usuario.getFotoPerfilEnquadramento(),
            urlFotoLocal(usuario),
            usuario.getDescricaoProfissional(),
            usuario.getEspecialidades(),
            usuario.getDiasDisponiveis(),
            usuario.getHorarioInicio(),
            usuario.getHorarioFim(),
            usuario.getRaioAtendimentoKm(),
            urlDocumentoIdentidade(usuario)
        );
    }

    public static String urlFotoPerfil(Usuario usuario) {
        return temArquivo(usuario.getFotoPerfilArquivoRelativo()) ? "/api/perfil/foto-perfil" : null;
    }

    public static String urlFotoLocal(Usuario usuario) {
        return temArquivo(usuario.getFotoLocalArquivoRelativo()) ? "/api/perfil/foto-local" : null;
    }

    public static String urlDocumentoIdentidade(Usuario usuario) {
        return temArquivo(usuario.getDocumentoIdentidadeArquivoRelativo())
            ? "/api/perfil/documento-identidade"
            : null;
    }

    private static boolean temArquivo(String caminho) {
        return caminho != null && !caminho.isBlank();
    }
}
