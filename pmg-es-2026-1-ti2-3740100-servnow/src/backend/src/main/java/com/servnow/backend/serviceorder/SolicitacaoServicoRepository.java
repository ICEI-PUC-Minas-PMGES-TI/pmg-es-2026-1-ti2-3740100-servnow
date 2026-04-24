package com.servnow.backend.serviceorder;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SolicitacaoServicoRepository extends JpaRepository<SolicitacaoServico, Long> {
    List<SolicitacaoServico> findAllByClienteIdOrderByCriadoEmDesc(Long clienteId);
    List<SolicitacaoServico> findAllByStatusOrderByCriadoEmDesc(StatusSolicitacao status);
    Optional<SolicitacaoServico> findByIdAndClienteId(Long id, Long clienteId);
    Optional<SolicitacaoServico> findByIdAndStatus(Long id, StatusSolicitacao status);
}
