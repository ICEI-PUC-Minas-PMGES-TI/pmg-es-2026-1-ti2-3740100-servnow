package com.servnow.backend.localizacao;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class CepGeocodingServiceTest {

    private final CepGeocodingService cepGeocodingService = new CepGeocodingService();

    @Test
    void buscarCoordenadasRetornaVazioParaCepInvalido() {
        assertThat(cepGeocodingService.buscarCoordenadas("123")).isEmpty();
        assertThat(cepGeocodingService.buscarCoordenadas(null)).isEmpty();
    }

    @Test
    void cepCompativelComEnderecoIgnoraQuandoCidadeOuEstadoAusentes() {
        assertThat(cepGeocodingService.cepCompativelComEndereco("30100-000", null, "MG")).isTrue();
    }
}
