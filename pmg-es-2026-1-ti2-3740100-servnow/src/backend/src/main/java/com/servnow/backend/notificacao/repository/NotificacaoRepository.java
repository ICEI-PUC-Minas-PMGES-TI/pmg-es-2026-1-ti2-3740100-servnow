package com.servnow.backend.notificacao.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.servnow.backend.notificacao.domain.Notificacao;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {
    List<Notificacao> findTop30ByUsuarioIdOrderByCriadoEmDesc(Long usuarioId);
    List<Notificacao> findByUsuarioIdAndLidaFalse(Long usuarioId);
    long countByUsuarioIdAndLidaFalse(Long usuarioId);
    Optional<Notificacao> findByIdAndUsuarioId(Long id, Long usuarioId);
}
