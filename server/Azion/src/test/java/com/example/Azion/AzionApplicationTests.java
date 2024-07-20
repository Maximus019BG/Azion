package com.example.Azion;

import com.azion.Azion.AzionApplication;
import io.github.cdimascio.dotenv.Dotenv;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@SpringBootTest(classes = AzionApplication.class)
class AzionApplicationTests {

    static Dotenv dotenv = Dotenv.configure()
                                  .directory("/home/max/IdeaProjects/Azion/")
                                  .load();

    @DynamicPropertySource
    static void setProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> dotenv.get("DB_URL"));
        registry.add("spring.datasource.username", () -> dotenv.get("DB_USERNAME"));
        registry.add("spring.datasource.password", () -> dotenv.get("DB_PASSWORD"));
        registry.add("secretJWT", () -> dotenv.get("SECRET_JWT"));
        registry.add("issuerName", () -> dotenv.get("ISSUER_NAME"));
        registry.add("secretMFA", () -> dotenv.get("SECRET_MFA"));
    }

    @Test
    void contextLoads() {
    }
}