package com.servnow.backend.ArmazenamentoImagens;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;

@ConfigurationProperties(prefix = "app.storage")
public class StorageProperties {

    /**
     * local = disco do servidor; supabase = Supabase Storage (recomendado em producao).
     */
    private String provider = "local";

    /**
     * Diretorio raiz onde arquivos enviados sao gravados quando provider=local.
     */
    private String uploadDir = "data/servnow-uploads";

    @NestedConfigurationProperty
    private final SupabaseStorageProperties supabase = new SupabaseStorageProperties();

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getUploadDir() {
        return uploadDir;
    }

    public void setUploadDir(String uploadDir) {
        this.uploadDir = uploadDir;
    }

    public SupabaseStorageProperties getSupabase() {
        return supabase;
    }

    public boolean usaSupabase() {
        return "supabase".equalsIgnoreCase(provider);
    }
}
