package com.servnow.backend.proposta.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.servnow.backend.proposta.domain.PropostaServico;
import com.servnow.backend.proposta.domain.StatusProposta;

public interface PropostaServicoRepository extends JpaRepository<PropostaServico, Long> {
    Optional<PropostaServico> findBySolicitacaoIdAndPrestadorId(Long solicitacaoId, Long prestadorId);
    List<PropostaServico> findBySolicitacaoClienteIdOrderByCriadoEmDesc(Long clienteId);
    List<PropostaServico> findByPrestadorIdOrderByCriadoEmDesc(Long prestadorId);
    Optional<PropostaServico> findByIdAndSolicitacaoClienteId(Long id, Long clienteId);
    List<PropostaServico> findBySolicitacaoIdAndStatus(Long solicitacaoId, StatusProposta status);
}
