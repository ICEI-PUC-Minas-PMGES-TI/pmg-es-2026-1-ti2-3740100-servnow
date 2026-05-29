package com.servnow.backend.perfil.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.servnow.backend.perfil.domain.ClienteEndereco;

public interface ClienteEnderecoRepository extends JpaRepository<ClienteEndereco, Long> {

    List<ClienteEndereco> findByUsuarioIdOrderByPrincipalDescCriadoEmAsc(Long usuarioId);

    Optional<ClienteEndereco> findByIdAndUsuarioId(Long id, Long usuarioId);

    long countByUsuarioId(Long usuarioId);
}
