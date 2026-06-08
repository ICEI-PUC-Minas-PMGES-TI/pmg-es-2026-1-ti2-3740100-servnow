package com.servnow.backend.acompanhamento.service;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.servnow.backend.ArmazenamentoImagens.ArquivoLeitura;
import com.servnow.backend.ArmazenamentoImagens.ArquivoStorage;
import com.servnow.backend.acompanhamento.domain.AtualizacaoServico;
import com.servnow.backend.acompanhamento.domain.EtapaOrdemServico;
import com.servnow.backend.acompanhamento.domain.OrdemServico;
import com.servnow.backend.acompanhamento.dto.AcompanhamentoDetalheResponse;
import com.servnow.backend.acompanhamento.dto.AcompanhamentoDisponivelResponse;
import com.servnow.backend.acompanhamento.dto.AtualizacaoServicoResponse;
import com.servnow.backend.acompanhamento.dto.AvaliarServicoRequest;
import com.servnow.backend.acompanhamento.dto.ConfirmarChegadaRequest;
import com.servnow.backend.acompanhamento.dto.ConfirmarPagamentoRequest;
import com.servnow.backend.acompanhamento.dto.ConfirmarReagendamentoRequest;
import com.servnow.backend.acompanhamento.dto.SolicitarReagendamentoRequest;
import com.servnow.backend.acompanhamento.pix.PixQrCodeService;
import com.servnow.backend.acompanhamento.repository.AtualizacaoServicoRepository;
import com.servnow.backend.acompanhamento.repository.OrdemServicoRepository;
import com.servnow.backend.security.UsuarioAutenticado;
import com.servnow.backend.solicitacao.domain.SolicitacaoServico;
import com.servnow.backend.solicitacao.domain.StatusSolicitacao;
import com.servnow.backend.solicitacao.repository.SolicitacaoServicoRepository;
import com.servnow.backend.usuario.domain.TipoUsuario;
import com.servnow.backend.usuario.domain.Usuario;
import com.servnow.backend.usuario.repository.UsuarioRepository;
import com.servnow.backend.verificacaofacial.FaceVerificationProperties;
import com.servnow.backend.verificacaofacial.service.VerificacaoFacialService;

@Service
public class AcompanhamentoService {

    private static final int CODIGO_VALIDADE_MINUTOS = 30;

    private final SolicitacaoServicoRepository solicitacaoRepository;
    private final OrdemServicoRepository ordemRepository;
    private final AtualizacaoServicoRepository atualizacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ArquivoStorage arquivoStorage;
    private final PixQrCodeService pixQrCodeService;
    private final VerificacaoFacialService verificacaoFacialService;
    private final FaceVerificationProperties faceVerificationProperties;
    private final SecureRandom random = new SecureRandom();

    public AcompanhamentoService(
        SolicitacaoServicoRepository solicitacaoRepository,
        OrdemServicoRepository ordemRepository,
        AtualizacaoServicoRepository atualizacaoRepository,
        UsuarioRepository usuarioRepository,
        ArquivoStorage arquivoStorage,
        PixQrCodeService pixQrCodeService,
        VerificacaoFacialService verificacaoFacialService,
        FaceVerificationProperties faceVerificationProperties
    ) {
        this.solicitacaoRepository = solicitacaoRepository;
        this.ordemRepository = ordemRepository;
        this.atualizacaoRepository = atualizacaoRepository;
        this.usuarioRepository = usuarioRepository;
        this.arquivoStorage = arquivoStorage;
        this.pixQrCodeService = pixQrCodeService;
        this.verificacaoFacialService = verificacaoFacialService;
        this.faceVerificationProperties = faceVerificationProperties;
    }

