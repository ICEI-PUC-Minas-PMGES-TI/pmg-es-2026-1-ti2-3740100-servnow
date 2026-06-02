package com.servnow.backend.solicitacao.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.servnow.backend.solicitacao.domain.SolicitacaoServico;
import com.servnow.backend.solicitacao.domain.StatusSolicitacao;

import jakarta.persistence.LockModeType;

public interface SolicitacaoServicoRepository extends JpaRepository<SolicitacaoServico, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM SolicitacaoServico s WHERE s.id = :id")
    Optional<SolicitacaoServico> findByIdForUpdate(@Param("id") Long id);
    List<SolicitacaoServico> findByClienteIdOrderByCriadoEmDesc(Long clienteId);
    List<SolicitacaoServico> findByStatusOrderByCriadoEmDesc(StatusSolicitacao status);
    Optional<SolicitacaoServico> findByIdAndClienteId(Long id, Long clienteId);
    long deleteByIdAndClienteId(Long id, Long clienteId);
    List<SolicitacaoServico> findByClienteIdAndStatusOrderByAceitoEmDesc(Long clienteId, StatusSolicitacao status);
    List<SolicitacaoServico> findByPrestadorIdAndStatusOrderByAceitoEmDesc(Long prestadorId, StatusSolicitacao status);
    List<SolicitacaoServico> findByPrestadorIdOrderByAceitoEmDesc(Long prestadorId);
    Optional<SolicitacaoServico> findFirstByLatitudeIsNullAndCepIsNotNullOrderByIdAsc();
}
