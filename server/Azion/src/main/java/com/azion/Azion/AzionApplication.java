package com.azion.Azion;


import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

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
		System.setProperty("secretGoogle", dotenv.get("SECRET_GOOGLE"));
		System.setProperty("os", dotenv.get("OS"));
		System.setProperty("spring.mail.username", dotenv.get("EMAIL"));
		System.setProperty("spring.mail.password", dotenv.get("EMAIL_PASSWORD"));
		System.setProperty("requestOrigin", dotenv.get("REQUEST_ORIGIN"));
		System.setProperty("requestOriginMobile", dotenv.get("REQUEST_ORIGIN_MOBILE"));
		System.setProperty("virusTotalApiKey", dotenv.get("VIRUS_TOTAL_API_KEY"));
		System.setProperty("sendgrid.api.key", dotenv.get("SENDGRID_API_KEY"));
		System.setProperty("google.client.id", dotenv.get("GOOGLE_CLIENT_ID"));
		System.setProperty("google.client.secret", dotenv.get("GOOGLE_CLIENT_SECRET"));
		System.setProperty("google.redirect.uri", dotenv.get("GOOGLE_REDIRECT_URI"));
		System.setProperty("chatEncryptionKey", dotenv.get("CHAT_ENCRYPTION_KEY"));
		
		SpringApplication.run(AzionApplication.class, args);
	}
}
