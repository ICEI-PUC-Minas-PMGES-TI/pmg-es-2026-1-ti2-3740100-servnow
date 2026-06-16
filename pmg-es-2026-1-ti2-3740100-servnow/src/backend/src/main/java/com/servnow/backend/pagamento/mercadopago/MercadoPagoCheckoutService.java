package com.servnow.backend.pagamento.mercadopago;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import tools.jackson.databind.JsonNode;
import com.servnow.backend.acompanhamento.domain.EtapaOrdemServico;
import com.servnow.backend.acompanhamento.domain.OrdemServico;
import com.servnow.backend.acompanhamento.repository.OrdemServicoRepository;
import com.servnow.backend.pagamento.mercadopago.dto.CheckoutCartaoResponse;
import com.servnow.backend.security.UsuarioAutenticado;
import com.servnow.backend.solicitacao.domain.SolicitacaoServico;
import com.servnow.backend.usuario.domain.TipoUsuario;
import com.servnow.backend.usuario.domain.Usuario;
import com.servnow.backend.usuario.repository.UsuarioRepository;

@Service
public class MercadoPagoCheckoutService {

    static final String REF_PREFIX = "servnow-";

    private final MercadoPagoProperties properties;
    private final OrdemServicoRepository ordemRepository;
    private final UsuarioRepository usuarioRepository;
    private final RestClient mercadoPagoClient;
    private final String frontendUrl;
    private final String backendUrl;

    public MercadoPagoCheckoutService(
        MercadoPagoProperties properties,
        OrdemServicoRepository ordemRepository,
        UsuarioRepository usuarioRepository,
        @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl,
        @Value("${app.backend-url:http://localhost:8080}") String backendUrl
    ) {
        this.properties = properties;
        this.ordemRepository = ordemRepository;
        this.usuarioRepository = usuarioRepository;
        this.frontendUrl = frontendUrl.replaceAll("/+$", "");
        this.backendUrl = backendUrl.replaceAll("/+$", "");
        this.mercadoPagoClient = RestClient.builder()
            .baseUrl("https://api.mercadopago.com")
            .defaultHeader("Authorization", "Bearer " + (properties.accessToken() == null ? "" : properties.accessToken()))
            .build();
    }

    public boolean cartaoDisponivel() {
        return properties.configurado() || mockAtivo();
    }

    public String modoCartao() {
        if (mockAtivo()) {
            return "demo";
        }
        if (properties.configurado()) {
            return "mercadopago";
        }
        return "indisponivel";
    }

    private boolean mockAtivo() {
        if (!ambienteLocal()) {
            return false;
        }
        return properties.demoMode() || !properties.configurado();
    }

    private boolean ambienteLocal() {
        return backendUrl.contains("localhost")
            || backendUrl.contains("127.0.0.1")
            || frontendUrl.contains("localhost")
            || frontendUrl.contains("127.0.0.1");
    }

