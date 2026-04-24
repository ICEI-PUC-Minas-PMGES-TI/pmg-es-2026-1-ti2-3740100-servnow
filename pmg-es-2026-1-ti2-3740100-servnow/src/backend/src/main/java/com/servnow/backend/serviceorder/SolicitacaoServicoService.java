package com.servnow.backend.serviceorder;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.servnow.backend.notification.NotificacaoService;
import com.servnow.backend.security.UsuarioAutenticado;
import com.servnow.backend.serviceorder.dto.SolicitacaoServicoRequest;
import com.servnow.backend.serviceorder.dto.SolicitacaoServicoResponse;
import com.servnow.backend.user.TipoUsuario;
import com.servnow.backend.user.Usuario;
import com.servnow.backend.user.UsuarioRepository;

@Service
public class SolicitacaoServicoService {

    private final SolicitacaoServicoRepository solicitacaoServicoRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacaoService notificacaoService;

    public SolicitacaoServicoService(
        SolicitacaoServicoRepository solicitacaoServicoRepository,
        UsuarioRepository usuarioRepository,
        NotificacaoService notificacaoService
    ) {
        this.solicitacaoServicoRepository = solicitacaoServicoRepository;
        this.usuarioRepository = usuarioRepository;
        this.notificacaoService = notificacaoService;
    }

    public SolicitacaoServicoResponse criar(UsuarioAutenticado usuarioAutenticado, SolicitacaoServicoRequest request) {
        Usuario cliente = buscarCliente(usuarioAutenticado);

        SolicitacaoServico solicitacao = new SolicitacaoServico();
        solicitacao.setCliente(cliente);
        preencherSolicitacao(solicitacao, request);

        return toResponse(solicitacaoServicoRepository.save(solicitacao));
    }

    public List<SolicitacaoServicoResponse> listarDoCliente(UsuarioAutenticado usuarioAutenticado) {
        validarTipoUsuario(usuarioAutenticado, TipoUsuario.CLIENTE);

        return solicitacaoServicoRepository.findAllByClienteIdOrderByCriadoEmDesc(usuarioAutenticado.getId()).stream()
            .map(this::toResponse)
            .toList();
    }

