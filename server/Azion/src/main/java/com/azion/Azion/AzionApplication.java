package com.azion.Azion;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class AzionApplication {

	public static void main(String[] args) {
		
		Dotenv dotenv = Dotenv.configure().load();
		
		System.setProperty("spring.datasource.url", dotenv.get("DB_URL"));
		System.setProperty("spring.datasource.username", dotenv.get("DB_USERNAME"));
		System.setProperty("spring.datasource.password", dotenv.get("DB_PASSWORD"));
		System.setProperty("secretJWT", dotenv.get("SECRET_JWT"));
		System.setProperty("issuerName", dotenv.get("ISSUER_NAME"));
		System.setProperty("secretMFA", dotenv.get("SECRET_MFA"));
		
		SpringApplication.run(AzionApplication.class, args);
	}

}