    @Transactional
    public CheckoutCartaoResponse iniciarCheckout(
        Long solicitacaoId,
        UsuarioAutenticado usuarioAutenticado,
        String metodoPagamento
    ) {
        validarGatewayOuMock();
        validarMetodoCartao(metodoPagamento);

        ContextoPagamento contexto = carregarContexto(solicitacaoId, usuarioAutenticado);
        OrdemServico ordem = contexto.ordem();
        ordem.setMetodoPagamentoSelecionado(metodoPagamento);
        ordemRepository.save(ordem);

        if (mockAtivo()) {
            String checkoutUrl = frontendUrl + "/acompanhamento/" + solicitacaoId + "?pagamento=cartao-sucesso";
            return new CheckoutCartaoResponse(checkoutUrl, "mock-" + solicitacaoId);
        }

        String referencia = referenciaExterna(solicitacaoId);
        String titulo = "Servico ServNow #" + solicitacaoId;
        BigDecimal valor = contexto.valor().setScale(2, RoundingMode.HALF_UP);
        double valorUnitario = valor.doubleValue();
        String baseRetorno = resolverBaseUrlRetorno();

        Map<String, Object> item = new HashMap<>();
        item.put("title", titulo);
        item.put("quantity", 1);
        item.put("unit_price", valorUnitario);
        item.put("currency_id", "BRL");

        Map<String, String> backUrls = new HashMap<>();
        backUrls.put("success", montarUrlRetorno(baseRetorno, solicitacaoId, "cartao-sucesso"));
        backUrls.put("failure", montarUrlRetorno(baseRetorno, solicitacaoId, "cartao-erro"));
        backUrls.put("pending", montarUrlRetorno(baseRetorno, solicitacaoId, "cartao-pendente"));

        Map<String, Object> body = new HashMap<>();
        body.put("items", List.of(item));
        body.put("external_reference", referencia);
        body.put("back_urls", backUrls);
        if (baseRetorno.startsWith("https://")) {
            body.put("auto_return", "approved");
        }
        String webhookUrl = resolverWebhookUrl();
        if (webhookUrl != null) {
            body.put("notification_url", webhookUrl);
        }
        body.put("metadata", Map.of(
            "solicitacao_id", solicitacaoId,
            "metodo_pagamento", metodoPagamento
        ));
        body.put("statement_descriptor", "SERVNOW");

        if (properties.sandbox()) {
            body.put("payer", Map.of("email", "test@testuser.com"));
        } else if (contexto.cliente().getEmail() != null && !contexto.cliente().getEmail().isBlank()) {
            body.put("payer", Map.of("email", contexto.cliente().getEmail().trim().toLowerCase()));
        }

        if ("DEBITO".equals(metodoPagamento)) {
            Map<String, Object> paymentMethods = new HashMap<>();
            paymentMethods.put("installments", 1);
            paymentMethods.put("default_installments", 1);
            paymentMethods.put("excluded_payment_types", tiposPagamentoExcluidos("DEBITO"));
            body.put("payment_methods", paymentMethods);
        } else {
            Map<String, Object> paymentMethods = new HashMap<>();
            paymentMethods.put("installments", 12);
            paymentMethods.put("default_installments", 1);
            paymentMethods.put("excluded_payment_types", tiposPagamentoExcluidos("CREDITO"));
            body.put("payment_methods", paymentMethods);
        }

        JsonNode resposta;
        try {
            resposta = mercadoPagoClient.post()
                .uri("/checkout/preferences")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
        } catch (RestClientResponseException exception) {
            throw new ResponseStatusException(
                HttpStatus.BAD_GATEWAY,
                "Mercado Pago recusou o checkout: " + extrairMensagemErroMp(exception)
            );
        }

        if (resposta == null || resposta.get("id") == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Resposta invalida do Mercado Pago.");
        }

        String checkoutUrl = escolherUrlCheckout(resposta);
        if (checkoutUrl == null || checkoutUrl.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Nao foi possivel obter o link de pagamento.");
        }

        return new CheckoutCartaoResponse(checkoutUrl, resposta.get("id").asText());
    }

    @Transactional
    public boolean sincronizarPagamento(
        Long solicitacaoId,
        UsuarioAutenticado usuarioAutenticado,
        String paymentId
    ) {
        validarGatewayOuMock();
        OrdemServico ordem = buscarOrdemPagamentoCliente(solicitacaoId, usuarioAutenticado);
        EtapaOrdemServico etapa = ordem.getEtapa();
        if (etapa == EtapaOrdemServico.AGUARDANDO_AVALIACAO || etapa == EtapaOrdemServico.CONCLUIDA) {
            return true;
        }
        if (etapa != EtapaOrdemServico.AGUARDANDO_PAGAMENTO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O servico nao esta aguardando pagamento.");
        }

        if (mockAtivo()) {
            return confirmarPagamentoMock(ordem);
        }

        if (paymentId != null && !paymentId.isBlank()) {
            JsonNode pagamento = buscarPagamento(paymentId);
            if (pagamento != null && "approved".equalsIgnoreCase(texto(pagamento.get("status")))) {
                Long solicitacaoPagamento = extrairSolicitacaoId(pagamento);
                if (solicitacaoPagamento != null && solicitacaoPagamento.equals(solicitacaoId)) {
                    return confirmarPagamentoAprovado(ordem, pagamento);
                }
            }
        }

        return buscarPagamentoAprovado(solicitacaoId)
            .map(pagamento -> confirmarPagamentoAprovado(ordem, pagamento))
            .orElse(false);
    }

    @Transactional
    public void processarNotificacaoPagamento(String paymentId) {
        validarGateway();
        if (paymentId == null || paymentId.isBlank()) {
            return;
        }

        JsonNode pagamento = buscarPagamento(paymentId);
        if (pagamento == null) {
            return;
        }

        String status = texto(pagamento.get("status"));
        if (!"approved".equalsIgnoreCase(status)) {
            return;
        }

        Long solicitacaoId = extrairSolicitacaoId(pagamento);
        if (solicitacaoId == null) {
            return;
        }

        OrdemServico ordem = ordemRepository.findWithDetalhesBySolicitacaoId(solicitacaoId)
            .orElse(null);
        if (ordem == null || ordem.getEtapa() != EtapaOrdemServico.AGUARDANDO_PAGAMENTO) {
            return;
        }

        confirmarPagamentoAprovado(ordem, pagamento);
    }

