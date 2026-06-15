package com.servnow.backend.auth.service;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.servnow.backend.auth.domain.PasswordResetToken;
import com.servnow.backend.auth.repository.PasswordResetTokenRepository;
import com.servnow.backend.email.EmailService;
import com.servnow.backend.usuario.domain.Usuario;
import com.servnow.backend.usuario.repository.UsuarioRepository;

@Service
public class RecuperacaoSenhaService {

    private static final Logger log = LoggerFactory.getLogger(RecuperacaoSenhaService.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.reset.expiration-minutes:30}")
    private long expiracaoMinutos;

    public RecuperacaoSenhaService(
        UsuarioRepository usuarioRepository,
        PasswordResetTokenRepository tokenRepository,
        PasswordEncoder passwordEncoder,
        EmailService emailService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    /**
     * Gera um token e envia o e-mail com o link de redefinicao.
     * Sempre retorna sem erro, mesmo se o e-mail nao existir (nao revela cadastro).
     */
    @Transactional
    public void solicitar(String emailBruto) {
        String email = emailBruto == null ? "" : emailBruto.trim().toLowerCase();
        usuarioRepository.findByEmail(email).ifPresent(usuario -> {
            tokenRepository.deleteByUsuarioId(usuario.getId());

            String token = UUID.randomUUID().toString().replace("-", "");
            PasswordResetToken reset = new PasswordResetToken();
            reset.setToken(token);
            reset.setUsuario(usuario);
            reset.setExpiraEm(OffsetDateTime.now().plusMinutes(expiracaoMinutos));
            tokenRepository.save(reset);

            String base = frontendUrl.replaceAll("/+$", "");
            String link = base + "/redefinir-senha?token=" + token;
            String corpo = "Ola, " + usuario.getNome() + "!\n\n"
                + "Recebemos um pedido para redefinir a senha da sua conta ServNow.\n"
                + "Crie uma nova senha pelo link abaixo (valido por " + expiracaoMinutos + " minutos):\n\n"
                + link + "\n\n"
                + "Se voce nao solicitou, e so ignorar este e-mail.\n\n"
                + "Equipe ServNow";

            if (emailService.configurado()) {
                try {
                    emailService.enviar(email, "Redefinicao de senha - ServNow", corpo);
                } catch (Exception erro) {
                    log.warn("Nao foi possivel enviar o e-mail de recuperacao para {}: {}", email, erro.getMessage());
                }
            } else {
                log.warn("E-mail nao configurado (MAIL_USERNAME/MAIL_PASSWORD). Link de redefinicao para {}: {}", email, link);
            }
        });
    }

    @Transactional
    public void redefinir(String token, String novaSenha) {
        PasswordResetToken reset = tokenRepository.findByToken(token)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Link invalido ou expirado."));

        if (reset.isUsado() || reset.getExpiraEm().isBefore(OffsetDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Link invalido ou expirado.");
        }

        Usuario usuario = reset.getUsuario();
        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);

        reset.setUsado(true);
        tokenRepository.save(reset);
    }
}
