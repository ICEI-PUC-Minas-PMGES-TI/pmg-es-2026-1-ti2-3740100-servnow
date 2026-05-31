package com.servnow.backend.perfil.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.servnow.backend.perfil.domain.ClienteEndereco;

public interface ClienteEnderecoRepository extends JpaRepository<ClienteEndereco, Long> {

    List<ClienteEndereco> findByUsuario_IdOrderByPrincipalDescCriadoEmAsc(Long usuarioId);

    Optional<ClienteEndereco> findByIdAndUsuario_Id(Long id, Long usuarioId);

    long countByUsuario_Id(Long usuarioId);
}
