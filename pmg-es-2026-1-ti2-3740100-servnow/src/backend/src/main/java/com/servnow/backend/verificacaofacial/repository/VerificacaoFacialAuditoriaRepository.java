package com.servnow.backend.verificacaofacial.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.servnow.backend.verificacaofacial.domain.VerificacaoFacialAuditoria;

public interface VerificacaoFacialAuditoriaRepository extends JpaRepository<VerificacaoFacialAuditoria, Long> {
}