    public SolicitacaoServicoResponse atualizar(
        UsuarioAutenticado usuarioAutenticado,
        Long id,
        SolicitacaoServicoRequest request
    ) {
        validarTipoUsuario(usuarioAutenticado, TipoUsuario.CLIENTE);

        SolicitacaoServico solicitacao = solicitacaoServicoRepository.findByIdAndClienteId(id, usuarioAutenticado.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitacao nao encontrada."));

        preencherSolicitacao(solicitacao, request);
        return toResponse(solicitacaoServicoRepository.save(solicitacao));
    }

    public void excluir(UsuarioAutenticado usuarioAutenticado, Long id) {
        validarTipoUsuario(usuarioAutenticado, TipoUsuario.CLIENTE);

        SolicitacaoServico solicitacao = solicitacaoServicoRepository.findByIdAndClienteId(id, usuarioAutenticado.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitacao nao encontrada."));

        solicitacaoServicoRepository.delete(solicitacao);
    }

    public List<SolicitacaoServicoResponse> listarPublicadasParaPrestadores(
        UsuarioAutenticado usuarioAutenticado,
        String tipoServico,
        String faixaPreco,
        String data,
        Integer distanciaKm
    ) {
        validarTipoUsuario(usuarioAutenticado, TipoUsuario.PRESTADOR);

        return solicitacaoServicoRepository.findAllByStatusOrderByCriadoEmDesc(StatusSolicitacao.PUBLICADO).stream()
            .filter(solicitacao -> filtroTipoServico(solicitacao, tipoServico))
            .filter(solicitacao -> filtroFaixaPreco(solicitacao, faixaPreco))
            .filter(solicitacao -> filtroData(solicitacao, data))
            .filter(solicitacao -> filtroDistancia(distanciaKm))
            .map(this::toResponse)
            .toList();
    }

    public SolicitacaoServicoResponse aceitarSolicitacao(UsuarioAutenticado usuarioAutenticado, Long id) {
        validarTipoUsuario(usuarioAutenticado, TipoUsuario.PRESTADOR);

        Usuario prestador = usuarioRepository.findById(usuarioAutenticado.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado."));

        SolicitacaoServico solicitacao = solicitacaoServicoRepository.findByIdAndStatus(id, StatusSolicitacao.PUBLICADO)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitacao disponivel nao encontrada."));

        solicitacao.setPrestador(prestador);
        solicitacao.setStatus(StatusSolicitacao.ACEITO);
        solicitacao.setAceitoEm(OffsetDateTime.now());

        SolicitacaoServico salva = solicitacaoServicoRepository.save(solicitacao);

        notificacaoService.notificar(
            solicitacao.getCliente(),
            "Servico aceito",
            "O prestador " + prestador.getNome() + " aceitou sua solicitacao de "
                + solicitacao.getTipoServico().name().toLowerCase() + "."
        );

        return toResponse(salva);
    }

    private Usuario buscarCliente(UsuarioAutenticado usuarioAutenticado) {
        validarTipoUsuario(usuarioAutenticado, TipoUsuario.CLIENTE);

        return usuarioRepository.findById(usuarioAutenticado.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado."));
    }

    private void validarTipoUsuario(UsuarioAutenticado usuarioAutenticado, TipoUsuario tipoEsperado) {
        if (!tipoEsperado.name().equals(usuarioAutenticado.getTipoUsuario())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Voce nao tem permissao para acessar este recurso.");
        }
    }

    private void preencherSolicitacao(SolicitacaoServico solicitacao, SolicitacaoServicoRequest request) {
        solicitacao.setEndereco(request.endereco().trim());
        solicitacao.setTipoServico(parseTipoServico(request.tipoServico()));
        solicitacao.setFaixaPreco(parseFaixaPreco(request.faixaPreco()));
        solicitacao.setDescricao(request.descricao().trim());
        solicitacao.setData(parseData(request.data()));
        solicitacao.setHorario(parseHorario(request.horario()));
        solicitacao.setImagemBase64(normalizarImagem(request.imagemBase64()));
        solicitacao.setStatus(StatusSolicitacao.PUBLICADO);
    }

    private TipoServico parseTipoServico(String valor) {
        try {
            return TipoServico.valueOf(valor.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo de servico invalido.");
        }
    }

    private FaixaPreco parseFaixaPreco(String valor) {
        try {
            return FaixaPreco.valueOf(valor.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Faixa de preco invalida.");
        }
    }

    private LocalDate parseData(String valor) {
        try {
            return LocalDate.parse(valor);
        } catch (DateTimeParseException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Data do servico invalida.");
        }
    }

    private LocalTime parseHorario(String valor) {
        try {
            return LocalTime.parse(valor);
        } catch (DateTimeParseException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Horario do servico invalido.");
        }
    }

    private String normalizarImagem(String imagemBase64) {
        if (imagemBase64 == null || imagemBase64.isBlank()) {
            return null;
        }

        return imagemBase64.trim();
    }

    private boolean filtroTipoServico(SolicitacaoServico solicitacao, String tipoServico) {
        if (tipoServico == null || tipoServico.isBlank()) {
            return true;
        }

        return Objects.equals(solicitacao.getTipoServico().name(), tipoServico.trim().toUpperCase());
    }

    private boolean filtroFaixaPreco(SolicitacaoServico solicitacao, String faixaPreco) {
        if (faixaPreco == null || faixaPreco.isBlank()) {
            return true;
        }

        return Objects.equals(solicitacao.getFaixaPreco().name(), faixaPreco.trim().toUpperCase());
    }

    private boolean filtroData(SolicitacaoServico solicitacao, String data) {
        if (data == null || data.isBlank()) {
            return true;
        }

        return solicitacao.getData().equals(parseData(data));
    }

    private boolean filtroDistancia(Integer distanciaKm) {
        return distanciaKm == null || distanciaKm >= 0;
    }

    private SolicitacaoServicoResponse toResponse(SolicitacaoServico solicitacao) {
        return new SolicitacaoServicoResponse(
            solicitacao.getId(),
            solicitacao.getCliente().getId(),
            solicitacao.getCliente().getNome(),
            solicitacao.getPrestador() != null ? solicitacao.getPrestador().getId() : null,
            solicitacao.getPrestador() != null ? solicitacao.getPrestador().getNome() : null,
            solicitacao.getEndereco(),
            solicitacao.getTipoServico().name(),
            solicitacao.getFaixaPreco().name(),
            solicitacao.getDescricao(),
            solicitacao.getData(),
            solicitacao.getHorario(),
            solicitacao.getImagemBase64(),
            solicitacao.getStatus().name(),
            solicitacao.getCriadoEm(),
            solicitacao.getAceitoEm()
        );
    }
}