    private boolean confirmarPagamentoAprovado(OrdemServico ordem, JsonNode pagamento) {
        String metodo = resolverMetodoPagamento(pagamento, ordem.getMetodoPagamentoSelecionado());
        ordem.setMetodoPagamento(metodo);
        ordem.setMetodoPagamentoSelecionado(null);
        ordem.setEtapa(EtapaOrdemServico.AGUARDANDO_AVALIACAO);
        ordemRepository.save(ordem);
        return true;
    }

    private Optional<JsonNode> buscarPagamentoAprovado(Long solicitacaoId) {
        JsonNode resultado = mercadoPagoClient.get()
            .uri(uriBuilder -> uriBuilder
                .path("/v1/payments/search")
                .queryParam("external_reference", referenciaExterna(solicitacaoId))
                .queryParam("sort", "date_created")
                .queryParam("criteria", "desc")
                .build())
            .retrieve()
            .body(JsonNode.class);

        if (resultado == null || !resultado.has("results")) {
            return Optional.empty();
        }

        for (JsonNode pagamento : resultado.get("results")) {
            if ("approved".equalsIgnoreCase(texto(pagamento.get("status")))) {
                return Optional.of(pagamento);
            }
        }
        return Optional.empty();
    }

    private JsonNode buscarPagamento(String paymentId) {
        return mercadoPagoClient.get()
            .uri("/v1/payments/{id}", paymentId)
            .retrieve()
            .body(JsonNode.class);
    }

    private String resolverMetodoPagamento(JsonNode pagamento, String metodoSelecionado) {
        if (metodoSelecionado != null && !metodoSelecionado.isBlank()) {
            return metodoSelecionado;
        }
        JsonNode metadata = pagamento.get("metadata");
        if (metadata != null && metadata.hasNonNull("metodo_pagamento")) {
            return metadata.get("metodo_pagamento").asText();
        }
        return "CREDITO";
    }

