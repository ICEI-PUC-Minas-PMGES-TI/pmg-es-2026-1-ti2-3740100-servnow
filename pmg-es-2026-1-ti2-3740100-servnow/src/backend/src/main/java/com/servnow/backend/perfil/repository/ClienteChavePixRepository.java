package com.servnow.backend.perfil.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.servnow.backend.perfil.domain.ClienteChavePix;

public interface ClienteChavePixRepository extends JpaRepository<ClienteChavePix, Long> {

    List<ClienteChavePix> findByUsuarioIdOrderByPrincipalDescCriadoEmAsc(Long usuarioId);

    Optional<ClienteChavePix> findByIdAndUsuarioId(Long id, Long usuarioId);

    long countByUsuarioId(Long usuarioId);
}
