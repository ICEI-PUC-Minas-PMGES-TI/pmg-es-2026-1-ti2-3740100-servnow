package com.servnow.backend.indicadores.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.servnow.backend.acompanhamento.domain.OrdemServico;
import com.servnow.backend.acompanhamento.repository.OrdemServicoRepository;
import com.servnow.backend.indicadores.dto.IndicadorPrestadorResponse;
import com.servnow.backend.indicadores.dto.IndicadorSeriePontoResponse;
import com.servnow.backend.indicadores.dto.ParticipacaoCategoriaResponse;
import com.servnow.backend.perfil.service.AvaliacaoService;
import com.servnow.backend.security.UsuarioAutenticado;
import com.servnow.backend.solicitacao.domain.SolicitacaoServico;
import com.servnow.backend.solicitacao.domain.StatusSolicitacao;
import com.servnow.backend.solicitacao.repository.SolicitacaoServicoRepository;
import com.servnow.backend.usuario.domain.TipoUsuario;
import com.servnow.backend.usuario.domain.Usuario;
import com.servnow.backend.usuario.repository.UsuarioRepository;

@Service
public class IndicadorPrestadorService {

    private static final String[] NOMES_MES_CURTO = {
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    };
    private static final String[] DIAS_SEMANA_CURTO = {"Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"};

    private final OrdemServicoRepository ordemServicoRepository;
    private final SolicitacaoServicoRepository solicitacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AvaliacaoService avaliacaoService;

    public IndicadorPrestadorService(
        OrdemServicoRepository ordemServicoRepository,
        SolicitacaoServicoRepository solicitacaoRepository,
        UsuarioRepository usuarioRepository,
        AvaliacaoService avaliacaoService
    ) {
        this.ordemServicoRepository = ordemServicoRepository;
        this.solicitacaoRepository = solicitacaoRepository;
        this.usuarioRepository = usuarioRepository;
        this.avaliacaoService = avaliacaoService;
    }

    @Transactional(readOnly = true)
    public IndicadorPrestadorResponse obterIndicadores(UsuarioAutenticado usuarioAutenticado, String periodo) {
        Usuario prestador = encontrarPrestador(usuarioAutenticado);
        String periodoNormalizado = normalizarPeriodo(periodo);

        List<OrdemServico> pagasPlataforma = ordemServicoRepository.findAllPagas();
        List<OrdemServico> pagasPrestador = ordemServicoRepository.findPagasDoPrestador(prestador.getId());
        List<OrdemServico> concluidasPrestador =
            ordemServicoRepository.findBySolicitacaoStatus(StatusSolicitacao.CONCLUIDA).stream()
                .filter(ordem -> ordem.getSolicitacao().getPrestador() != null)
                .filter(ordem -> prestador.getId().equals(ordem.getSolicitacao().getPrestador().getId()))
                .toList();
        List<SolicitacaoServico> servicosAtribuidos = solicitacaoRepository
            .findByPrestadorIdOrderByAceitoEmDesc(prestador.getId()).stream()
            .filter(solicitacao -> solicitacao.getStatus() == StatusSolicitacao.AGENDADA
                || solicitacao.getStatus() == StatusSolicitacao.CONCLUIDA)
            .toList();

        var resumoAvaliacoes = avaliacaoService.calcularResumo(prestador);
        BigDecimal avaliacaoMedia = resumoAvaliacoes.media() == null
            ? null
            : BigDecimal.valueOf(resumoAvaliacoes.media()).setScale(2, RoundingMode.HALF_UP);
        long totalAvaliacoes = resumoAvaliacoes.total();

        LocalDate hoje = LocalDate.now(ZoneId.systemDefault());
        List<BucketPeriodo> buckets = criarBuckets(periodoNormalizado, hoje);

        List<IndicadorSeriePontoResponse> ganhosSerie = new ArrayList<>();
        BigDecimal ganhosTotal = BigDecimal.ZERO;

        List<IndicadorSeriePontoResponse> efetividadeSerie = new ArrayList<>();
        long concluidosPeriodo = 0;
        long recebidosPeriodo = 0;

        List<IndicadorSeriePontoResponse> participacaoSerie = new ArrayList<>();
        BigDecimal ganhoPrestadorPeriodo = BigDecimal.ZERO;
        BigDecimal ganhoPlataformaPeriodo = BigDecimal.ZERO;

        for (BucketPeriodo bucket : buckets) {
            BigDecimal ganhoBucket = somarGanhos(pagasPrestador, bucket);
            ganhosSerie.add(new IndicadorSeriePontoResponse(bucket.label(), ganhoBucket, null));
            if (bucket.atual()) {
                ganhosTotal = ganhoBucket;
            }

            long recebidosBucket = contarRecebidos(servicosAtribuidos, bucket);
            long concluidosBucket = contarConcluidos(concluidasPrestador, bucket);
            BigDecimal efetividade = percentual(concluidosBucket, recebidosBucket);
            efetividadeSerie.add(new IndicadorSeriePontoResponse(
                bucket.label(),
                BigDecimal.valueOf(concluidosBucket),
                efetividade
            ));
            if (bucket.atual()) {
                recebidosPeriodo = recebidosBucket;
                concluidosPeriodo = concluidosBucket;
            }

            BigDecimal ganhoPrestador = somarGanhos(pagasPrestador, bucket);
            BigDecimal ganhoPlataforma = somarGanhos(pagasPlataforma, bucket);
            BigDecimal participacao = percentualDecimal(ganhoPrestador, ganhoPlataforma);
            participacaoSerie.add(new IndicadorSeriePontoResponse(bucket.label(), ganhoPrestador, participacao));
            if (bucket.atual()) {
                ganhoPrestadorPeriodo = ganhoPrestador;
                ganhoPlataformaPeriodo = ganhoPlataforma;
            }
        }

        List<ParticipacaoCategoriaResponse> participacaoCategorias =
            calcularParticipacaoPorCategoria(pagasPrestador, pagasPlataforma, pagasPrestador, buckets);

        BigDecimal participacaoAtual = percentualDecimal(ganhoPrestadorPeriodo, ganhoPlataformaPeriodo);
        BigDecimal crescimentoParticipacao = calcularCrescimentoParticipacao(participacaoSerie, periodoNormalizado);

        return new IndicadorPrestadorResponse(
            periodoNormalizado,
            ganhosTotal,
            ganhosSerie,
            avaliacaoMedia,
            totalAvaliacoes,
            percentual(concluidosPeriodo, recebidosPeriodo),
            concluidosPeriodo,
            recebidosPeriodo,
            efetividadeSerie,
            participacaoAtual,
            crescimentoParticipacao,
            ganhoPrestadorPeriodo,
            ganhoPlataformaPeriodo,
            participacaoSerie,
            participacaoCategorias
        );
    }

