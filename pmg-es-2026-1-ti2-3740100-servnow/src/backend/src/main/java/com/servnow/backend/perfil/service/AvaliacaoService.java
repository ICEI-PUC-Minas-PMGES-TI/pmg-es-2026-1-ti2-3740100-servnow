package com.servnow.backend.perfil.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.function.Function;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.servnow.backend.acompanhamento.domain.OrdemServico;
import com.servnow.backend.acompanhamento.repository.OrdemServicoRepository;
import com.servnow.backend.perfil.dto.AvaliacaoRecebidaResponse;
import com.servnow.backend.perfil.dto.AvaliacoesRecebidasResponse;
import com.servnow.backend.usuario.domain.TipoUsuario;
import com.servnow.backend.usuario.domain.Usuario;

@Service
public class AvaliacaoService {

    private final OrdemServicoRepository ordemRepository;

    public AvaliacaoService(OrdemServicoRepository ordemRepository) {
        this.ordemRepository = ordemRepository;
    }

    @Transactional(readOnly = true)
    public AvaliacoesRecebidasResponse buscarRecebidas(Usuario usuario) {
        return switch (usuario.getTipoUsuario()) {
            case PRESTADOR -> montarResposta(
                ordemRepository.findAvaliacoesRecebidasPrestador(usuario.getId()),
                this::toAvaliacaoRecebidaPrestador,
                OrdemServico::getNotaAvaliacao,
                OrdemServico::getComentarioAvaliacao
            );
            case CLIENTE -> montarResposta(
                ordemRepository.findAvaliacoesRecebidasCliente(usuario.getId()),
                this::toAvaliacaoRecebidaCliente,
                OrdemServico::getNotaAvaliacaoPrestador,
                OrdemServico::getComentarioAvaliacaoPrestador
            );
            default -> vazio();
        };
    }

    @Transactional(readOnly = true)
    public AvaliacoesRecebidasResponse buscarRecebidasPublico(Long usuarioId, TipoUsuario tipoUsuario) {
        if (tipoUsuario != TipoUsuario.PRESTADOR && tipoUsuario != TipoUsuario.CLIENTE) {
            return vazio();
        }
        Usuario usuario = new Usuario();
        usuario.setId(usuarioId);
        usuario.setTipoUsuario(tipoUsuario);
        return buscarRecebidas(usuario);
    }

    @Transactional(readOnly = true)
    public ResumoAvaliacoes calcularResumo(Usuario usuario) {
        return switch (usuario.getTipoUsuario()) {
            case PRESTADOR -> calcularResumoPrestador(usuario.getId());
            case CLIENTE -> calcularResumoCliente(usuario.getId());
            default -> ResumoAvaliacoes.vazio();
        };
    }

    private ResumoAvaliacoes calcularResumoPrestador(Long prestadorId) {
        Object[] estatisticas = ordemRepository.estatisticasAvaliacoesPrestador(prestadorId);
        return extrairResumo(estatisticas);
    }

    private ResumoAvaliacoes calcularResumoCliente(Long clienteId) {
        Object[] estatisticas = ordemRepository.estatisticasAvaliacoesCliente(clienteId);
        return extrairResumo(estatisticas);
    }

    private ResumoAvaliacoes extrairResumo(Object[] estatisticas) {
        long total = estatisticas[1] == null ? 0L : ((Number) estatisticas[1]).longValue();
        if (total == 0L) {
            return ResumoAvaliacoes.vazio();
        }
        Double media = estatisticas[0] == null
            ? null
            : BigDecimal.valueOf(((Number) estatisticas[0]).doubleValue())
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
        return new ResumoAvaliacoes(media, total, null);
    }

    private AvaliacoesRecebidasResponse montarResposta(
        List<OrdemServico> ordens,
        Function<OrdemServico, AvaliacaoRecebidaResponse> mapper,
        Function<OrdemServico, Short> notaFn,
        Function<OrdemServico, String> comentarioFn
    ) {
        List<AvaliacaoRecebidaResponse> avaliacoes = ordens.stream().map(mapper).toList();
        Double media = calcularMediaNotas(ordens, notaFn);
        String destaque = ordens.stream()
            .map(comentarioFn)
            .filter(comentario -> comentario != null && !comentario.isBlank())
            .findFirst()
            .orElse(null);
        return new AvaliacoesRecebidasResponse(media, (long) avaliacoes.size(), destaque, avaliacoes);
    }

    private AvaliacaoRecebidaResponse toAvaliacaoRecebidaPrestador(OrdemServico ordem) {
        var solicitacao = ordem.getSolicitacao();
        return new AvaliacaoRecebidaResponse(
            ordem.getId(),
            solicitacao.getCliente().getNome(),
            solicitacao.getTipoServico(),
            ordem.getNotaAvaliacao(),
            ordem.getComentarioAvaliacao(),
            dataAvaliacao(ordem)
        );
    }

    private AvaliacaoRecebidaResponse toAvaliacaoRecebidaCliente(OrdemServico ordem) {
        var solicitacao = ordem.getSolicitacao();
        return new AvaliacaoRecebidaResponse(
            ordem.getId(),
            solicitacao.getPrestador().getNome(),
            solicitacao.getTipoServico(),
            ordem.getNotaAvaliacaoPrestador(),
            ordem.getComentarioAvaliacaoPrestador(),
            dataAvaliacao(ordem)
        );
    }

    private java.time.OffsetDateTime dataAvaliacao(OrdemServico ordem) {
        return ordem.getConcluidoEm() != null ? ordem.getConcluidoEm() : ordem.getCriadoEm();
    }

    private AvaliacoesRecebidasResponse vazio() {
        return new AvaliacoesRecebidasResponse(null, 0L, null, List.of());
    }

    private Double calcularMediaNotas(List<OrdemServico> ordens, Function<OrdemServico, Short> notaFn) {
        if (ordens.isEmpty()) {
            return null;
        }
        double soma = ordens.stream()
            .mapToInt(ordem -> notaFn.apply(ordem).intValue())
            .sum();
        return BigDecimal.valueOf(soma / (double) ordens.size())
            .setScale(2, RoundingMode.HALF_UP)
            .doubleValue();
    }

    public record ResumoAvaliacoes(Double media, long total, String comentarioDestaque) {
        public static ResumoAvaliacoes vazio() {
            return new ResumoAvaliacoes(null, 0L, null);
        }
    }
}
