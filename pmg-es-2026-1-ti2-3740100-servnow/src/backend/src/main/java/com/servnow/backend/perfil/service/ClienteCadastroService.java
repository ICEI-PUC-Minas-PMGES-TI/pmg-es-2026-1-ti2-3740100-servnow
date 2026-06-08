package com.servnow.backend.perfil.service;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.servnow.backend.ArmazenamentoImagens.ArquivoStorage;
import com.servnow.backend.localizacao.GeocodingService;
import com.servnow.backend.perfil.domain.ClienteChavePix;
import com.servnow.backend.perfil.domain.ClienteEndereco;
import com.servnow.backend.perfil.dto.ClienteCadastroSyncRequest;
import com.servnow.backend.perfil.dto.ClienteChavePixRequest;
import com.servnow.backend.perfil.dto.ClienteChavePixResponse;
import com.servnow.backend.perfil.dto.ClienteEnderecoRequest;
import com.servnow.backend.perfil.dto.ClienteEnderecoResponse;
import com.servnow.backend.perfil.repository.ClienteChavePixRepository;
import com.servnow.backend.perfil.repository.ClienteEnderecoRepository;
import com.servnow.backend.usuario.domain.TipoUsuario;
import com.servnow.backend.usuario.domain.Usuario;
import com.servnow.backend.usuario.repository.UsuarioRepository;

@Service
public class ClienteCadastroService {

    private final ClienteEnderecoRepository enderecoRepository;
    private final ClienteChavePixRepository chavePixRepository;
    private final UsuarioRepository usuarioRepository;
    private final ArquivoStorage arquivoStorage;
    private final GeocodingService geocodingService;

    public ClienteCadastroService(
        ClienteEnderecoRepository enderecoRepository,
        ClienteChavePixRepository chavePixRepository,
        UsuarioRepository usuarioRepository,
        ArquivoStorage arquivoStorage,
        GeocodingService geocodingService
    ) {
        this.enderecoRepository = enderecoRepository;
        this.chavePixRepository = chavePixRepository;
        this.usuarioRepository = usuarioRepository;
        this.arquivoStorage = arquivoStorage;
        this.geocodingService = geocodingService;
    }

    @Transactional
    public List<ClienteEnderecoResponse> listarEnderecos(Usuario usuario) {
        validarCliente(usuario);
        garantirMigracaoLegado(usuario);
        return enderecoRepository.findByUsuario_IdOrderByPrincipalDescCriadoEmAsc(usuario.getId()).stream()
            .map(this::toEnderecoResponse)
            .toList();
    }

    @Transactional
    public List<ClienteChavePixResponse> listarChavesPix(Usuario usuario) {
        validarCliente(usuario);
        garantirMigracaoLegadoChavePix(usuario);
        return chavePixRepository.findByUsuario_IdOrderByPrincipalDescCriadoEmAsc(usuario.getId()).stream()
            .map(this::toChavePixResponse)
            .toList();
    }

