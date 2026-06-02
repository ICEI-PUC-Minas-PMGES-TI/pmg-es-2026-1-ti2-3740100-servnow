package com.servnow.backend.indicadores.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import com.servnow.backend.indicadores.dto.IndicadorPrestadorResponse;
import com.servnow.backend.indicadores.service.IndicadorPrestadorService;
import com.servnow.backend.security.UsuarioAutenticado;

@RestController
@RequestMapping({"/api/indicadores", "/api/indicadoreS"})
public class IndicadorPrestadorController {

    private final IndicadorPrestadorService indicadorPrestadorService;

    public IndicadorPrestadorController(IndicadorPrestadorService indicadorPrestadorService) {
        this.indicadorPrestadorService = indicadorPrestadorService;
    }

    @GetMapping({"/prestador", "/prestador/"})
    public IndicadorPrestadorResponse obterIndicadoresPrestador(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @RequestParam(defaultValue = "mes") String periodo
    ) {
        return indicadorPrestadorService.obterIndicadores(usuario, periodo);
    }
}
