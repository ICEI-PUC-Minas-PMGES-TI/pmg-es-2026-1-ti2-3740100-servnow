package com.servnow.backend.acompanhamento.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.servnow.backend.acompanhamento.dto.AcompanhamentoDetalheResponse;
import com.servnow.backend.acompanhamento.dto.AcompanhamentoDisponivelResponse;
import com.servnow.backend.acompanhamento.dto.AvaliarServicoRequest;
import com.servnow.backend.acompanhamento.dto.ConfirmarChegadaRequest;
import com.servnow.backend.acompanhamento.dto.ConfirmarPagamentoRequest;
import com.servnow.backend.acompanhamento.dto.ConfirmarReagendamentoRequest;
import com.servnow.backend.acompanhamento.dto.SolicitarReagendamentoRequest;
import com.servnow.backend.acompanhamento.service.AcompanhamentoService;
import com.servnow.backend.pagamento.mercadopago.MercadoPagoCheckoutService;
import com.servnow.backend.pagamento.mercadopago.dto.CheckoutCartaoResponse;
import com.servnow.backend.security.UsuarioAutenticado;
import com.servnow.backend.verificacaofacial.dto.RegistrarVerificacaoFacialRequest;
import com.servnow.backend.verificacaofacial.dto.VerificacaoFacialResponse;
import com.servnow.backend.verificacaofacial.service.VerificacaoFacialService;

import jakarta.validation.Valid;

@RestController
@RequestMapping({"/api/acompanhamento", "/api/acompanhamento/"})
public class AcompanhamentoController {

    private final AcompanhamentoService acompanhamentoService;
    private final VerificacaoFacialService verificacaoFacialService;
    private final MercadoPagoCheckoutService mercadoPagoCheckoutService;

    public AcompanhamentoController(
        AcompanhamentoService acompanhamentoService,
        VerificacaoFacialService verificacaoFacialService,
        MercadoPagoCheckoutService mercadoPagoCheckoutService
    ) {
        this.acompanhamentoService = acompanhamentoService;
        this.verificacaoFacialService = verificacaoFacialService;
        this.mercadoPagoCheckoutService = mercadoPagoCheckoutService;
    }

    @GetMapping({"/disponiveis", "/disponiveis/"})
    public List<AcompanhamentoDisponivelResponse> listarDisponiveis(
        @AuthenticationPrincipal UsuarioAutenticado usuario
    ) {
        return acompanhamentoService.listarDisponiveis(usuario);
    }

    @GetMapping("/{solicitacaoId}")
    public AcompanhamentoDetalheResponse obterDetalhe(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long solicitacaoId
    ) {
        return acompanhamentoService.obterDetalhe(solicitacaoId, usuario);
    }

    @PostMapping("/{solicitacaoId}/iniciar")
    public AcompanhamentoDetalheResponse iniciar(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long solicitacaoId
    ) {
        return acompanhamentoService.iniciar(solicitacaoId, usuario);
    }

    @PostMapping("/{solicitacaoId}/renovar-codigo")
    public AcompanhamentoDetalheResponse renovarCodigo(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long solicitacaoId
    ) {
        return acompanhamentoService.renovarCodigo(solicitacaoId, usuario);
    }

    @PostMapping("/{solicitacaoId}/verificar-identidade")
    public VerificacaoFacialResponse verificarIdentidade(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long solicitacaoId,
        @Valid @RequestBody RegistrarVerificacaoFacialRequest request
    ) {
        return verificacaoFacialService.verificarIdentidade(solicitacaoId, usuario, request);
    }

    @PostMapping("/{solicitacaoId}/confirmar-chegada")
    public AcompanhamentoDetalheResponse confirmarChegada(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long solicitacaoId,
        @Valid @RequestBody ConfirmarChegadaRequest request
    ) {
        return acompanhamentoService.confirmarChegada(solicitacaoId, usuario, request);
    }

    @PostMapping(value = "/{solicitacaoId}/atualizacoes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AcompanhamentoDetalheResponse registrarAtualizacao(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long solicitacaoId,
        @RequestPart("descricao") String descricao,
        @RequestPart(value = "foto", required = false) MultipartFile foto
    ) {
        return acompanhamentoService.registrarAtualizacao(solicitacaoId, usuario, descricao, foto);
    }

    @PostMapping("/{solicitacaoId}/concluir-execucao")
    public AcompanhamentoDetalheResponse concluirExecucao(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long solicitacaoId
    ) {
        return acompanhamentoService.concluirExecucao(solicitacaoId, usuario);
    }

