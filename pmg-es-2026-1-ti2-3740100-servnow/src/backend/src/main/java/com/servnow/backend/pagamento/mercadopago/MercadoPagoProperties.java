package com.servnow.backend.pagamento.mercadopago;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.mercadopago")
public record MercadoPagoProperties(
    String accessToken,
    boolean enabled,
    String returnUrlBase,
    boolean demoMode,
    boolean useLocalReturn
) {
    public boolean configurado() {
        return enabled && accessToken != null && !accessToken.isBlank();
    }

    public boolean sandbox() {
        return accessToken != null && accessToken.startsWith("TEST-");
    }
}
