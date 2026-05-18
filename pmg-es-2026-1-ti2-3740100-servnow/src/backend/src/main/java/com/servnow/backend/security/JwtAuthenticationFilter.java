package com.servnow.backend.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioDetailsService usuarioDetailsService;

    public JwtAuthenticationFilter(
        JwtService jwtService,
        UsuarioDetailsService usuarioDetailsService
    ) {
        this.jwtService = jwtService;
        this.usuarioDetailsService = usuarioDetailsService;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        String token = extrairToken(request);
        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String email;
        try {
            email = jwtService.extrairEmail(token);
        } catch (JwtException | IllegalArgumentException exception) {
            responderNaoAutenticado(response, "Token invalido ou expirado.");
            return;
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails;
            try {
                userDetails = usuarioDetailsService.loadUserByUsername(email);
            } catch (UsernameNotFoundException exception) {
                responderNaoAutenticado(response, "Usuario do token nao foi encontrado.");
                return;
            }

            if (jwtService.tokenValido(token, userDetails)) {
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
                );
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                responderNaoAutenticado(response, "Token invalido ou expirado.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private void responderNaoAutenticado(HttpServletResponse response, String detalhe) throws IOException {
        SecurityContextHolder.clearContext();
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/problem+json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("""
            {"title":"Nao autenticado","status":401,"detail":"%s"}
            """.formatted(detalhe));
    }

    private String extrairToken(HttpServletRequest request) {
        String token = extrairTokenDoHeader(request.getHeader("Authorization"));
        if (token != null) {
            return token;
        }
        return extrairTokenDoHeader(request.getHeader("X-Authorization"));
    }

    private String extrairTokenDoHeader(String header) {
        if (header == null || header.isBlank()) {
            return null;
        }

        String valor = header.trim();
        if (!valor.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return null;
        }

        String token = valor.substring(7).trim();
        return token.isEmpty() ? null : token;
    }
}