    private List<ParticipacaoCategoriaResponse> calcularParticipacaoPorCategoria(
        List<OrdemServico> pagasPrestadorPeriodo,
        List<OrdemServico> pagasPlataformaPeriodo,
        List<OrdemServico> pagasPrestadorHistorico,
        List<BucketPeriodo> buckets
    ) {
        BucketPeriodo bucketAtual = buckets.stream().filter(BucketPeriodo::atual).findFirst().orElse(null);
        if (bucketAtual == null) {
            return List.of();
        }

        Map<String, BigDecimal> ganhoPrestadorPorTipo = new LinkedHashMap<>();
        Map<String, BigDecimal> ganhoPlataformaPorTipo = new LinkedHashMap<>();

        for (OrdemServico ordem : pagasPrestadorPeriodo) {
            if (!bucketAtual.contem(dataReferenciaFinanceira(ordem))) {
                continue;
            }
            String tipo = ordem.getSolicitacao().getTipoServico();
            ganhoPrestadorPorTipo.merge(tipo, valorOrdem(ordem), BigDecimal::add);
        }

        for (OrdemServico ordem : pagasPlataformaPeriodo) {
            if (!bucketAtual.contem(dataReferenciaFinanceira(ordem))) {
                continue;
            }
            String tipo = ordem.getSolicitacao().getTipoServico();
            ganhoPlataformaPorTipo.merge(tipo, valorOrdem(ordem), BigDecimal::add);
        }

        List<BucketPeriodo> trimestreAtual = bucketsTrimestreAtual(buckets);
        List<BucketPeriodo> trimestreAnterior = bucketsTrimestreAnterior(buckets);

        List<ParticipacaoCategoriaResponse> resultado = new ArrayList<>();
        for (String tipo : ganhoPrestadorPorTipo.keySet()) {
            BigDecimal ganhoPrestador = ganhoPrestadorPorTipo.getOrDefault(tipo, BigDecimal.ZERO);
            BigDecimal ganhoPlataforma = ganhoPlataformaPorTipo.getOrDefault(tipo, BigDecimal.ZERO);
            BigDecimal ganhoTrimestreAtual = somarGanhosPorTipo(pagasPrestadorHistorico, tipo, trimestreAtual);
            BigDecimal ganhoTrimestreAnterior = somarGanhosPorTipo(pagasPrestadorHistorico, tipo, trimestreAnterior);
            resultado.add(new ParticipacaoCategoriaResponse(
                tipo,
                ganhoPrestador,
                ganhoPlataforma,
                percentualDecimal(ganhoPrestador, ganhoPlataforma),
                crescimentoPercentual(ganhoTrimestreAtual, ganhoTrimestreAnterior)
            ));
        }
        resultado.sort((a, b) -> b.ganhoPrestador().compareTo(a.ganhoPrestador()));
        return resultado;
    }

