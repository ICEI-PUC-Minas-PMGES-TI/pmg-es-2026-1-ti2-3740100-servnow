package com.servnow.backend.usuario.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class UsuarioTest {

    @Test
    void prePersistDefineDataDeCriacaoQuandoAindaNaoExiste() {
        Usuario usuario = new Usuario();

        usuario.prePersist();

        assertThat(usuario.getCriadoEm()).isNotNull();
    }
}
