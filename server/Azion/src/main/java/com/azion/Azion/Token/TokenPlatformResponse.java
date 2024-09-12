package com.azion.Azion.Token;

public class TokenPlatformResponse {
    private TokenDTO tokenDTO;
    private String platform;

    public TokenPlatformResponse(TokenDTO tokenDTO, String platform) {
        this.tokenDTO = tokenDTO;
        this.platform = platform;
    }

    public TokenDTO getTokenDTO() {
        return tokenDTO;
    }

    public void setTokenDTO(TokenDTO tokenDTO) {
        this.tokenDTO = tokenDTO;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }
}