    @Transactional
    public void sincronizar(Usuario usuario, ClienteCadastroSyncRequest request) {
        validarCliente(usuario);
        List<ClienteEnderecoRequest> enderecosReq = request.enderecos() == null ? List.of() : request.enderecos();
        List<ClienteChavePixRequest> chavesReq = request.chavesPix() == null ? List.of() : request.chavesPix();

        if (enderecosReq.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cadastre pelo menos um endereco.");
        }

        sincronizarEnderecos(usuario, enderecosReq);
        sincronizarChavesPix(usuario, chavesReq);
        sincronizarUsuarioComPrincipal(usuario);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void salvarFotoEndereco(Usuario usuario, Long enderecoId, MultipartFile arquivo) {
        validarCliente(usuario);
        ClienteEndereco endereco = enderecoRepository.findByIdAndUsuario_Id(enderecoId, usuario.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Endereco nao encontrado."));

        if (arquivo == null || arquivo.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Envie uma imagem.");
        }

        arquivoStorage.excluirSeExistir(endereco.getFotoArquivoRelativo());
        endereco.setFotoArquivoRelativo(
            arquivoStorage.salvarImagem(arquivo, ArquivoStorage.PASTA_ENDERECO_CLIENTE)
        );
        enderecoRepository.save(endereco);
    }

    public String caminhoFotoEndereco(Usuario usuario, Long enderecoId) {
        validarCliente(usuario);
        ClienteEndereco endereco = enderecoRepository.findByIdAndUsuario_Id(enderecoId, usuario.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Endereco nao encontrado."));
        return endereco.getFotoArquivoRelativo();
    }

    public String caminhoFotoEnderecoPrincipal(Usuario usuario) {
        validarCliente(usuario);
        return enderecoRepository.findByUsuario_IdOrderByPrincipalDescCriadoEmAsc(usuario.getId()).stream()
            .filter(ClienteEndereco::isPrincipal)
            .map(ClienteEndereco::getFotoArquivoRelativo)
            .filter(ClienteCadastroService::temArquivo)
            .findFirst()
            .orElse(null);
    }

    public static String urlFotoEndereco(Long enderecoId) {
        return "/api/perfil/cliente/enderecos/" + enderecoId + "/foto";
    }

    private void sincronizarEnderecos(Usuario usuario, List<ClienteEnderecoRequest> requests) {
        garantirUmPrincipalEndereco(requests);
        List<ClienteEndereco> existentes = enderecoRepository.findByUsuario_IdOrderByPrincipalDescCriadoEmAsc(usuario.getId());
        Set<Long> idsMantidos = new HashSet<>();

        for (ClienteEnderecoRequest req : requests) {
            validarEnderecoRequest(req);
            ClienteEndereco entidade = resolverEndereco(usuario, req, existentes);
            aplicarEndereco(entidade, req);
            entidade.setPrincipal(Boolean.TRUE.equals(req.principal()));
            ClienteEndereco salvo = enderecoRepository.save(entidade);
            idsMantidos.add(salvo.getId());

            if (Boolean.TRUE.equals(req.removerFoto())) {
                arquivoStorage.excluirSeExistir(salvo.getFotoArquivoRelativo());
                salvo.setFotoArquivoRelativo(null);
                enderecoRepository.save(salvo);
            }
        }

        for (ClienteEndereco antigo : existentes) {
            if (!idsMantidos.contains(antigo.getId())) {
                arquivoStorage.excluirSeExistir(antigo.getFotoArquivoRelativo());
                enderecoRepository.delete(antigo);
            }
        }
    }

    private void sincronizarChavesPix(Usuario usuario, List<ClienteChavePixRequest> requests) {
        if (requests.isEmpty()) {
            for (ClienteChavePix antiga : chavePixRepository.findByUsuario_IdOrderByPrincipalDescCriadoEmAsc(usuario.getId())) {
                chavePixRepository.delete(antiga);
            }
            usuario.setChavePix(null);
            return;
        }

        garantirUmPrincipalChavePix(requests);
        List<ClienteChavePix> existentes = chavePixRepository.findByUsuario_IdOrderByPrincipalDescCriadoEmAsc(usuario.getId());
        Set<Long> idsMantidos = new HashSet<>();

        for (ClienteChavePixRequest req : requests) {
            validarChavePixRequest(req);
            ClienteChavePix entidade = resolverChavePix(usuario, req, existentes);
            aplicarChavePix(entidade, req);
            entidade.setPrincipal(Boolean.TRUE.equals(req.principal()));
            idsMantidos.add(chavePixRepository.save(entidade).getId());
        }

        for (ClienteChavePix antiga : existentes) {
            if (!idsMantidos.contains(antiga.getId())) {
                chavePixRepository.delete(antiga);
            }
        }
    }

    private void sincronizarUsuarioComPrincipal(Usuario usuario) {
        ClienteEndereco principalEndereco = enderecoRepository
            .findByUsuario_IdOrderByPrincipalDescCriadoEmAsc(usuario.getId())
            .stream()
            .filter(ClienteEndereco::isPrincipal)
            .findFirst()
            .orElse(null);

        if (principalEndereco != null) {
            usuario.setRua(principalEndereco.getRua());
            usuario.setNumero(principalEndereco.getNumero());
            usuario.setCep(principalEndereco.getCep());
            usuario.setComplemento(principalEndereco.getComplemento());
            usuario.setBairro(principalEndereco.getBairro());
            usuario.setCidade(principalEndereco.getCidade());
            usuario.setEstado(principalEndereco.getEstado());
            if (principalEndereco.getFotoArquivoRelativo() != null) {
                usuario.setFotoLocalArquivoRelativo(principalEndereco.getFotoArquivoRelativo());
            }
            geocodingService.geocode(usuario).ifPresent(coords -> {
                usuario.setLatitude(coords.latitude());
                usuario.setLongitude(coords.longitude());
            });
        }

        chavePixRepository.findByUsuario_IdOrderByPrincipalDescCriadoEmAsc(usuario.getId()).stream()
            .filter(ClienteChavePix::isPrincipal)
            .findFirst()
            .ifPresentOrElse(
                chave -> usuario.setChavePix(chave.getChave()),
                () -> usuario.setChavePix(null)
            );
    }

    private ClienteEndereco resolverEndereco(
        Usuario usuario,
        ClienteEnderecoRequest req,
        List<ClienteEndereco> existentes
    ) {
        if (req.id() != null) {
            return existentes.stream()
                .filter(item -> Objects.equals(item.getId(), req.id()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Endereco invalido."));
        }
        ClienteEndereco novo = new ClienteEndereco();
        novo.setUsuario(usuario);
        return novo;
    }

    private ClienteChavePix resolverChavePix(
        Usuario usuario,
        ClienteChavePixRequest req,
        List<ClienteChavePix> existentes
    ) {
        if (req.id() != null) {
            return existentes.stream()
                .filter(item -> Objects.equals(item.getId(), req.id()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chave PIX invalida."));
        }
        ClienteChavePix novo = new ClienteChavePix();
        novo.setUsuario(usuario);
        return novo;
    }

    private void aplicarEndereco(ClienteEndereco entidade, ClienteEnderecoRequest req) {
        entidade.setRotulo(normalizarTexto(req.rotulo()));
        entidade.setRua(obrigatorio(req.rua(), "Informe a rua."));
        entidade.setNumero(obrigatorio(req.numero(), "Informe o numero."));
        entidade.setCep(normalizarCep(req.cep()));
        entidade.setComplemento(normalizarTexto(req.complemento()));
        entidade.setBairro(obrigatorio(req.bairro(), "Informe o bairro."));
        entidade.setCidade(obrigatorio(req.cidade(), "Informe a cidade."));
        entidade.setEstado(normalizarEstado(req.estado()));
    }

    private void aplicarChavePix(ClienteChavePix entidade, ClienteChavePixRequest req) {
        entidade.setRotulo(normalizarTexto(req.rotulo()));
        entidade.setChave(validarChavePix(req.chave()));
        entidade.setTipo(normalizarTipoPix(req.tipo()));
    }

    private void garantirMigracaoLegado(Usuario usuario) {
        if (enderecoRepository.countByUsuario_Id(usuario.getId()) > 0) {
            return;
        }
        if (!temEnderecoLegado(usuario)) {
            return;
        }

        ClienteEndereco legado = new ClienteEndereco();
        legado.setUsuario(usuario);
        legado.setRotulo("Principal");
        legado.setRua(usuario.getRua());
        legado.setNumero(usuario.getNumero());
        legado.setCep(usuario.getCep());
        legado.setComplemento(usuario.getComplemento());
        legado.setBairro(usuario.getBairro());
        legado.setCidade(usuario.getCidade());
        legado.setEstado(usuario.getEstado());
        legado.setFotoArquivoRelativo(usuario.getFotoLocalArquivoRelativo());
        legado.setPrincipal(true);
        enderecoRepository.save(legado);
    }

    private void garantirMigracaoLegadoChavePix(Usuario usuario) {
        if (chavePixRepository.countByUsuario_Id(usuario.getId()) > 0) {
            return;
        }
        if (usuario.getChavePix() == null || usuario.getChavePix().isBlank()) {
            return;
        }

        ClienteChavePix legado = new ClienteChavePix();
        legado.setUsuario(usuario);
        legado.setRotulo("Principal");
        legado.setChave(usuario.getChavePix().trim());
        legado.setTipo("OUTRA");
        legado.setPrincipal(true);
        chavePixRepository.save(legado);
    }

    private boolean temEnderecoLegado(Usuario usuario) {
        return usuario.getCep() != null
            && !usuario.getCep().isBlank()
            && usuario.getRua() != null
            && !usuario.getRua().isBlank();
    }

    private void garantirUmPrincipalEndereco(List<ClienteEnderecoRequest> requests) {
        long principais = requests.stream().filter(req -> Boolean.TRUE.equals(req.principal())).count();
        if (principais != 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecione exatamente um endereco principal.");
        }
    }

    private void garantirUmPrincipalChavePix(List<ClienteChavePixRequest> requests) {
        long principais = requests.stream().filter(req -> Boolean.TRUE.equals(req.principal())).count();
        if (principais != 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecione exatamente uma chave PIX principal.");
        }
    }

    private void validarEnderecoRequest(ClienteEnderecoRequest req) {
        String cep = normalizarCep(req.cep());
        if (cep.length() != 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe um CEP valido com 8 digitos.");
        }
    }

    private void validarChavePixRequest(ClienteChavePixRequest req) {
        validarChavePix(req.chave());
    }

    private String validarChavePix(String valor) {
        String texto = normalizarTexto(valor);
        if (texto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe a chave PIX.");
        }
        if (texto.length() > 140) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A chave PIX deve ter no maximo 140 caracteres.");
        }
        return texto;
    }

    private String normalizarCep(String valor) {
        if (valor == null) {
            return "";
        }
        return valor.replaceAll("\\D", "");
    }

    private String normalizarEstado(String valor) {
        String texto = normalizarTexto(valor);
        return texto == null ? null : texto.toUpperCase();
    }

    private String normalizarTipoPix(String valor) {
        String texto = normalizarTexto(valor);
        return texto == null ? "OUTRA" : texto.toUpperCase();
    }

    private String obrigatorio(String valor, String mensagem) {
        String texto = normalizarTexto(valor);
        if (texto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, mensagem);
        }
        return texto;
    }

    private String normalizarTexto(String valor) {
        if (valor == null) {
            return null;
        }
        String trim = valor.trim();
        return trim.isEmpty() ? null : trim;
    }

    private void validarCliente(Usuario usuario) {
        if (usuario.getTipoUsuario() != TipoUsuario.CLIENTE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Recurso disponivel apenas para clientes.");
        }
    }

    public ClienteEnderecoResponse toEnderecoResponse(ClienteEndereco endereco) {
        String fotoUrl = temArquivo(endereco.getFotoArquivoRelativo())
            ? urlFotoEndereco(endereco.getId())
            : null;
        return new ClienteEnderecoResponse(
            endereco.getId(),
            endereco.getRotulo(),
            endereco.getRua(),
            endereco.getNumero(),
            endereco.getCep(),
            endereco.getComplemento(),
            endereco.getBairro(),
            endereco.getCidade(),
            endereco.getEstado(),
            fotoUrl,
            endereco.isPrincipal()
        );
    }

    public ClienteChavePixResponse toChavePixResponse(ClienteChavePix chave) {
        return new ClienteChavePixResponse(
            chave.getId(),
            chave.getRotulo(),
            chave.getChave(),
            chave.getTipo(),
            chave.isPrincipal()
        );
    }

    private static boolean temArquivo(String caminho) {
        return caminho != null && !caminho.isBlank();
    }
}
