package com.servnow.backend.pagamento.mercadopago;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pagamento")
public class PagamentoGatewayController {

    private final MercadoPagoCheckoutService checkoutService;

    public PagamentoGatewayController(MercadoPagoCheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @GetMapping("/cartao/disponivel")
    public Map<String, Object> cartaoDisponivel() {
        return Map.of(
            "disponivel", checkoutService.cartaoDisponivel(),
            "modo", checkoutService.modoCartao()
        );
    }
}
