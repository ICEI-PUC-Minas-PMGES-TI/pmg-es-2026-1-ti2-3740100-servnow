package com.servnow.backend.solicitacao.service;

import java.text.Normalizer;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.servnow.backend.ArmazenamentoImagens.ArquivoStorage;
import com.servnow.backend.localizacao.DistanceService;
import com.servnow.backend.localizacao.GeocodingService;
import com.servnow.backend.security.UsuarioAutenticado;
import com.servnow.backend.solicitacao.domain.SolicitacaoServico;
import com.servnow.backend.solicitacao.domain.StatusSolicitacao;
import com.servnow.backend.solicitacao.dto.SolicitacaoServicoCreateRequest;
import com.servnow.backend.solicitacao.dto.SolicitacaoServicoResponse;
import com.servnow.backend.solicitacao.repository.SolicitacaoServicoRepository;
import com.servnow.backend.usuario.domain.TipoUsuario;
import com.servnow.backend.usuario.domain.Usuario;
import com.servnow.backend.usuario.repository.UsuarioRepository;

@Service
public class SolicitacaoServicoService {

    private final SolicitacaoServicoRepository solicitacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ArquivoStorage arquivoStorage;
    private final GeocodingService geocodingService;
    private final DistanceService distanceService;

    public SolicitacaoServicoService(
        SolicitacaoServicoRepository solicitacaoRepository,
        UsuarioRepository usuarioRepository,
        ArquivoStorage arquivoStorage,
        GeocodingService geocodingService,
        DistanceService distanceService
    ) {
        this.solicitacaoRepository = solicitacaoRepository;
        this.usuarioRepository = usuarioRepository;
        this.arquivoStorage = arquivoStorage;
        this.geocodingService = geocodingService;
        this.distanceService = distanceService;
    }

    public SolicitacaoServicoResponse criar(
        UsuarioAutenticado usuarioAutenticado,
        SolicitacaoServicoCreateRequest request,
        MultipartFile imagem
    ) {
        Usuario cliente = encontrarUsuario(usuarioAutenticado);
        return criarParaCliente(cliente, request, imagem);
    }

    private SolicitacaoServicoResponse criarParaCliente(
        Usuario cliente,
        SolicitacaoServicoCreateRequest request,
        MultipartFile imagem
    ) {
        validarTipo(cliente, TipoUsuario.CLIENTE);
        SolicitacaoServico solicitacao = new SolicitacaoServico();
        solicitacao.setCliente(cliente);
        aplicarDadosSolicitacao(solicitacao, request);
        if (imagem != null && !imagem.isEmpty()) {
            solicitacao.setImagemArquivoRelativo(arquivoStorage.salvar(imagem));
        }
        solicitacao.setStatus(StatusSolicitacao.PUBLICADO);

        return toResponse(solicitacaoRepository.save(solicitacao));
    }

