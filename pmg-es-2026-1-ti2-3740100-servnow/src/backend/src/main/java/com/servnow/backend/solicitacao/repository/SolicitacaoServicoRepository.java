package com.servnow.backend.solicitacao.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.servnow.backend.solicitacao.domain.SolicitacaoServico;
import com.servnow.backend.solicitacao.domain.StatusSolicitacao;

public interface SolicitacaoServicoRepository extends JpaRepository<SolicitacaoServico, Long> {
    List<SolicitacaoServico> findByClienteIdOrderByCriadoEmDesc(Long clienteId);
    List<SolicitacaoServico> findByStatusOrderByCriadoEmDesc(StatusSolicitacao status);
    Optional<SolicitacaoServico> findByIdAndClienteId(Long id, Long clienteId);
    long deleteByIdAndClienteId(Long id, Long clienteId);
    List<SolicitacaoServico> findByClienteIdAndStatusOrderByAceitoEmDesc(Long clienteId, StatusSolicitacao status);
    List<SolicitacaoServico> findByPrestadorIdAndStatusOrderByAceitoEmDesc(Long prestadorId, StatusSolicitacao status);
    Optional<SolicitacaoServico> findFirstByLatitudeIsNullAndCepIsNotNullOrderByIdAsc();
}