    private BigDecimal calcularCrescimentoParticipacao(
        List<IndicadorSeriePontoResponse> participacaoSerie,
        String periodo
    ) {
        if (!("mes".equals(periodo) || "ano".equals(periodo)) || participacaoSerie.size() < 2) {
            return BigDecimal.ZERO;
        }
        BigDecimal participacaoAtual = participacaoSerie.get(participacaoSerie.size() - 1).percentual();
        BigDecimal participacaoAnterior = participacaoSerie.get(participacaoSerie.size() - 2).percentual();
        return crescimentoPercentual(participacaoAtual, participacaoAnterior);
    }

    private BigDecimal crescimentoPercentual(BigDecimal atual, BigDecimal anterior) {
        if (anterior == null || anterior.compareTo(BigDecimal.ZERO) <= 0) {
            return atual != null && atual.compareTo(BigDecimal.ZERO) > 0 ? BigDecimal.valueOf(100) : BigDecimal.ZERO;
        }
        if (atual == null) {
            atual = BigDecimal.ZERO;
        }
        return atual.subtract(anterior)
            .multiply(BigDecimal.valueOf(100))
            .divide(anterior, 1, RoundingMode.HALF_UP);
    }

    private List<BucketPeriodo> bucketsTrimestreAtual(List<BucketPeriodo> buckets) {
        if (buckets.size() < 3) {
            return buckets;
        }
        return buckets.subList(buckets.size() - 3, buckets.size());
    }

    private List<BucketPeriodo> bucketsTrimestreAnterior(List<BucketPeriodo> buckets) {
        if (buckets.size() < 6) {
            return List.of();
        }
        if (buckets.size() >= 12) {
            return buckets.subList(buckets.size() - 6, buckets.size() - 3);
        }
        return buckets.subList(0, 3);
    }

    private BigDecimal somarGanhosPorTipo(
        List<OrdemServico> ordens,
        String tipoServico,
        List<BucketPeriodo> buckets
    ) {
        BigDecimal total = BigDecimal.ZERO;
        for (OrdemServico ordem : ordens) {
            if (!tipoServico.equals(ordem.getSolicitacao().getTipoServico())) {
                continue;
            }
            LocalDate data = dataReferenciaFinanceira(ordem);
            boolean pertence = buckets.stream().anyMatch(bucket -> bucket.contem(data));
            if (pertence) {
                total = total.add(valorOrdem(ordem));
            }
        }
        return total;
    }

    private long contarRecebidos(List<SolicitacaoServico> solicitacoes, BucketPeriodo bucket) {
        return solicitacoes.stream()
            .filter(solicitacao -> bucket.contem(dataReferenciaAtribuicao(solicitacao)))
            .count();
    }

    private BigDecimal somarGanhos(List<OrdemServico> ordens, BucketPeriodo bucket) {
        BigDecimal total = BigDecimal.ZERO;
        for (OrdemServico ordem : ordens) {
            if (bucket.contem(dataReferenciaFinanceira(ordem))) {
                total = total.add(valorOrdem(ordem));
            }
        }
        return total;
    }

    private long contarConcluidos(List<OrdemServico> concluidas, BucketPeriodo bucket) {
        return concluidas.stream()
            .filter(ordem -> bucket.contem(dataReferenciaConclusao(ordem)))
            .count();
    }

    private LocalDate dataReferenciaConclusao(OrdemServico ordem) {
        if (ordem.getConcluidoEm() != null) {
            return ordem.getConcluidoEm().atZoneSameInstant(ZoneId.systemDefault()).toLocalDate();
        }
        return dataReferenciaAtribuicao(ordem.getSolicitacao());
    }

    private BigDecimal valorOrdem(OrdemServico ordem) {
        if (ordem.getValorFinal() != null) {
            return ordem.getValorFinal();
        }
        if (ordem.getSolicitacao().getValorAceito() != null) {
            return ordem.getSolicitacao().getValorAceito();
        }
        return BigDecimal.ZERO;
    }

