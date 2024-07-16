package com.azion.Azion;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Allows CORS for all paths
                        .allowedOriginPatterns("http://localhost:3000") // Specify allowed origins explicitly or use patterns
                        .allowedMethods("*") // Allows all methods
                        .allowedHeaders("*") // Allows all headers
                        .allowCredentials(true); // Allows credentials
            }
        };
    }
}