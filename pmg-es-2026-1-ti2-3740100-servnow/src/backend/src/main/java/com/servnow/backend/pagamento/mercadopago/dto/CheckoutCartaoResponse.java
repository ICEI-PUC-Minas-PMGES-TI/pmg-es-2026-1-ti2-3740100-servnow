package com.servnow.backend.pagamento.mercadopago.dto;

public record CheckoutCartaoResponse(
    String checkoutUrl,
    String preferenceId
) {
}
