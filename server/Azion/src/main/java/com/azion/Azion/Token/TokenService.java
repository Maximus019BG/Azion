package com.azion.Azion.Token;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.azion.Azion.User.Model.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static com.azion.Azion.Token.TokenType.ACCESS_TOKEN;
import static com.azion.Azion.Token.TokenType.REFRESH_TOKEN;

@Service
@Slf4j
public class TokenService {
    
    private final TokenRepo tokenRepo;
    
    
    @Autowired
    public TokenService(TokenRepo tokenRepo) {
        this.tokenRepo = tokenRepo;
    }
    
    public String generateToken(TokenType tokenType, User user, String issuer, String audience, String UserAgent) {
        String token = "";
        String token_type = tokenType.toString();
        String secret = System.getProperty("secretJWT");
        Long time = 0L;
        
        if (tokenType == REFRESH_TOKEN) {
            time = 60 * 60 * 24 * 1000 * 5L;//5 days
            
        } else if (tokenType == ACCESS_TOKEN) {
            time = 60 * 15 * 1000L;//15 minutes
        }
        
        try {
            Token tokenObj = new Token();
            //setToken() is lower in code
            tokenObj.setTokenType(tokenType);
            tokenObj.setSubject(user);
            tokenObj.setIssuedAt(new Date(System.currentTimeMillis()));
            Algorithm algorithm = Algorithm.HMAC512(secret);
            
            token = JWT.create()
                    .withIssuer(issuer)
                    .withAudience(audience)
                    .withJWTId(token_type.toLowerCase() + "_" + UUID.randomUUID().toString().replace("-", ""))
                    .withSubject(tokenObj.getSubject().getId())
                    .withIssuedAt(tokenObj.getIssuedAt())
                    .withExpiresAt(new Date(System.currentTimeMillis() + time))
                    .sign(algorithm);
            
            tokenObj.setToken(token);
            tokenObj.setUserAgent(UserAgent);
            
            tokenRepo.save(tokenObj);
            
            
        } catch (JWTCreationException exception) {
        
        }
        return token;
    }
    
    public String sessionCheck(String refreshToken, String accessToken) {
        Token tokenObjA = tokenRepo.findByToken(accessToken);
        Token tokenObjR = tokenRepo.findByToken(refreshToken);
        if (tokenObjA != null && tokenObjR != null) {
            User user = tokenObjA.getSubject();
            if (tokenObjA.getSubject().getId().equals(tokenObjR.getSubject().getId())) {
                if (isAccessTokenOutOfDate(accessToken) && isRefreshTokenOutOfDate(refreshToken)) {
                    deleteTokens(accessToken, refreshToken);
                    while (tokenRepo.existsByUser(user)) {
                        tokenRepo.deleteBySubject(user);
                    }
                    log.debug("Both tokens are expired. Please log in again.");
                    return "false";
                } else if (isAccessTokenOutOfDate(accessToken) && !isRefreshTokenOutOfDate(refreshToken)) {
                    log.debug("Access token is expired. Generating new access token.");
                    return "newAccessToken";
                } else if (!isAccessTokenOutOfDate(accessToken) && !isRefreshTokenOutOfDate(refreshToken)) {
                    if (validateToken(accessToken) && validateToken(refreshToken)) {
                        log.debug("Both tokens are valid.");
                        return "true";
                    } else {
                        deleteTokens(accessToken, refreshToken);
                        log.debug("Both tokens are invalid. Please log in again.");
                        return "false";
                    }
                }
            }
        }
        return "false";
    }
    
