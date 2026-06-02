package com.servnow.backend.config;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    // Origens extras liberadas via configuracao (ex.: front hospedado).
    // Defina a env APP_CORS_ALLOWED_ORIGINS (ou app.cors.allowed-origins), separadas por virgula.
    @Value("${app.cors.allowed-origins:}")
    private String allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        List<String> patterns = new ArrayList<>(List.of(
            "http://localhost:*",
            "http://127.0.0.1:*"
        ));

        if (allowedOrigins != null && !allowedOrigins.isBlank()) {
            for (String origem : allowedOrigins.split(",")) {
                String limpa = origem.trim();
                if (!limpa.isEmpty()) {
                    patterns.add(limpa);
                }
            }
        }

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(patterns);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "X-Authorization", "Content-Type", "Accept", "Origin"));
        configuration.setExposedHeaders(List.of("Authorization", "X-Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