    @PostMapping("/{solicitacaoId}/solicitar-reagendamento")
    public AcompanhamentoDetalheResponse solicitarReagendamento(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long solicitacaoId,
        @Valid @RequestBody SolicitarReagendamentoRequest request
    ) {
        return acompanhamentoService.solicitarReagendamento(solicitacaoId, usuario, request);
    }

    @PostMapping("/{solicitacaoId}/confirmar-reagendamento")
    public AcompanhamentoDetalheResponse confirmarReagendamento(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long solicitacaoId,
        @Valid @RequestBody ConfirmarReagendamentoRequest request
    ) {
        return acompanhamentoService.confirmarReagendamento(solicitacaoId, usuario, request);
    }

    @PostMapping("/{solicitacaoId}/selecionar-metodo-pagamento")
    public AcompanhamentoDetalheResponse selecionarMetodoPagamento(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long solicitacaoId,
        @Valid @RequestBody ConfirmarPagamentoRequest request
    ) {
        return acompanhamentoService.selecionarMetodoPagamento(solicitacaoId, usuario, request);
    }

    @PostMapping("/{solicitacaoId}/confirmar-pagamento")
    public AcompanhamentoDetalheResponse confirmarPagamento(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long solicitacaoId,
        @Valid @RequestBody ConfirmarPagamentoRequest request
    ) {
        return acompanhamentoService.confirmarPagamento(solicitacaoId, usuario, request);
    }

    @PostMapping("/{solicitacaoId}/checkout-cartao")
    public CheckoutCartaoResponse iniciarCheckoutCartao(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long solicitacaoId,
        @Valid @RequestBody ConfirmarPagamentoRequest request
    ) {
        return mercadoPagoCheckoutService.iniciarCheckout(solicitacaoId, usuario, request.metodoPagamento());
    }

    @PostMapping("/{solicitacaoId}/sincronizar-pagamento-cartao")
    public AcompanhamentoDetalheResponse sincronizarPagamentoCartao(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long solicitacaoId,
        @RequestParam(required = false) String paymentId
    ) {
        mercadoPagoCheckoutService.sincronizarPagamento(solicitacaoId, usuario, paymentId);
        return acompanhamentoService.obterDetalhe(solicitacaoId, usuario);
    }

    @GetMapping("/{solicitacaoId}/pix-qrcode")
    public ResponseEntity<byte[]> obterQrCodePix(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long solicitacaoId
    ) {
        byte[] imagem = acompanhamentoService.gerarQrCodePix(solicitacaoId, usuario);
        return ResponseEntity.ok()
            .header(HttpHeaders.CACHE_CONTROL, "no-store")
            .contentType(MediaType.IMAGE_PNG)
            .body(imagem);
    }

    @GetMapping("/{solicitacaoId}/pix-copia-cola")
    public ResponseEntity<String> obterCopiaColaPix(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long solicitacaoId
    ) {
        String payload = acompanhamentoService.gerarCopiaColaPix(solicitacaoId, usuario);
        return ResponseEntity.ok()
            .header(HttpHeaders.CACHE_CONTROL, "no-store")
            .contentType(MediaType.TEXT_PLAIN)
            .body(payload);
    }

    @PostMapping("/{solicitacaoId}/avaliar")
    public AcompanhamentoDetalheResponse avaliar(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long solicitacaoId,
        @Valid @RequestBody AvaliarServicoRequest request
    ) {
        return acompanhamentoService.avaliar(solicitacaoId, usuario, request);
    }

    @PostMapping("/{solicitacaoId}/avaliar-cliente")
    public AcompanhamentoDetalheResponse avaliarCliente(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long solicitacaoId,
        @Valid @RequestBody AvaliarServicoRequest request
    ) {
        return acompanhamentoService.avaliarCliente(solicitacaoId, usuario, request);
    }

    @GetMapping("/{solicitacaoId}/atualizacoes/{atualizacaoId}/foto")
    public ResponseEntity<byte[]> obterFotoAtualizacao(
        @AuthenticationPrincipal UsuarioAutenticado usuario,
        @PathVariable Long solicitacaoId,
        @PathVariable Long atualizacaoId
    ) {
        var foto = acompanhamentoService.obterFotoAtualizacao(solicitacaoId, atualizacaoId, usuario);
        return ResponseEntity.ok()
            .header(HttpHeaders.CACHE_CONTROL, "private, max-age=3600")
            .contentType(MediaType.parseMediaType(foto.contentType()))
            .body(foto.conteudo());
    }
}