    @Transactional
    public SolicitacaoServicoResponse editarDoCliente(
        Long solicitacaoId,
        UsuarioAutenticado usuarioAutenticado,
        SolicitacaoServicoCreateRequest request,
        MultipartFile imagem,
        boolean removerImagem
    ) {
        Usuario cliente = encontrarUsuario(usuarioAutenticado);
        validarTipo(cliente, TipoUsuario.CLIENTE);

        SolicitacaoServico solicitacao = buscarSolicitacaoDoCliente(solicitacaoId, cliente.getId());
        if (solicitacao.getStatus() == StatusSolicitacao.AGENDADA) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Nao e possivel editar uma solicitacao agendada."
            );
        }
        aplicarDadosSolicitacao(solicitacao, request);
        solicitacao.setPrestador(null);
        solicitacao.setAceitoEm(null);
        solicitacao.setStatus(StatusSolicitacao.PUBLICADO);
        if (imagem != null && !imagem.isEmpty()) {
            String imagemAnterior = solicitacao.getImagemArquivoRelativo();
            solicitacao.setImagemArquivoRelativo(arquivoStorage.salvar(imagem));
            arquivoStorage.excluirSeExistir(imagemAnterior);
        } else if (removerImagem) {
            String imagemAnterior = solicitacao.getImagemArquivoRelativo();
            solicitacao.setImagemArquivoRelativo(null);
            arquivoStorage.excluirSeExistir(imagemAnterior);
        }

        return toResponse(solicitacaoRepository.save(solicitacao));
    }

    @Transactional
    public void excluirDoCliente(Long solicitacaoId, UsuarioAutenticado usuarioAutenticado) {
        Usuario cliente = encontrarUsuario(usuarioAutenticado);
        validarTipo(cliente, TipoUsuario.CLIENTE);

        SolicitacaoServico solicitacao = solicitacaoRepository.findById(solicitacaoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitacao nao encontrada."));

        if (!solicitacao.getCliente().getId().equals(cliente.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a esta solicitacao.");
        }

        long removidas = solicitacaoRepository.deleteByIdAndClienteId(solicitacaoId, cliente.getId());
        if (removidas == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitacao nao encontrada.");
        }

        arquivoStorage.excluirSeExistir(solicitacao.getImagemArquivoRelativo());
    }

    public List<SolicitacaoServicoResponse> listarDoCliente(UsuarioAutenticado usuarioAutenticado) {
        Usuario cliente = encontrarUsuario(usuarioAutenticado);
        validarTipo(cliente, TipoUsuario.CLIENTE);

        return solicitacaoRepository.findByClienteIdOrderByCriadoEmDesc(cliente.getId())
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public List<SolicitacaoServicoResponse> listarParaPrestadores(UsuarioAutenticado usuarioAutenticado) {
        Usuario prestador = encontrarUsuario(usuarioAutenticado);
        validarTipo(prestador, TipoUsuario.PRESTADOR);

        List<SolicitacaoServico> publicadas = solicitacaoRepository.findByStatusOrderByCriadoEmDesc(StatusSolicitacao.PUBLICADO);
        garantirCoordenadasPrestador(prestador);
        preencherCoordenadasPendentes(publicadas);

        return publicadas.stream()
            .map(solicitacao -> toResponse(solicitacao, prestador))
            .toList();
    }

    private void garantirCoordenadasPrestador(Usuario prestador) {
        if (prestador.getLatitude() != null && prestador.getLongitude() != null) {
            return;
        }
        if (!temEnderecoCompleto(prestador)) {
            return;
        }
        aplicarGeocodificacao(prestador);
        if (prestador.getLatitude() != null && prestador.getLongitude() != null) {
            usuarioRepository.save(prestador);
        }
    }

    private boolean temEnderecoCompleto(Usuario usuario) {
        return usuario.getRua() != null
            && usuario.getNumero() != null
            && usuario.getBairro() != null
            && usuario.getCidade() != null
            && usuario.getEstado() != null
            && usuario.getCep() != null;
    }

    private void aplicarGeocodificacao(Usuario usuario) {
        geocodingService.geocode(usuario).ifPresentOrElse(
            coords -> {
                usuario.setLatitude(coords.latitude());
                usuario.setLongitude(coords.longitude());
            },
            () -> {
                usuario.setLatitude(null);
                usuario.setLongitude(null);
            }
        );
    }

    private void preencherCoordenadasPendentes(List<SolicitacaoServico> solicitacoes) {
        int preenchidas = 0;
        final int limitePorRequisicao = 5;
        for (SolicitacaoServico solicitacao : solicitacoes) {
            if (preenchidas >= limitePorRequisicao) {
                break;
            }
            if (solicitacao.getLatitude() != null && solicitacao.getLongitude() != null) {
                continue;
            }
            aplicarGeocodificacao(solicitacao);
            if (solicitacao.getLatitude() != null && solicitacao.getLongitude() != null) {
                solicitacaoRepository.save(solicitacao);
                preenchidas++;
            }
        }
    }

    public List<SolicitacaoServicoResponse> listarAgendadasDoCliente(UsuarioAutenticado usuarioAutenticado) {
        Usuario cliente = encontrarUsuario(usuarioAutenticado);
        validarTipo(cliente, TipoUsuario.CLIENTE);

        return solicitacaoRepository.findByClienteIdAndStatusOrderByAceitoEmDesc(cliente.getId(), StatusSolicitacao.AGENDADA)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    public List<SolicitacaoServicoResponse> listarAgendadasDoPrestador(UsuarioAutenticado usuarioAutenticado) {
        Usuario prestador = encontrarUsuario(usuarioAutenticado);
        validarTipo(prestador, TipoUsuario.PRESTADOR);

        return solicitacaoRepository.findByPrestadorIdAndStatusOrderByAceitoEmDesc(prestador.getId(), StatusSolicitacao.AGENDADA)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    public SolicitacaoServico encontrarParaLeituraImagem(Long solicitacaoId, UsuarioAutenticado usuarioAutenticado) {
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        SolicitacaoServico solicitacao = solicitacaoRepository.findById(solicitacaoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitacao nao encontrada."));

        if (usuario.getTipoUsuario() == TipoUsuario.CLIENTE) {
            if (!solicitacao.getCliente().getId().equals(usuario.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a esta solicitacao.");
            }
            return solicitacao;
        }

        if (usuario.getTipoUsuario() == TipoUsuario.PRESTADOR) {
            if (solicitacao.getStatus() != StatusSolicitacao.PUBLICADO) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solicitacao indisponivel.");
            }
            return solicitacao;
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acao nao permitida para este tipo de usuario.");
    }

    private SolicitacaoServico buscarSolicitacaoDoCliente(Long solicitacaoId, Long clienteId) {
        SolicitacaoServico solicitacao = solicitacaoRepository.findById(solicitacaoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitacao nao encontrada."));
        if (!solicitacao.getCliente().getId().equals(clienteId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a esta solicitacao.");
        }
        return solicitacao;
    }

    private void aplicarDadosSolicitacao(SolicitacaoServico solicitacao, SolicitacaoServicoCreateRequest request) {
        solicitacao.setTipoServico(normalizarTipoServico(request.tipoServico()));
        solicitacao.setIconeServico(normalizarTexto(request.iconeServico()));
        solicitacao.setFaixaPreco(normalizarFaixaPreco(request.faixaPreco()));
        solicitacao.setDescricao(normalizarObrigatorio(request.descricao()));
        solicitacao.setCep(normalizarObrigatorio(request.cep()));
        solicitacao.setRua(normalizarObrigatorio(request.rua()));
        solicitacao.setNumero(normalizarObrigatorio(request.numero()));
        solicitacao.setComplemento(normalizarTexto(request.complemento()));
        solicitacao.setBairro(normalizarObrigatorio(request.bairro()));
        solicitacao.setCidade(normalizarObrigatorio(request.cidade()));
        solicitacao.setEstado(normalizarObrigatorio(request.estado()).toUpperCase());
        solicitacao.setEndereco(montarEndereco(solicitacao));
        solicitacao.setData(request.data());
        solicitacao.setHorario(normalizarTexto(request.horario()));
        aplicarGeocodificacao(solicitacao);
    }

    private void aplicarGeocodificacao(SolicitacaoServico solicitacao) {
        geocodingService.geocode(solicitacao).ifPresentOrElse(
            coords -> {
                solicitacao.setLatitude(coords.latitude());
                solicitacao.setLongitude(coords.longitude());
            },
            () -> {
                solicitacao.setLatitude(null);
                solicitacao.setLongitude(null);
            }
        );
    }

    private Usuario encontrarUsuario(UsuarioAutenticado usuarioAutenticado) {
        if (usuarioAutenticado == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Nao autenticado.");
        }

        return usuarioRepository.findById(usuarioAutenticado.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado."));
    }

    private void validarTipo(Usuario usuario, TipoUsuario tipoEsperado) {
        if (usuario.getTipoUsuario() != tipoEsperado) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acao nao permitida para este tipo de usuario.");
        }
    }

    private String normalizarObrigatorio(String valor) {
        String texto = normalizarTexto(valor);
        if (texto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Preencha todos os campos obrigatorios.");
        }
        return texto;
    }

    private String normalizarTipoServico(String valor) {
        String texto = normalizarObrigatorio(valor);
        return switch (texto.toUpperCase()) {
            case "ELETRICO", "ELETRICA" -> "ELETRICO";
            case "HIDRAULICO", "HIDRAULICA" -> "HIDRAULICO";
            case "PINTURA" -> "PINTURA";
            case "MONTAGEM", "MONTAGEM DE MOVEIS" -> "MONTAGEM";
            case "LIMPEZA" -> "LIMPEZA";
            case "MANUTENCAO_GERAL", "MANUTENCAO GERAL", "ELETRODOMESTICOS" -> "MANUTENCAO_GERAL";
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo de servico invalido.");
        };
    }

    private String normalizarFaixaPreco(String valor) {
        String texto = normalizarObrigatorio(valor);
        String normalizado = Normalizer.normalize(texto, Normalizer.Form.NFD)
            .replaceAll("\\p{M}", "")
            .toUpperCase()
            .replace("É", "E")
            .replace("Á", "A")
            .replace("À", "A")
            .replace(".", "")
            .trim();

        return switch (normalizado) {
            case "ATE_150", "ATE R$ 100", "ATE R$ 150" -> "ATE_150";
            case "DE_150_A_300", "R$ 100 A R$ 300", "R$ 150 A R$ 300" -> "DE_150_A_300";
            case "DE_300_A_600", "R$ 300 A R$ 600" -> "DE_300_A_600";
            case "DE_600_A_1000", "R$ 600 A R$ 1000" -> "DE_600_A_1000";
            case "ACIMA_1000", "ACIMA DE R$ 1000" -> "ACIMA_1000";
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Faixa de preco invalida.");
        };
    }

    private String normalizarTexto(String valor) {
        if (valor == null) {
            return null;
        }
        String trim = valor.trim();
        return trim.isEmpty() ? null : trim;
    }

    private String montarEndereco(SolicitacaoServico solicitacao) {
        String complemento = solicitacao.getComplemento() == null ? "" : ", " + solicitacao.getComplemento();
        return "%s, %s%s - %s, %s - %s, CEP %s".formatted(
            solicitacao.getRua(),
            solicitacao.getNumero(),
            complemento,
            solicitacao.getBairro(),
            solicitacao.getCidade(),
            solicitacao.getEstado(),
            solicitacao.getCep()
        );
    }

    private SolicitacaoServicoResponse toResponse(SolicitacaoServico solicitacao) {
        return toResponse(solicitacao, null);
    }

    private SolicitacaoServicoResponse toResponse(SolicitacaoServico solicitacao, Usuario prestadorReferencia) {
        Usuario prestador = solicitacao.getPrestador();
        String imagemUrl = solicitacao.getImagemArquivoRelativo() == null
            ? null
            : "/api/solicitacoes/" + solicitacao.getId() + "/imagem";

        Double distanciaKm = null;
        if (prestadorReferencia != null) {
            distanciaKm = distanceService.distanciaKm(
                prestadorReferencia.getLatitude(),
                prestadorReferencia.getLongitude(),
                solicitacao.getLatitude(),
                solicitacao.getLongitude()
            );
        }

        return new SolicitacaoServicoResponse(
            solicitacao.getId(),
            solicitacao.getCliente().getId(),
            solicitacao.getCliente().getNome(),
            prestador == null ? null : prestador.getId(),
            prestador == null ? null : prestador.getNome(),
            solicitacao.getEndereco(),
            solicitacao.getCep(),
            solicitacao.getRua(),
            solicitacao.getNumero(),
            solicitacao.getComplemento(),
            solicitacao.getBairro(),
            solicitacao.getCidade(),
            solicitacao.getEstado(),
            solicitacao.getTipoServico(),
            solicitacao.getIconeServico(),
            solicitacao.getFaixaPreco(),
            solicitacao.getDescricao(),
            solicitacao.getData(),
            solicitacao.getHorario(),
            imagemUrl,
            solicitacao.getStatus().name(),
            solicitacao.getCriadoEm(),
            solicitacao.getAceitoEm(),
            solicitacao.getLatitude(),
            solicitacao.getLongitude(),
            distanciaKm
        );
    }
}