    private Long extrairSolicitacaoId(JsonNode pagamento) {
        String referencia = texto(pagamento.get("external_reference"));
        if (referencia != null && referencia.startsWith(REF_PREFIX)) {
            try {
                return Long.parseLong(referencia.substring(REF_PREFIX.length()));
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        JsonNode metadata = pagamento.get("metadata");
        if (metadata != null && metadata.hasNonNull("solicitacao_id")) {
            return metadata.get("solicitacao_id").asLong();
        }
        return null;
    }

    private OrdemServico buscarOrdemPagamentoCliente(Long solicitacaoId, UsuarioAutenticado usuarioAutenticado) {
        Usuario usuario = usuarioRepository.findById(usuarioAutenticado.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario nao encontrado."));
        if (usuario.getTipoUsuario() != TipoUsuario.CLIENTE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Somente o cliente pode pagar com cartao.");
        }

        OrdemServico ordem = ordemRepository.findWithDetalhesBySolicitacaoId(solicitacaoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Ordem de servico nao iniciada."));
        SolicitacaoServico solicitacao = ordem.getSolicitacao();
        if (solicitacao.getCliente() == null || !solicitacao.getCliente().getId().equals(usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a esta solicitacao.");
        }
        return ordem;
    }

    private ContextoPagamento carregarContexto(Long solicitacaoId, UsuarioAutenticado usuarioAutenticado) {
        OrdemServico ordem = buscarOrdemPagamentoCliente(solicitacaoId, usuarioAutenticado);
        if (ordem.getEtapa() != EtapaOrdemServico.AGUARDANDO_PAGAMENTO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O servico nao esta aguardando pagamento.");
        }

        SolicitacaoServico solicitacao = ordem.getSolicitacao();
        BigDecimal valor = ordem.getValorFinal() != null ? ordem.getValorFinal() : solicitacao.getValorAceito();
        if (valor == null || valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Valor do servico nao definido.");
        }

        Usuario usuario = ordem.getSolicitacao().getCliente();
        return new ContextoPagamento(ordem, valor, usuario);
    }

    private String extrairMensagemErroMp(RestClientResponseException exception) {
        String body = exception.getResponseBodyAsString();
        if (body == null || body.isBlank()) {
            return "HTTP " + exception.getStatusCode().value();
        }
        try {
            JsonNode json = new tools.jackson.databind.ObjectMapper().readTree(body);
            if (json.hasNonNull("message")) {
                return json.get("message").asText();
            }
            if (json.has("cause") && json.get("cause").isArray() && !json.get("cause").isEmpty()) {
                JsonNode causa = json.get("cause").get(0);
                if (causa.hasNonNull("description")) {
                    return causa.get("description").asText();
                }
            }
        } catch (Exception ignored) {
            // usa corpo bruto abaixo
        }
        return body.length() > 200 ? body.substring(0, 200) + "..." : body;
    }

    private boolean confirmarPagamentoMock(OrdemServico ordem) {
        String metodo = ordem.getMetodoPagamentoSelecionado();
        if (metodo == null || (!"CREDITO".equals(metodo) && !"DEBITO".equals(metodo))) {
            return false;
        }
        ordem.setMetodoPagamento(metodo);
        ordem.setMetodoPagamentoSelecionado(null);
        ordem.setEtapa(EtapaOrdemServico.AGUARDANDO_AVALIACAO);
        ordemRepository.save(ordem);
        return true;
    }

    private void validarGatewayOuMock() {
        if (!cartaoDisponivel()) {
            throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Pagamento com cartao indisponivel. Configure MERCADO_PAGO_ACCESS_TOKEN."
            );
        }
    }

    private void validarGateway() {
        if (!properties.configurado()) {
            throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Pagamento com cartao indisponivel. Configure MERCADO_PAGO_ACCESS_TOKEN."
            );
        }
    }

    private void validarMetodoCartao(String metodoPagamento) {
        if (!"CREDITO".equals(metodoPagamento) && !"DEBITO".equals(metodoPagamento)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Metodo de pagamento invalido para checkout.");
        }
    }

    /** Boleto/PIX desativam o botao Pagar no sandbox quando o fluxo e cartao. account_money nao pode ser excluido (regra MP). */
    private List<Map<String, String>> tiposPagamentoExcluidos(String metodoPagamento) {
        List<String> ids = new ArrayList<>(List.of("ticket", "bank_transfer", "atm"));
        if ("DEBITO".equals(metodoPagamento)) {
            ids.add("credit_card");
        } else {
            ids.add("debit_card");
        }
        return ids.stream().map(id -> Map.of("id", id)).toList();
    }

    private String referenciaExterna(Long solicitacaoId) {
        return REF_PREFIX + solicitacaoId;
    }

    private String resolverBaseUrlRetorno() {
        if (properties.useLocalReturn() && ambienteLocal()) {
            String httpsBase = properties.returnUrlBase();
            if (httpsBase != null && !httpsBase.isBlank() && httpsBase.startsWith("https://")) {
                return httpsBase.replaceAll("/+$", "");
            }
            return frontendUrl.replaceAll("/+$", "");
        }
        if (frontendUrl.startsWith("https://")) {
            return frontendUrl.replaceAll("/+$", "");
        }
        String base = properties.returnUrlBase();
        if (base != null && !base.isBlank()) {
            return base.replaceAll("/+$", "");
        }
        return frontendUrl.replaceAll("/+$", "");
    }

    /** MP redireciona para HTTPS (Vercel); local_front devolve o usuario ao localhost apos o retorno. */
    private String montarUrlRetorno(String baseRetorno, Long solicitacaoId, String pagamento) {
        String url = baseRetorno + "/acompanhamento/" + solicitacaoId + "?pagamento=" + pagamento;
        if (properties.useLocalReturn() && ambienteLocal() && baseRetorno.startsWith("https://")) {
            String local = frontendUrl.replaceAll("/+$", "");
            url += "&local_front=" + URLEncoder.encode(local, StandardCharsets.UTF_8);
        }
        return url;
    }

    /** Em dev local o webhook vai para o Render (HTTPS), mesmo banco Supabase. */
    private String resolverWebhookUrl() {
        if (backendUrl.startsWith("https://")) {
            return backendUrl + "/api/webhooks/mercadopago";
        }
        if (ambienteLocal() && properties.configurado()) {
            return "https://servnow-backend.onrender.com/api/webhooks/mercadopago";
        }
        return null;
    }

    private String escolherUrlCheckout(JsonNode resposta) {
        if (properties.sandbox()) {
            if (resposta.hasNonNull("sandbox_init_point")) {
                return resposta.get("sandbox_init_point").asText();
            }
            throw new ResponseStatusException(
                HttpStatus.BAD_GATEWAY,
                "Mercado Pago nao retornou URL de sandbox. Use credenciais TEST- e o checkout sandbox."
            );
        }
        if (resposta.hasNonNull("init_point")) {
            return resposta.get("init_point").asText();
        }
        return null;
    }

    private String texto(JsonNode node) {
        return node == null || node.isNull() ? null : node.asText();
    }

    private record ContextoPagamento(OrdemServico ordem, BigDecimal valor, Usuario cliente) {
    }
}