    @Transactional(readOnly = true)
    public List<AcompanhamentoDisponivelResponse> listarDisponiveis(UsuarioAutenticado usuarioAutenticado) {
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        List<SolicitacaoServico> solicitacoes = switch (usuario.getTipoUsuario()) {
            case CLIENTE -> solicitacaoRepository.findAgendadasComParticipantesByClienteId(
                usuario.getId(),
                StatusSolicitacao.AGENDADA
            );
            case PRESTADOR -> solicitacaoRepository.findAgendadasComParticipantesByPrestadorId(
                usuario.getId(),
                StatusSolicitacao.AGENDADA
            );
            default -> throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acao nao permitida para este tipo de usuario.");
        };

        return solicitacoes.stream()
            .map(solicitacao -> toDisponivel(solicitacao, usuario.getTipoUsuario()))
            .toList();
    }

    @Transactional
    public AcompanhamentoDetalheResponse obterDetalhe(Long solicitacaoId, UsuarioAutenticado usuarioAutenticado) {
        SolicitacaoServico solicitacao = buscarSolicitacaoParticipante(solicitacaoId, usuarioAutenticado);
        validarPodeConsultarDetalhe(solicitacao);
        OrdemServico ordem = switch (solicitacao.getStatus()) {
            case AGENDADA -> {
                validarPodeAcompanhar(solicitacao);
                OrdemServico existente = obterOuCriarOrdem(solicitacao);
                prepararCodigoChegadaSeNecessario(solicitacao, existente);
                yield existente;
            }
            default -> ordemRepository.findWithDetalhesBySolicitacaoId(solicitacaoId)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Ordem de servico nao encontrada."
                ));
        };
        return toDetalhe(solicitacao, ordem, usuarioAutenticado);
    }

    @Transactional
    public AcompanhamentoDetalheResponse iniciar(Long solicitacaoId, UsuarioAutenticado usuarioAutenticado) {
        SolicitacaoServico solicitacao = buscarSolicitacaoParticipante(solicitacaoId, usuarioAutenticado);
        validarPodeAcompanhar(solicitacao);
        OrdemServico ordem = obterOuCriarOrdem(solicitacao);
        prepararCodigoChegadaSeNecessario(solicitacao, ordem);
        return toDetalhe(solicitacao, ordem, usuarioAutenticado);
    }

    @Transactional
    public AcompanhamentoDetalheResponse renovarCodigo(Long solicitacaoId, UsuarioAutenticado usuarioAutenticado) {
        SolicitacaoServico solicitacao = buscarSolicitacaoParticipante(solicitacaoId, usuarioAutenticado);
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        if (usuario.getTipoUsuario() != TipoUsuario.CLIENTE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Somente o cliente pode renovar o codigo.");
        }
        validarPodeAcompanhar(solicitacao);
        OrdemServico ordem = obterOuCriarOrdem(solicitacao);
        if (ordem.getEtapa() != EtapaOrdemServico.AGUARDANDO_CHEGADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O codigo so pode ser renovado antes da chegada confirmada.");
        }
        gerarNovoCodigo(ordem);
        ordemRepository.save(ordem);
        return toDetalhe(solicitacao, ordem, usuarioAutenticado);
    }

    @Transactional
    public AcompanhamentoDetalheResponse confirmarChegada(
        Long solicitacaoId,
        UsuarioAutenticado usuarioAutenticado,
        ConfirmarChegadaRequest request
    ) {
        SolicitacaoServico solicitacao = buscarSolicitacaoParticipante(solicitacaoId, usuarioAutenticado);
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        if (usuario.getTipoUsuario() != TipoUsuario.PRESTADOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Somente o prestador pode confirmar a chegada.");
        }
        validarPodeAcompanhar(solicitacao);
        OrdemServico ordem = obterOuCriarOrdem(solicitacao);
        if (ordem.getEtapa() != EtapaOrdemServico.AGUARDANDO_CHEGADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A chegada ja foi confirmada.");
        }
        verificacaoFacialService.exigirVerificacaoFacial(ordem);
        if (codigoExpirado(ordem)) {
            throw new ResponseStatusException(HttpStatus.GONE, "Codigo expirado. Solicite um novo codigo ao cliente.");
        }
        if (ordem.getCodigoVerificacao() == null || !ordem.getCodigoVerificacao().equals(request.codigo())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Codigo de verificacao invalido.");
        }

        OffsetDateTime agora = OffsetDateTime.now();
        ordem.setEtapa(EtapaOrdemServico.EM_ANDAMENTO);
        ordem.setIniciadoEm(agora);
        ordem.setPrevistoTerminoEm(agora.plusHours(2));
        ordem.setCodigoVerificacao(null);
        ordem.setCodigoExpiraEm(null);
        if (ordem.getValorFinal() == null && solicitacao.getValorAceito() != null) {
            ordem.setValorFinal(solicitacao.getValorAceito());
        }
        ordemRepository.save(ordem);
        return toDetalhe(solicitacao, ordem, usuarioAutenticado);
    }

    @Transactional
    public AcompanhamentoDetalheResponse registrarAtualizacao(
        Long solicitacaoId,
        UsuarioAutenticado usuarioAutenticado,
        String descricao,
        MultipartFile foto
    ) {
        SolicitacaoServico solicitacao = buscarSolicitacaoParticipante(solicitacaoId, usuarioAutenticado);
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        if (usuario.getTipoUsuario() != TipoUsuario.PRESTADOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Somente o prestador pode enviar atualizacoes.");
        }
        validarPodeAcompanhar(solicitacao);
        OrdemServico ordem = obterOuCriarOrdem(solicitacao);
        if (ordem.getEtapa() != EtapaOrdemServico.EM_ANDAMENTO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Atualizacoes so podem ser enviadas durante a execucao.");
        }

        String texto = normalizarDescricao(descricao);
        AtualizacaoServico atualizacao = new AtualizacaoServico();
        atualizacao.setOrdemServico(ordem);
        atualizacao.setDescricao(texto);
        if (foto != null && !foto.isEmpty()) {
            atualizacao.setFotoArquivoRelativo(arquivoStorage.salvarImagem(foto, ArquivoStorage.PASTA_ACOMPANHAMENTO));
        }
        ordem.getAtualizacoes().add(atualizacao);
        atualizacaoRepository.save(atualizacao);
        return toDetalhe(solicitacao, ordem, usuarioAutenticado);
    }

    @Transactional
    public AcompanhamentoDetalheResponse concluirExecucao(Long solicitacaoId, UsuarioAutenticado usuarioAutenticado) {
        SolicitacaoServico solicitacao = buscarSolicitacaoParticipante(solicitacaoId, usuarioAutenticado);
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        if (usuario.getTipoUsuario() != TipoUsuario.PRESTADOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Somente o prestador pode concluir a execucao.");
        }
        validarPodeAcompanhar(solicitacao);
        OrdemServico ordem = obterOuCriarOrdem(solicitacao);
        if (ordem.getEtapa() != EtapaOrdemServico.EM_ANDAMENTO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O servico nao esta em execucao.");
        }
        if (ordem.getValorFinal() == null && solicitacao.getValorAceito() != null) {
            ordem.setValorFinal(solicitacao.getValorAceito());
        }
        ordem.setPercentualConcluido(100);
        ordem.setEtapa(EtapaOrdemServico.AGUARDANDO_PAGAMENTO);
        ordemRepository.save(ordem);
        return toDetalhe(solicitacao, ordem, usuarioAutenticado);
    }

    @Transactional
    public AcompanhamentoDetalheResponse solicitarReagendamento(
        Long solicitacaoId,
        UsuarioAutenticado usuarioAutenticado,
        SolicitarReagendamentoRequest request
    ) {
        SolicitacaoServico solicitacao = buscarSolicitacaoParticipante(solicitacaoId, usuarioAutenticado);
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        if (usuario.getTipoUsuario() != TipoUsuario.PRESTADOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Somente o prestador pode solicitar reagendamento.");
        }
        validarPodeAcompanhar(solicitacao);
        OrdemServico ordem = obterOuCriarOrdem(solicitacao);
        if (ordem.getEtapa() != EtapaOrdemServico.EM_ANDAMENTO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O servico nao esta em execucao.");
        }

        int percentualAtual = ordem.getPercentualConcluido() == null ? 0 : ordem.getPercentualConcluido();
        if (request.percentualConcluido() <= percentualAtual) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "O percentual deve ser maior que o progresso atual (" + percentualAtual + "%)."
            );
        }

        ordem.setPercentualConcluido(request.percentualConcluido());
        ordem.setObservacaoReagendamento(normalizarObservacaoReagendamento(request.observacao()));
        ordem.setEtapa(EtapaOrdemServico.AGUARDANDO_REAGENDAMENTO);
        ordemRepository.save(ordem);
        return toDetalhe(solicitacao, ordem, usuarioAutenticado);
    }

    @Transactional
    public AcompanhamentoDetalheResponse confirmarReagendamento(
        Long solicitacaoId,
        UsuarioAutenticado usuarioAutenticado,
        ConfirmarReagendamentoRequest request
    ) {
        SolicitacaoServico solicitacao = buscarSolicitacaoParticipante(solicitacaoId, usuarioAutenticado);
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        if (usuario.getTipoUsuario() != TipoUsuario.CLIENTE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Somente o cliente pode confirmar o reagendamento.");
        }
        validarPodeAcompanhar(solicitacao);
        OrdemServico ordem = obterOuCriarOrdem(solicitacao);
        if (ordem.getEtapa() != EtapaOrdemServico.AGUARDANDO_REAGENDAMENTO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Nao ha reagendamento pendente.");
        }
        if (request.data().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A data do servico nao pode ser no passado.");
        }

        solicitacao.setData(request.data());
        solicitacao.setHorario(request.horario());
        solicitacaoRepository.save(solicitacao);

        ordem.setEtapa(EtapaOrdemServico.VISITA_REAGENDADA);
        ordem.setIniciadoEm(null);
        ordem.setPrevistoTerminoEm(null);
        ordem.setObservacaoReagendamento(null);
        ordem.setCodigoVerificacao(null);
        ordem.setCodigoExpiraEm(null);
        verificacaoFacialService.limparVerificacao(ordem);
        ordemRepository.save(ordem);
        return toDetalhe(solicitacao, ordem, usuarioAutenticado);
    }

    @Transactional
    public AcompanhamentoDetalheResponse confirmarPagamento(
        Long solicitacaoId,
        UsuarioAutenticado usuarioAutenticado,
        ConfirmarPagamentoRequest request
    ) {
        SolicitacaoServico solicitacao = buscarSolicitacaoParticipante(solicitacaoId, usuarioAutenticado);
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        if (usuario.getTipoUsuario() != TipoUsuario.PRESTADOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Somente o prestador pode confirmar o pagamento.");
        }
        validarPodeAcompanhar(solicitacao);
        OrdemServico ordem = obterOuCriarOrdem(solicitacao);
        if (ordem.getEtapa() != EtapaOrdemServico.AGUARDANDO_PAGAMENTO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O servico nao esta aguardando pagamento.");
        }
        String metodoSelecionado = ordem.getMetodoPagamentoSelecionado();
        if (metodoSelecionado == null || metodoSelecionado.isBlank()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O cliente ainda nao escolheu a forma de pagamento.");
        }
        ordem.setMetodoPagamento(metodoSelecionado);
        ordem.setMetodoPagamentoSelecionado(null);
        ordem.setEtapa(EtapaOrdemServico.AGUARDANDO_AVALIACAO);
        ordemRepository.save(ordem);
        return toDetalhe(solicitacao, ordem, usuarioAutenticado);
    }

    @Transactional
    public AcompanhamentoDetalheResponse selecionarMetodoPagamento(
        Long solicitacaoId,
        UsuarioAutenticado usuarioAutenticado,
        ConfirmarPagamentoRequest request
    ) {
        SolicitacaoServico solicitacao = buscarSolicitacaoParticipante(solicitacaoId, usuarioAutenticado);
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        if (usuario.getTipoUsuario() != TipoUsuario.CLIENTE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Somente o cliente pode selecionar o metodo de pagamento.");
        }
        validarPodeAcompanhar(solicitacao);
        OrdemServico ordem = obterOuCriarOrdem(solicitacao);
        if (ordem.getEtapa() != EtapaOrdemServico.AGUARDANDO_PAGAMENTO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O servico nao esta aguardando pagamento.");
        }
        ordem.setMetodoPagamentoSelecionado(request.metodoPagamento());
        ordemRepository.save(ordem);
        return toDetalhe(solicitacao, ordem, usuarioAutenticado);
    }

    @Transactional(readOnly = true)
    public byte[] gerarQrCodePix(Long solicitacaoId, UsuarioAutenticado usuarioAutenticado) {
        PixPagamentoContexto contexto = prepararPagamentoPix(solicitacaoId, usuarioAutenticado);
        try {
            return pixQrCodeService.gerarImagemPng(contexto.prestador(), contexto.valor(), contexto.txid());
        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, exception.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public String gerarCopiaColaPix(Long solicitacaoId, UsuarioAutenticado usuarioAutenticado) {
        PixPagamentoContexto contexto = prepararPagamentoPix(solicitacaoId, usuarioAutenticado);
        try {
            return pixQrCodeService.gerarPayload(contexto.prestador(), contexto.valor(), contexto.txid());
        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, exception.getMessage());
        }
    }

    private PixPagamentoContexto prepararPagamentoPix(Long solicitacaoId, UsuarioAutenticado usuarioAutenticado) {
        SolicitacaoServico solicitacao = buscarSolicitacaoParticipante(solicitacaoId, usuarioAutenticado);
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        validarPodeAcompanhar(solicitacao);
        OrdemServico ordem = ordemRepository.findWithDetalhesBySolicitacaoId(solicitacao.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Ordem de servico nao iniciada."));
        if (ordem.getEtapa() != EtapaOrdemServico.AGUARDANDO_PAGAMENTO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O servico nao esta aguardando pagamento.");
        }
        validarAcessoPix(usuario, ordem);
        Usuario prestador = solicitacao.getPrestador();
        if (prestador == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Prestador nao vinculado a esta solicitacao.");
        }
        BigDecimal valor = ordem.getValorFinal() != null ? ordem.getValorFinal() : solicitacao.getValorAceito();
        if (valor == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Valor do servico nao definido.");
        }
        return new PixPagamentoContexto(usuario, prestador, valor, "SN" + solicitacao.getId());
    }

    private void validarAcessoPix(Usuario usuario, OrdemServico ordem) {
        if (usuario.getTipoUsuario() == TipoUsuario.PRESTADOR) {
            return;
        }
        if (usuario.getTipoUsuario() == TipoUsuario.CLIENTE) {
            if (!"PIX".equals(ordem.getMetodoPagamentoSelecionado())) {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Selecione PIX como forma de pagamento para gerar o QR Code."
                );
            }
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado ao QR Code PIX.");
    }

    private record PixPagamentoContexto(Usuario usuario, Usuario prestador, BigDecimal valor, String txid) {
    }

    @Transactional
    public AcompanhamentoDetalheResponse avaliar(
        Long solicitacaoId,
        UsuarioAutenticado usuarioAutenticado,
        AvaliarServicoRequest request
    ) {
        SolicitacaoServico solicitacao = buscarSolicitacaoParticipante(solicitacaoId, usuarioAutenticado);
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        if (usuario.getTipoUsuario() != TipoUsuario.CLIENTE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Somente o cliente pode avaliar o servico.");
        }
        OrdemServico ordem = ordemRepository.findWithDetalhesBySolicitacaoId(solicitacaoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Ordem de servico nao iniciada."));
        if (ordem.getEtapa() != EtapaOrdemServico.AGUARDANDO_AVALIACAO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O servico nao esta aguardando avaliacao.");
        }

        ordem.setNotaAvaliacao(request.nota());
        ordem.setComentarioAvaliacao(normalizarComentario(request.comentario()));
        finalizarAcompanhamentoSeAmbosAvaliaram(ordem, solicitacao);
        ordemRepository.save(ordem);
        return toDetalhe(solicitacao, ordem, usuarioAutenticado);
    }

    @Transactional
    public AcompanhamentoDetalheResponse avaliarCliente(
        Long solicitacaoId,
        UsuarioAutenticado usuarioAutenticado,
        AvaliarServicoRequest request
    ) {
        SolicitacaoServico solicitacao = buscarSolicitacaoParticipante(solicitacaoId, usuarioAutenticado);
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        if (usuario.getTipoUsuario() != TipoUsuario.PRESTADOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Somente o prestador pode avaliar o cliente.");
        }
        OrdemServico ordem = ordemRepository.findWithDetalhesBySolicitacaoId(solicitacaoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Ordem de servico nao iniciada."));
        if (ordem.getEtapa() != EtapaOrdemServico.AGUARDANDO_AVALIACAO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O servico nao esta aguardando avaliacao.");
        }
        if (ordem.getNotaAvaliacaoPrestador() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Voce ja avaliou este cliente.");
        }

        ordem.setNotaAvaliacaoPrestador(request.nota());
        ordem.setComentarioAvaliacaoPrestador(normalizarComentario(request.comentario()));
        finalizarAcompanhamentoSeAmbosAvaliaram(ordem, solicitacao);
        ordemRepository.save(ordem);
        return toDetalhe(solicitacao, ordem, usuarioAutenticado);
    }

    private void finalizarAcompanhamentoSeAmbosAvaliaram(OrdemServico ordem, SolicitacaoServico solicitacao) {
        if (ordem.getNotaAvaliacao() == null || ordem.getNotaAvaliacaoPrestador() == null) {
            return;
        }
        ordem.setEtapa(EtapaOrdemServico.CONCLUIDA);
        ordem.setConcluidoEm(OffsetDateTime.now());
        solicitacao.setStatus(StatusSolicitacao.CONCLUIDA);
        solicitacaoRepository.save(solicitacao);
    }

    @Transactional(readOnly = true)
    public ArquivoLeitura obterFotoAtualizacao(
        Long solicitacaoId,
        Long atualizacaoId,
        UsuarioAutenticado usuarioAutenticado
    ) {
        SolicitacaoServico solicitacao = buscarSolicitacaoParticipante(solicitacaoId, usuarioAutenticado);
        OrdemServico ordem = ordemRepository.findBySolicitacaoId(solicitacao.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ordem de servico nao encontrada."));
        AtualizacaoServico atualizacao = atualizacaoRepository.findById(atualizacaoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Atualizacao nao encontrada."));
        if (!atualizacao.getOrdemServico().getId().equals(ordem.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Atualizacao nao encontrada.");
        }
        String caminho = atualizacao.getFotoArquivoRelativo();
        return arquivoStorage.ler(caminho)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                caminho == null || caminho.isBlank()
                    ? "Esta atualizacao nao possui foto."
                    : "Arquivo de imagem nao encontrado."
            ));
    }

    private OrdemServico obterOuCriarOrdem(SolicitacaoServico solicitacao) {
        Long solicitacaoId = solicitacao.getId();
        return ordemRepository.findWithDetalhesBySolicitacaoId(solicitacaoId)
            .orElseGet(() -> criarOrdemComLock(solicitacao));
    }

    private OrdemServico criarOrdemComLock(SolicitacaoServico solicitacao) {
        solicitacaoRepository.findByIdForUpdate(solicitacao.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitacao nao encontrada."));

        return ordemRepository.findWithDetalhesBySolicitacaoId(solicitacao.getId())
            .orElseGet(() -> criarOrdemServico(solicitacao));
    }

    private OrdemServico criarOrdemServico(SolicitacaoServico solicitacao) {
        OrdemServico nova = new OrdemServico();
        nova.setSolicitacao(solicitacao);
        nova.setEtapa(EtapaOrdemServico.AGUARDANDO_CHEGADA);
        if (solicitacao.getValorAceito() != null) {
            nova.setValorFinal(solicitacao.getValorAceito());
        }
        gerarNovoCodigo(nova);
        try {
            return ordemRepository.saveAndFlush(nova);
        } catch (DataIntegrityViolationException ex) {
            return ordemRepository.findWithDetalhesBySolicitacaoId(solicitacao.getId())
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Nao foi possivel iniciar o acompanhamento desta solicitacao.",
                    ex
                ));
        }
    }

    private void gerarNovoCodigo(OrdemServico ordem) {
        int numero = 1000 + random.nextInt(9000);
        ordem.setCodigoVerificacao(String.valueOf(numero));
        ordem.setCodigoExpiraEm(OffsetDateTime.now().plusMinutes(CODIGO_VALIDADE_MINUTOS));
    }

    private void prepararCodigoChegadaSeNecessario(SolicitacaoServico solicitacao, OrdemServico ordem) {
        boolean alterado = false;
        if (ordem.getEtapa() == EtapaOrdemServico.VISITA_REAGENDADA) {
            if (LocalDate.now().isBefore(solicitacao.getData())) {
                return;
            }
            ordem.setEtapa(EtapaOrdemServico.AGUARDANDO_CHEGADA);
            verificacaoFacialService.limparVerificacao(ordem);
            alterado = true;
        }
        if (ordem.getEtapa() == EtapaOrdemServico.AGUARDANDO_CHEGADA
            && (ordem.getCodigoVerificacao() == null || codigoExpirado(ordem))) {
            gerarNovoCodigo(ordem);
            alterado = true;
        }
        if (alterado) {
            ordemRepository.save(ordem);
        }
    }

    private boolean codigoExpirado(OrdemServico ordem) {
        return ordem.getCodigoExpiraEm() != null && OffsetDateTime.now().isAfter(ordem.getCodigoExpiraEm());
    }

    private void validarPodeAcompanhar(SolicitacaoServico solicitacao) {
        if (solicitacao.getStatus() != StatusSolicitacao.AGENDADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esta solicitacao nao esta disponivel para acompanhamento.");
        }
        if (solicitacao.getPrestador() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esta solicitacao ainda nao possui prestador vinculado.");
        }
    }

    private void validarPodeConsultarDetalhe(SolicitacaoServico solicitacao) {
        if (solicitacao.getStatus() != StatusSolicitacao.AGENDADA
            && solicitacao.getStatus() != StatusSolicitacao.CONCLUIDA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Detalhes indisponiveis para esta solicitacao.");
        }
        if (solicitacao.getPrestador() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esta solicitacao ainda nao possui prestador vinculado.");
        }
    }

    private SolicitacaoServico buscarSolicitacaoParticipante(Long solicitacaoId, UsuarioAutenticado usuarioAutenticado) {
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        SolicitacaoServico solicitacao = solicitacaoRepository.findById(solicitacaoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitacao nao encontrada."));

        boolean participante = switch (usuario.getTipoUsuario()) {
            case CLIENTE -> solicitacao.getCliente().getId().equals(usuario.getId());
            case PRESTADOR -> solicitacao.getPrestador() != null
                && solicitacao.getPrestador().getId().equals(usuario.getId());
            default -> false;
        };

        if (!participante) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a este acompanhamento.");
        }
        return solicitacao;
    }

    private Usuario encontrarUsuario(UsuarioAutenticado usuarioAutenticado) {
        if (usuarioAutenticado == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Nao autenticado.");
        }
        return usuarioRepository.findById(usuarioAutenticado.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado."));
    }

    private String normalizarDescricao(String descricao) {
        if (descricao == null || descricao.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe a descricao da atualizacao.");
        }
        String texto = descricao.trim();
        if (texto.length() > 500) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A descricao deve ter no maximo 500 caracteres.");
        }
        return texto;
    }

    private String normalizarComentario(String comentario) {
        if (comentario == null) {
            return null;
        }
        String texto = comentario.trim();
        return texto.isEmpty() ? null : texto;
    }

    private String normalizarObservacaoReagendamento(String observacao) {
        if (observacao == null) {
            return null;
        }
        String texto = observacao.trim();
        if (texto.isEmpty()) {
            return null;
        }
        if (texto.length() > 300) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A observacao deve ter no maximo 300 caracteres.");
        }
        return texto;
    }

    private AcompanhamentoDisponivelResponse toDisponivel(SolicitacaoServico solicitacao, TipoUsuario tipoUsuario) {
        String etapa = ordemRepository.findEtapaBySolicitacaoId(solicitacao.getId())
            .map(EtapaOrdemServico::name)
            .orElse(null);

        String contraparte = tipoUsuario == TipoUsuario.CLIENTE
            ? (solicitacao.getPrestador() == null ? null : solicitacao.getPrestador().getNome())
            : solicitacao.getCliente().getNome();

        return new AcompanhamentoDisponivelResponse(
            solicitacao.getId(),
            solicitacao.getTipoServico(),
            contraparte,
            solicitacao.getData(),
            solicitacao.getHorario(),
            solicitacao.getValorAceito(),
            etapa
        );
    }

    private AcompanhamentoDetalheResponse toDetalhe(
        SolicitacaoServico solicitacao,
        OrdemServico ordem,
        UsuarioAutenticado usuarioAutenticado
    ) {
        Usuario usuario = encontrarUsuario(usuarioAutenticado);
        boolean ehCliente = usuario.getTipoUsuario() == TipoUsuario.CLIENTE;

        String codigo = null;
        if (ehCliente && ordem.getEtapa() == EtapaOrdemServico.AGUARDANDO_CHEGADA && !codigoExpirado(ordem)) {
            codigo = ordem.getCodigoVerificacao();
        }

        List<AtualizacaoServicoResponse> atualizacoes = ordem.getAtualizacoes().stream()
            .sorted(Comparator.comparing(AtualizacaoServico::getCriadoEm).reversed())
            .map(atualizacao -> new AtualizacaoServicoResponse(
                atualizacao.getId(),
                atualizacao.getDescricao(),
                atualizacao.getFotoArquivoRelativo() == null
                    ? null
                    : "/api/acompanhamento/" + solicitacao.getId() + "/atualizacoes/" + atualizacao.getId() + "/foto",
                atualizacao.getCriadoEm()
            ))
            .toList();

        var prestador = solicitacao.getPrestador();
        return new AcompanhamentoDetalheResponse(
            solicitacao.getId(),
            solicitacao.getTipoServico(),
            solicitacao.getDescricao(),
            solicitacao.getEndereco(),
            solicitacao.getData(),
            solicitacao.getHorario(),
            solicitacao.getCliente().getId(),
            solicitacao.getCliente().getNome(),
            prestador == null ? null : prestador.getId(),
            prestador == null ? null : prestador.getNome(),
            solicitacao.getValorAceito(),
            solicitacao.getStatus().name(),
            ordem.getId(),
            ordem.getEtapa().name(),
            codigo,
            ordem.getCodigoExpiraEm(),
            ordem.getIniciadoEm(),
            ordem.getPrevistoTerminoEm(),
            ordem.getValorFinal(),
            ordem.getMetodoPagamento(),
            ordem.getMetodoPagamentoSelecionado(),
            ordem.getNotaAvaliacao(),
            ordem.getComentarioAvaliacao(),
            ordem.getNotaAvaliacaoPrestador(),
            ordem.getComentarioAvaliacaoPrestador(),
            ordem.getPercentualConcluido(),
            ordem.getObservacaoReagendamento(),
            ordem.getIdentidadeVerificadaEm(),
            ordem.getIdentidadeSimilaridade(),
            faceVerificationProperties.enabled(),
            atualizacoes
        );
    }
}
