package com.servnow.backend.ArmazenamentoImagens;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SolicitacaoImagemStorage {

    static final String PASTA_SOLICITACOES = "solicitacoes";

    private static final long TAMANHO_MAXIMO_BYTES = 2 * 1024 * 1024;

    private static final Set<String> TIPOS_PERMITIDOS = Set.of(
        MediaType.IMAGE_JPEG_VALUE,
        MediaType.IMAGE_PNG_VALUE,
        "image/webp"
    );

    private final Path raizUpload;

    public SolicitacaoImagemStorage(StorageProperties properties) {
        this.raizUpload = Path.of(properties.getUploadDir()).toAbsolutePath().normalize();
    }

    /**
     * Salva o arquivo e retorna caminho relativo ao diretorio de upload (ex.: solicitacoes/uuid.jpg).
     */
    public String salvar(MultipartFile arquivo) {
        validar(arquivo);

        String extensao = extensaoParaTipo(arquivo.getContentType());
        String nomeArquivo = UUID.randomUUID() + extensao;
        Path relativo = Path.of(PASTA_SOLICITACOES, nomeArquivo);
        Path destinoAbsoluto = raizUpload.resolve(relativo).normalize();

        if (!destinoAbsoluto.startsWith(raizUpload)) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Caminho de upload invalido.");
        }

        try {
            Files.createDirectories(destinoAbsoluto.getParent());
            try (InputStream entrada = arquivo.getInputStream()) {
                Files.copy(entrada, destinoAbsoluto, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Nao foi possivel salvar a imagem.");
        }

        return relativo.toString().replace('\\', '/');
    }

    public Path resolverAbsoluto(String caminhoRelativo) {
        if (caminhoRelativo == null || caminhoRelativo.isBlank()) {
            return null;
        }
        Path normalizado = raizUpload.resolve(caminhoRelativo).normalize();
        if (!normalizado.startsWith(raizUpload)) {
            return null;
        }
        return normalizado;
    }

    public void validar(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Envie um arquivo de imagem valido.");
        }
        if (arquivo.getSize() > TAMANHO_MAXIMO_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A imagem deve ter no maximo 2 MB.");
        }
        String tipo = arquivo.getContentType();
        if (tipo == null || !TIPOS_PERMITIDOS.contains(tipo.toLowerCase(Locale.ROOT))) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Formato de imagem nao suportado. Use JPEG, PNG ou WebP."
            );
        }
    }

    private static String extensaoParaTipo(String contentType) {
        if (contentType == null) {
            return ".bin";
        }
        return switch (contentType.toLowerCase(Locale.ROOT)) {
            case MediaType.IMAGE_JPEG_VALUE -> ".jpg";
            case MediaType.IMAGE_PNG_VALUE -> ".png";
            case "image/webp" -> ".webp";
            default -> ".bin";
        };
    }
}
