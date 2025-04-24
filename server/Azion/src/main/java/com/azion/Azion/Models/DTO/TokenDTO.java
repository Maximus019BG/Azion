package com.azion.Azion.Models.DTO;

public class TokenDTO {
    private String token;
    private String email;
    private String UserAgent;
    private String tokenType;
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getUserAgent() {
        return UserAgent;
    }
    
    public void setUserAgent(String userAgent) {
        UserAgent = userAgent;
    }
    
    public String getTokenType() {
        return tokenType;
    }
    
    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }
    
}