    public boolean validateToken(String token) {
        
        String secret = System.getProperty("secretJWT");
        Token tokenObj = null;
        boolean isValid = false;
        try {
            Algorithm algorithm = Algorithm.HMAC512(secret);
            tokenObj = tokenRepo.findByToken(token);
            JWT.require(algorithm).build().verify(token);
            isValid = true;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return isValid;
    }
    
    public void deleteTokens(String tokenA, String tokenR) {
        Token tokenObjA = tokenRepo.findByToken(tokenA);
        Token tokenObjR = tokenRepo.findByToken(tokenR);
        if (tokenObjA != null && tokenObjR != null) {
            tokenObjA.setSubject(null);
            tokenObjR.setSubject(null);
            tokenRepo.save(tokenObjA);
            tokenRepo.save(tokenObjR);
            tokenRepo.delete(tokenObjA);
            tokenRepo.delete(tokenObjR);
        } else if (tokenObjA != null && tokenObjR == null) {
            tokenObjA.setSubject(null);
            tokenRepo.save(tokenObjA);
            tokenRepo.delete(tokenObjA);
        } else if (tokenObjA == null && tokenObjR != null) {
            tokenObjR.setSubject(null);
            tokenRepo.save(tokenObjR);
            tokenRepo.delete(tokenObjR);
        }
        
    }
    
    public boolean isAccessTokenOutOfDate(String token) {
        Token tokenObj = tokenRepo.findByToken(token);
        DecodedJWT jwt = JWT.decode(token);
        if (tokenObj.getTokenType() == ACCESS_TOKEN && jwt.getExpiresAt().getTime() <= System.currentTimeMillis()) {
            return true;
        } else return tokenObj.getTokenType() != ACCESS_TOKEN || jwt.getExpiresAt().getTime() <= System.currentTimeMillis();
    }
    
    public boolean isRefreshTokenOutOfDate(String token) {
        Token tokenObj = tokenRepo.findByToken(token);
        DecodedJWT jwt = JWT.decode(token);
        if (tokenObj.getTokenType() == REFRESH_TOKEN && jwt.getExpiresAt().getTime() <= System.currentTimeMillis()) {
            return true;
        } else return tokenObj.getTokenType() != REFRESH_TOKEN || jwt.getExpiresAt().getTime() <= System.currentTimeMillis();
    }
    
    public User getUserFromToken(String token) {
        Token tokenObj = tokenRepo.findByToken(token);
        return tokenObj.getSubject();
    }
    
    public String regenerateAccessToken(String refreshToken, String UserAgent) {
        Token refreshTok = tokenRepo.findByToken(refreshToken);
        if (refreshTok != null && !isRefreshTokenOutOfDate(refreshToken)) {
            User user = refreshTok.getSubject();
            return generateToken(ACCESS_TOKEN, user, System.getProperty("issuerName"), "https://azion.net/", UserAgent);
        }
        return null;
    }
    
    //Show Sessions
    public List<TokenPlatformResponse> showAllTokens(String accessToken) {
        User user = getUserFromToken(accessToken);
        List<Token> tokens = tokenRepo.findAllBySubject(user);
        List<TokenDTO> tokensDTO = tokens.stream().map(token -> {
            TokenDTO tokenDTO = new TokenDTO();
            tokenDTO.setToken(token.getToken());
            tokenDTO.setEmail(token.getSubject().getEmail());
            tokenDTO.setUserAgent(token.getUserAgent());
            tokenDTO.setTokenType(token.getTokenType().toString());
            return tokenDTO;
        }).collect(Collectors.toList());
        
        Map<String, String> platformMap = new HashMap<>();
        platformMap.put("Android", "Android");
        platformMap.put("iOS", "iPhone|iPad");
        platformMap.put("Windows", "Windows");
        platformMap.put("Linux", "Linux");
        platformMap.put("Mac", "Mac");
        
        List<TokenPlatformResponse> sortedTokens = new ArrayList<>();
        for (TokenDTO tokenDTO : tokensDTO) {
            if (tokenDTO.getTokenType().equals("REFRESH_TOKEN")) {
                String platform = tokenDTO.getUserAgent();
                String model = "Unknown Model";
                for (Map.Entry<String, String> entry : platformMap.entrySet()) {
                    if (platform.contains(entry.getValue())) {
                        if (entry.getKey().equals("Android")) {
                            int startIndex = platform.indexOf("Android") + "Android".length();
                            int endIndex = platform.indexOf(";", startIndex);
                            if (endIndex != -1) {
                                model = "Android " + platform.substring(startIndex, endIndex).trim();
                            }
                        } else if (entry.getKey().equals("iOS")) {
                            if (platform.contains("iPhone")) {
                                model = "iPhone";
                            } else if (platform.contains("iPad")) {
                                model = "iPad";
                            }
                        } else if (entry.getKey().equals("Windows")) {
                            int startIndex = platform.indexOf("Windows") + "Windows".length();
                            int endIndex = platform.indexOf(";", startIndex);
                            if (endIndex != -1) {
                                model = "Win "+platform.substring(startIndex, endIndex).trim();
                            }
                        } else if (entry.getKey().equals("Linux")) {
                            int startIndex = platform.indexOf("Linux") + "Linux".length();
                            int endIndex = platform.indexOf(";", startIndex);
                            if (endIndex != -1) {
                                model = "Linux " + platform.substring(startIndex, endIndex).trim();
                            }
                        } else if (entry.getKey().equals("Mac")) {
                            int startIndex = platform.indexOf("Mac") + "Mac".length();
                            int endIndex = platform.indexOf(";", startIndex);
                            if (endIndex != -1) {
                                model = "Mac " + platform.substring(startIndex, endIndex).trim();
                            }
                        }
                        sortedTokens.add(new TokenPlatformResponse(tokenDTO, model));
                        break;
                    }
                }
                
                if (!sortedTokens.stream().anyMatch(t -> t.getTokenDTO().equals(tokenDTO))) {
                    sortedTokens.add(new TokenPlatformResponse(tokenDTO, "Other"));
                }
            }
        }
        return sortedTokens;
    }
    
    //Delete access tokens for user
    public void deleteAllTokens(User user, String token, TokenType type) {
        List<Token> tokens = tokenRepo.findAllBySubject(user);
        for (Token newToken : tokens) {
            if (!Objects.equals(newToken.getToken(), token) && newToken.getTokenType() == type) {
                newToken.setSubject(null);
                tokenRepo.save(newToken);
                tokenRepo.delete(newToken);
            }
        }
    }
    
}
