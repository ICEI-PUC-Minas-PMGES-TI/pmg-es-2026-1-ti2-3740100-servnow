package com.servnow.backend.ArmazenamentoImagens;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

@Component
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "supabase")
public class SupabaseStorageClient {

    private final RestClient restClient;
    private final String bucket;

    public SupabaseStorageClient(StorageProperties properties) {
        SupabaseStorageProperties supabase = properties.getSupabase();
        String serviceRoleKey = supabase.getServiceRoleKey();
        if (serviceRoleKey == null || serviceRoleKey.isBlank()) {
            throw new IllegalStateException(
                "Defina SUPABASE_SERVICE_ROLE_KEY (ou app.storage.supabase.service-role-key) para usar Supabase Storage."
            );
        }

        String baseUrl = supabase.getUrl().replaceAll("/+$", "");
        this.bucket = supabase.getBucket();
        this.restClient = RestClient.builder()
            .baseUrl(baseUrl)
            .defaultHeader("Authorization", "Bearer " + serviceRoleKey)
            .defaultHeader("apikey", serviceRoleKey)
            .build();
    }

    public void enviar(String caminhoRelativo, byte[] conteudo, String contentType) {
        try {
            restClient.post()
                .uri(uriObject(caminhoRelativo))
                .header("Content-Type", contentType != null ? contentType : MediaType.APPLICATION_OCTET_STREAM_VALUE)
                .header("x-upsert", "true")
                .body(conteudo)
                .retrieve()
                .toBodilessEntity();
        } catch (RestClientResponseException exception) {
            throw falhaStorage("Nao foi possivel enviar o arquivo para o Supabase Storage.", exception);
        }
    }

    public Optional<ArquivoLeitura> baixar(String caminhoRelativo) {
        try {
            byte[] conteudo = restClient.get()
                .uri(uriObject(caminhoRelativo))
                .retrieve()
                .body(byte[].class);
            if (conteudo == null || conteudo.length == 0) {
                return Optional.empty();
            }
            return Optional.of(new ArquivoLeitura(conteudo, contentTypePorCaminho(caminhoRelativo)));
        } catch (RestClientResponseException exception) {
            if (exception.getStatusCode().value() == HttpStatus.NOT_FOUND.value()) {
                return Optional.empty();
            }
            throw falhaStorage("Nao foi possivel baixar o arquivo do Supabase Storage.", exception);
        }
    }

    public void excluir(String caminhoRelativo) {
        try {
            restClient.delete()
                .uri(uriObject(caminhoRelativo))
                .retrieve()
                .toBodilessEntity();
        } catch (RestClientResponseException exception) {
            if (exception.getStatusCode().value() == HttpStatus.NOT_FOUND.value()) {
                return;
            }
            // Melhor esforco ao substituir arquivo.
        }
    }

    private URI uriObject(String caminhoRelativo) {
        String caminhoCodificado = codificarCaminhoObjeto(caminhoRelativo);
        return URI.create("/storage/v1/object/" + bucket + "/" + caminhoCodificado);
    }

    static String codificarCaminhoObjeto(String caminhoRelativo) {
        return Arrays.stream(caminhoRelativo.replace('\\', '/').split("/"))
            .filter(segmento -> !segmento.isBlank())
            .map(segmento -> java.net.URLEncoder.encode(segmento, StandardCharsets.UTF_8))
            .collect(Collectors.joining("/"));
    }

    static String contentTypePorCaminho(String caminhoRelativo) {
        if (caminhoRelativo == null) {
            return MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }
        String nome = caminhoRelativo.toLowerCase();
        if (nome.endsWith(".jpg") || nome.endsWith(".jpeg")) {
            return MediaType.IMAGE_JPEG_VALUE;
        }
        if (nome.endsWith(".png")) {
            return MediaType.IMAGE_PNG_VALUE;
        }
        if (nome.endsWith(".webp")) {
            return "image/webp";
        }
        if (nome.endsWith(".pdf")) {
            return MediaType.APPLICATION_PDF_VALUE;
        }
        return MediaType.APPLICATION_OCTET_STREAM_VALUE;
    }

    private static ResponseStatusException falhaStorage(
        String mensagem,
        RestClientResponseException exception
    ) {
        String detalhe = exception.getResponseBodyAsString();
        if (detalhe != null && !detalhe.isBlank()) {
            detalhe = " — " + detalhe;
        } else {
            detalhe = "";
        }
        return new ResponseStatusException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            mensagem + " (" + exception.getStatusCode().value() + ")" + detalhe
        );
    }
}
