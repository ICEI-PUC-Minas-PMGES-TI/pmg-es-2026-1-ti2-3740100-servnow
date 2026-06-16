package com.servnow.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.servnow.backend.ArmazenamentoImagens.StorageProperties;
import com.servnow.backend.pagamento.mercadopago.MercadoPagoProperties;
import com.servnow.backend.verificacaofacial.FaceVerificationProperties;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties({ StorageProperties.class, FaceVerificationProperties.class, MercadoPagoProperties.class })
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

}
