package com.servnow.backend.pagamento.mercadopago;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import tools.jackson.databind.JsonNode;

@RestController
@RequestMapping("/api/webhooks/mercadopago")
public class MercadoPagoWebhookController {

    private final MercadoPagoCheckoutService checkoutService;

    public MercadoPagoWebhookController(MercadoPagoCheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @PostMapping
    public ResponseEntity<Void> receberPost(
        @RequestBody(required = false) JsonNode body,
        @RequestParam(value = "topic", required = false) String topic,
        @RequestParam(value = "id", required = false) String queryId,
        @RequestParam(value = "data.id", required = false) String dataId
    ) {
        String paymentId = resolverPaymentId(body, topic, queryId, dataId);
        if (paymentId != null && !paymentId.isBlank()) {
            checkoutService.processarNotificacaoPagamento(paymentId);
        }
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @GetMapping
    public ResponseEntity<Void> receberGet(
        @RequestParam(value = "data.id", required = false) String dataId,
        @RequestParam(value = "id", required = false) String id,
        @RequestParam(value = "topic", required = false) String topic
    ) {
        String paymentId = resolverPaymentId(null, topic, id, dataId);
        if (paymentId != null && !paymentId.isBlank()) {
            checkoutService.processarNotificacaoPagamento(paymentId);
        }
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    private String resolverPaymentId(JsonNode body, String topic, String queryId, String dataId) {
        if (topic != null && !"payment".equalsIgnoreCase(topic)) {
            return null;
        }
        if (body != null) {
            if (body.has("data") && body.get("data").hasNonNull("id")) {
                return body.get("data").get("id").asText();
            }
            if (body.hasNonNull("id")) {
                return body.get("id").asText();
            }
        }
        if (dataId != null && !dataId.isBlank()) {
            return dataId;
        }
        return queryId;
    }
}
