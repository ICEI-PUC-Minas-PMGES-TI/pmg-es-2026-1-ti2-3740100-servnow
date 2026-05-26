package com.servnow.backend.acompanhamento.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.servnow.backend.acompanhamento.domain.AtualizacaoServico;

public interface AtualizacaoServicoRepository extends JpaRepository<AtualizacaoServico, Long> {

    List<AtualizacaoServico> findByOrdemServicoIdOrderByCriadoEmDesc(Long ordemServicoId);
}
