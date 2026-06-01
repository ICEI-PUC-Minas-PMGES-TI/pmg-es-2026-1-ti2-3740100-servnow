package com.servnow.backend.ArmazenamentoImagens;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

class SupabaseStorageClientTest {

    @Test
    void codificaSegmentosDoCaminho() {
        assertThat(SupabaseStorageClient.codificarCaminhoObjeto("usuarios/perfil/foto.jpg"))
            .isEqualTo("usuarios/perfil/foto.jpg");
    }

    @Test
    void infereContentTypePelaExtensao() {
        assertThat(SupabaseStorageClient.contentTypePorCaminho("x/y/foto.png"))
            .isEqualTo(MediaType.IMAGE_PNG_VALUE);
    }
}
