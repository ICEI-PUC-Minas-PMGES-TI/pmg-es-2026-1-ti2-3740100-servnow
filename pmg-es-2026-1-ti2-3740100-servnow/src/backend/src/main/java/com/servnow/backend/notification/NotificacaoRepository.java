package com.servnow.backend.notification;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {
    List<Notificacao> findAllByUsuarioIdOrderByCriadoEmDesc(Long usuarioId);
    long countByUsuarioIdAndLidaFalse(Long usuarioId);
    Optional<Notificacao> findByIdAndUsuarioId(Long id, Long usuarioId);
}
