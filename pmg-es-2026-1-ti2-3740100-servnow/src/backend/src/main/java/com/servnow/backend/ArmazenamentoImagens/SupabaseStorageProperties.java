package com.servnow.backend.ArmazenamentoImagens;

public class SupabaseStorageProperties {

    private String url = "https://psdpcrdizivftcqzkkow.supabase.co";
    private String bucket = "Imagens";
    private String serviceRoleKey = "";

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getBucket() {
        return bucket;
    }

    public void setBucket(String bucket) {
        this.bucket = bucket;
    }

    public String getServiceRoleKey() {
        return serviceRoleKey;
    }

    public void setServiceRoleKey(String serviceRoleKey) {
        this.serviceRoleKey = serviceRoleKey;
    }
}
