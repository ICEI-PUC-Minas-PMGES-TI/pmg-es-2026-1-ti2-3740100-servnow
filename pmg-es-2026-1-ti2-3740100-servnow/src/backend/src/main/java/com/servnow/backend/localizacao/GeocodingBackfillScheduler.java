package com.servnow.backend.localizacao;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.servnow.backend.solicitacao.domain.SolicitacaoServico;
import com.servnow.backend.solicitacao.repository.SolicitacaoServicoRepository;
import com.servnow.backend.usuario.domain.Usuario;
import com.servnow.backend.usuario.repository.UsuarioRepository;

@Component
public class GeocodingBackfillScheduler {

    private static final Logger log = LoggerFactory.getLogger(GeocodingBackfillScheduler.class);

    private final GeocodingService geocodingService;
    private final UsuarioRepository usuarioRepository;
    private final SolicitacaoServicoRepository solicitacaoRepository;

    public GeocodingBackfillScheduler(
        GeocodingService geocodingService,
        UsuarioRepository usuarioRepository,
        SolicitacaoServicoRepository solicitacaoRepository
    ) {
        this.geocodingService = geocodingService;
        this.usuarioRepository = usuarioRepository;
        this.solicitacaoRepository = solicitacaoRepository;
    }

    @Scheduled(fixedDelay = 4_000, initialDelay = 15_000)
    @Transactional
    public void preencherProximoEnderecoPendente() {
        Optional<Usuario> usuarioPendente = usuarioRepository.findFirstByLatitudeIsNullAndCepIsNotNullOrderByIdAsc();
        if (usuarioPendente.isPresent() && temEnderecoCompleto(usuarioPendente.get())) {
            Usuario usuario = usuarioPendente.get();
            geocodingService.geocode(usuario).ifPresent(coords -> {
                usuario.setLatitude(coords.latitude());
                usuario.setLongitude(coords.longitude());
                usuarioRepository.save(usuario);
                log.debug("Coordenadas do usuario {} preenchidas em background.", usuario.getId());
            });
            return;
        }

        Optional<SolicitacaoServico> solicitacaoPendente =
            solicitacaoRepository.findFirstByLatitudeIsNullAndCepIsNotNullOrderByIdAsc();
        if (solicitacaoPendente.isPresent() && temEnderecoCompleto(solicitacaoPendente.get())) {
            SolicitacaoServico solicitacao = solicitacaoPendente.get();
            geocodingService.geocode(solicitacao).ifPresent(coords -> {
                solicitacao.setLatitude(coords.latitude());
                solicitacao.setLongitude(coords.longitude());
                solicitacaoRepository.save(solicitacao);
                log.debug("Coordenadas da solicitacao {} preenchidas em background.", solicitacao.getId());
            });
        }
    }

    private boolean temEnderecoCompleto(Usuario usuario) {
        return usuario.getRua() != null
            && usuario.getNumero() != null
            && usuario.getBairro() != null
            && usuario.getCidade() != null
            && usuario.getEstado() != null
            && usuario.getCep() != null;
    }

    private boolean temEnderecoCompleto(SolicitacaoServico solicitacao) {
        return solicitacao.getRua() != null
            && solicitacao.getNumero() != null
            && solicitacao.getBairro() != null
            && solicitacao.getCidade() != null
            && solicitacao.getEstado() != null
            && solicitacao.getCep() != null;
    }
}