    private LocalDate dataReferenciaFinanceira(OrdemServico ordem) {
        if (ordem.getConcluidoEm() != null) {
            return ordem.getConcluidoEm().atZoneSameInstant(ZoneId.systemDefault()).toLocalDate();
        }
        SolicitacaoServico solicitacao = ordem.getSolicitacao();
        if (solicitacao.getData() != null) {
            return solicitacao.getData();
        }
        if (solicitacao.getAceitoEm() != null) {
            return solicitacao.getAceitoEm().atZoneSameInstant(ZoneId.systemDefault()).toLocalDate();
        }
        return null;
    }

    private LocalDate dataReferenciaAtribuicao(SolicitacaoServico solicitacao) {
        if (solicitacao.getAceitoEm() != null) {
            return solicitacao.getAceitoEm().atZoneSameInstant(ZoneId.systemDefault()).toLocalDate();
        }
        return solicitacao.getData();
    }

    private List<BucketPeriodo> criarBuckets(String periodo, LocalDate hoje) {
        if ("semana".equals(periodo)) {
            LocalDate inicioSemana = hoje.minusDays(hoje.getDayOfWeek().getValue() % 7);
            List<BucketPeriodo> buckets = new ArrayList<>();
            for (int indice = 0; indice < DIAS_SEMANA_CURTO.length; indice += 1) {
                LocalDate dia = inicioSemana.plusDays(indice);
                buckets.add(new BucketPeriodo(
                    DIAS_SEMANA_CURTO[indice],
                    dia,
                    dia,
                    dia.equals(hoje)
                ));
            }
            return buckets;
        }

        if ("ano".equals(periodo)) {
            List<BucketPeriodo> buckets = new ArrayList<>();
            int ano = hoje.getYear();
            for (int mes = 1; mes <= 12; mes += 1) {
                LocalDate ref = LocalDate.of(ano, mes, 1);
                LocalDate fim = ref.withDayOfMonth(ref.lengthOfMonth());
                buckets.add(new BucketPeriodo(
                    NOMES_MES_CURTO[mes - 1],
                    ref,
                    fim,
                    mes == hoje.getMonthValue()
                ));
            }
            return buckets;
        }

        List<BucketPeriodo> buckets = new ArrayList<>();
        for (int i = 5; i >= 0; i -= 1) {
            LocalDate ref = hoje.minusMonths(i).withDayOfMonth(1);
            LocalDate fim = ref.withDayOfMonth(ref.lengthOfMonth());
            buckets.add(new BucketPeriodo(
                NOMES_MES_CURTO[ref.getMonthValue() - 1],
                ref,
                fim,
                ref.getYear() == hoje.getYear() && ref.getMonth() == hoje.getMonth()
            ));
        }
        return buckets;
    }

    private BigDecimal percentual(long parte, long total) {
        if (total <= 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(parte)
            .multiply(BigDecimal.valueOf(100))
            .divide(BigDecimal.valueOf(total), 1, RoundingMode.HALF_UP);
    }

    private BigDecimal percentualDecimal(BigDecimal parte, BigDecimal total) {
        if (total == null || total.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        if (parte == null) {
            parte = BigDecimal.ZERO;
        }
        return parte.multiply(BigDecimal.valueOf(100)).divide(total, 1, RoundingMode.HALF_UP);
    }

    private String normalizarPeriodo(String periodo) {
        if (periodo == null) {
            return "mes";
        }
        String valor = periodo.trim().toLowerCase(Locale.ROOT);
        if ("semana".equals(valor)) {
            return "semana";
        }
        if ("mes".equals(valor)) {
            return "mes";
        }
        if ("ano".equals(valor)) {
            return "ano";
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Periodo invalido. Use mes, semana ou ano.");
    }

    private Usuario encontrarPrestador(UsuarioAutenticado usuarioAutenticado) {
        Usuario usuario = usuarioRepository.findById(usuarioAutenticado.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario nao encontrado."));
        if (usuario.getTipoUsuario() != TipoUsuario.PRESTADOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Indicadores disponiveis apenas para prestadores.");
        }
        return usuario;
    }

    private record BucketPeriodo(String label, LocalDate inicio, LocalDate fim, boolean atual) {
        boolean contem(LocalDate data) {
            if (data == null) {
                return false;
            }
            return !data.isBefore(inicio) && !data.isAfter(fim);
        }
    }
}
