package com.servnow.backend.ArmazenamentoImagens;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.storage")
public class StorageProperties {

    /**
     * Diretorio raiz onde arquivos enviados sao gravados (subpastas por tipo).
     */
    private String uploadDir = "data/servnow-uploads";

    public String getUploadDir() {
        return uploadDir;
    }

    public void setUploadDir(String uploadDir) {
        this.uploadDir = uploadDir;
    }
}
