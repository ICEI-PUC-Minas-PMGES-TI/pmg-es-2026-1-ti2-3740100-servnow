package com.servnow.backend.acompanhamento.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.servnow.backend.acompanhamento.domain.OrdemServico;

public interface OrdemServicoRepository extends JpaRepository<OrdemServico, Long> {

    Optional<OrdemServico> findBySolicitacaoId(Long solicitacaoId);

    @EntityGraph(attributePaths = {"solicitacao", "solicitacao.cliente", "solicitacao.prestador", "atualizacoes"})
    Optional<OrdemServico> findWithDetalhesBySolicitacaoId(Long solicitacaoId);

    @Query("""
        SELECT o FROM OrdemServico o
        JOIN FETCH o.solicitacao s
        JOIN FETCH s.cliente
        WHERE s.prestador.id = :prestadorId
          AND o.notaAvaliacao IS NOT NULL
        ORDER BY o.concluidoEm DESC NULLS LAST, o.criadoEm DESC
        """)
    List<OrdemServico> findAvaliacoesRecebidasPrestador(@Param("prestadorId") Long prestadorId);

    @Query("""
        SELECT AVG(o.notaAvaliacao), COUNT(o)
        FROM OrdemServico o
        JOIN o.solicitacao s
        WHERE s.prestador.id = :prestadorId
          AND o.notaAvaliacao IS NOT NULL
        """)
    Object[] estatisticasAvaliacoesPrestador(@Param("prestadorId") Long prestadorId);

    @Query("""
        SELECT o FROM OrdemServico o
        JOIN FETCH o.solicitacao s
        JOIN FETCH s.prestador
        WHERE s.cliente.id = :clienteId
          AND o.notaAvaliacaoPrestador IS NOT NULL
        ORDER BY o.concluidoEm DESC NULLS LAST, o.criadoEm DESC
        """)
    List<OrdemServico> findAvaliacoesRecebidasCliente(@Param("clienteId") Long clienteId);

    @Query("""
        SELECT AVG(o.notaAvaliacaoPrestador), COUNT(o)
        FROM OrdemServico o
        JOIN o.solicitacao s
        WHERE s.cliente.id = :clienteId
          AND o.notaAvaliacaoPrestador IS NOT NULL
        """)
    Object[] estatisticasAvaliacoesCliente(@Param("clienteId") Long clienteId);
}
