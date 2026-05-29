package com.servnow.backend.ArmazenamentoImagens;
import com.servnow.backend.ArmazenamentoImagens.StorageProperties;
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
public class ArquivoStorage {

    public static final String PASTA_SOLICITACOES = "solicitacoes";
    public static final String PASTA_ACOMPANHAMENTO = "acompanhamento";
    public static final String PASTA_PERFIL = "usuarios/perfil";
    public static final String PASTA_FOTO_LOCAL = "usuarios/fotos";
    public static final String PASTA_ENDERECO_CLIENTE = "usuarios/enderecos";
    public static final String PASTA_DOCUMENTOS = "usuarios/documentos";

    private static final long TAMANHO_MAXIMO_IMAGEM_BYTES = 2 * 1024 * 1024;
    private static final long TAMANHO_MAXIMO_DOCUMENTO_BYTES = 5 * 1024 * 1024;

    private static final Set<String> TIPOS_IMAGEM = Set.of(
        MediaType.IMAGE_JPEG_VALUE,
        MediaType.IMAGE_PNG_VALUE,
        "image/webp"
    );

    private static final Set<String> TIPOS_DOCUMENTO = Set.of(
        MediaType.IMAGE_JPEG_VALUE,
        MediaType.IMAGE_PNG_VALUE,
        "image/webp",
        MediaType.APPLICATION_PDF_VALUE
    );

    private final Path raizUpload;

    public ArquivoStorage(StorageProperties properties) {
        this.raizUpload = Path.of(properties.getUploadDir()).toAbsolutePath().normalize();
    }

    public String salvarImagem(MultipartFile arquivo, String pasta) {
        validarImagem(arquivo);
        return salvar(arquivo, pasta, TIPOS_IMAGEM);
    }

    public String salvarDocumento(MultipartFile arquivo) {
        validarDocumento(arquivo);
        return salvar(arquivo, PASTA_DOCUMENTOS, TIPOS_DOCUMENTO);
    }

    /** Compatibilidade com solicitacoes. */
    public String salvar(MultipartFile arquivo) {
        return salvarImagem(arquivo, PASTA_SOLICITACOES);
    }

    public void validarImagem(MultipartFile arquivo) {
        validarArquivo(arquivo, TAMANHO_MAXIMO_IMAGEM_BYTES, TIPOS_IMAGEM, "A imagem deve ter no maximo 2 MB.");
    }

    public void validarDocumento(MultipartFile arquivo) {
        validarArquivo(
            arquivo,
            TAMANHO_MAXIMO_DOCUMENTO_BYTES,
            TIPOS_DOCUMENTO,
            "O documento deve ter no maximo 5 MB."
        );
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

    public void excluirSeExistir(String caminhoRelativo) {
        Path arquivo = resolverAbsoluto(caminhoRelativo);
        if (arquivo == null) {
            return;
        }
        try {
            Files.deleteIfExists(arquivo);
        } catch (IOException ignored) {
            // Melhor esforco ao substituir arquivo.
        }
    }

    private String salvar(MultipartFile arquivo, String pasta, Set<String> tiposPermitidos) {
        String extensao = extensaoParaTipo(arquivo.getContentType(), tiposPermitidos);
        String nomeArquivo = UUID.randomUUID() + extensao;
        Path relativo = Path.of(pasta, nomeArquivo);
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
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Nao foi possivel salvar o arquivo.");
        }

        return relativo.toString().replace('\\', '/');
    }

    private void validarArquivo(
        MultipartFile arquivo,
        long tamanhoMaximo,
        Set<String> tiposPermitidos,
        String mensagemTamanho
    ) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Envie um arquivo valido.");
        }
        if (arquivo.getSize() > tamanhoMaximo) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, mensagemTamanho);
        }
        String tipo = arquivo.getContentType();
        if (tipo == null || !tiposPermitidos.contains(tipo.toLowerCase(Locale.ROOT))) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Formato de arquivo nao suportado."
            );
        }
    }

    private static String extensaoParaTipo(String contentType, Set<String> tiposPermitidos) {
        if (contentType == null) {
            return ".bin";
        }
        return switch (contentType.toLowerCase(Locale.ROOT)) {
            case MediaType.IMAGE_JPEG_VALUE -> ".jpg";
            case MediaType.IMAGE_PNG_VALUE -> ".png";
            case "image/webp" -> ".webp";
            case MediaType.APPLICATION_PDF_VALUE -> ".pdf";
            default -> tiposPermitidos.contains(MediaType.APPLICATION_PDF_VALUE) ? ".bin" : ".bin";
        };
    }
}
