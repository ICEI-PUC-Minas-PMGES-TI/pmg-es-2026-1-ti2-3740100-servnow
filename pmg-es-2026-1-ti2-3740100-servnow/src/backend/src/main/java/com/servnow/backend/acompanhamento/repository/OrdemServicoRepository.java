package com.servnow.backend.acompanhamento.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import com.servnow.backend.acompanhamento.domain.OrdemServico;

public interface OrdemServicoRepository extends JpaRepository<OrdemServico, Long> {

    Optional<OrdemServico> findBySolicitacaoId(Long solicitacaoId);

    @EntityGraph(attributePaths = {"solicitacao", "solicitacao.cliente", "solicitacao.prestador", "atualizacoes"})
    Optional<OrdemServico> findWithDetalhesBySolicitacaoId(Long solicitacaoId);
}
