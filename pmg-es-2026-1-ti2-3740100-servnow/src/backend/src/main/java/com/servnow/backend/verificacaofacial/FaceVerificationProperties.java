package com.servnow.backend.verificacaofacial;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.face.verification")
public record FaceVerificationProperties(
    boolean enabled,
    double similarityThreshold
) {
    public FaceVerificationProperties {
        if (similarityThreshold <= 0 || similarityThreshold > 100) {
            similarityThreshold = 55;
        }
    }
}
