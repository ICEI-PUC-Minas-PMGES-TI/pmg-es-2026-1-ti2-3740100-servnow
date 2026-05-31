package com.servnow.backend.perfil.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.servnow.backend.perfil.domain.ClienteChavePix;

public interface ClienteChavePixRepository extends JpaRepository<ClienteChavePix, Long> {

    List<ClienteChavePix> findByUsuario_IdOrderByPrincipalDescCriadoEmAsc(Long usuarioId);

    Optional<ClienteChavePix> findByIdAndUsuario_Id(Long id, Long usuarioId);

    long countByUsuario_Id(Long usuarioId);
}
