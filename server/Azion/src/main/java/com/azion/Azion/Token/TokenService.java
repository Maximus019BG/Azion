package com.azion.Azion.Token;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.azion.Azion.User.Model.User;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.UUID;

@Service
public class TokenService {
    
    private final TokenRepo tokenRepo;
  
    
    @Autowired
    public TokenService(TokenRepo tokenRepo)  {
        this.tokenRepo = tokenRepo;
    }

    public String generateToken(TokenType tokenType, User user, String issuer, String audience){
        Dotenv dotenv = Dotenv.load();
        
        String token = "";
        String token_type = tokenType.toString();
        String secret = dotenv.get("SECRET_JWT");
        Long time = 0L;
        
        if(tokenType == TokenType.REFRESH_TOKEN){
            time = 60*60*24*1000*5L;//5 day
        }
        else if(tokenType == TokenType.ACCESS_TOKEN){
            time = 60*60*1000L;//1 hour
        }
      
        try {
            
            Token tokenObj = new Token();
            //setToken() is lower in code
            tokenObj.setTokenType(tokenType);
            tokenObj.setSubject(user);// use ID
            tokenObj.setIssuedAt(new Date(System.currentTimeMillis()));
            Algorithm algorithm = Algorithm.HMAC512(secret);
            
            
            token = JWT.create()
                    .withIssuer(issuer)
                    .withAudience(audience)
                    .withJWTId(token_type.toLowerCase()+"_"+ UUID.randomUUID().toString().replace("-", ""))
                    .withSubject(tokenObj.getSubject().getId())
                    .withIssuedAt(tokenObj.getIssuedAt())
                    .withExpiresAt(new Date(System.currentTimeMillis() + time))
                    .sign(algorithm);
            
            tokenObj.setToken(token);
           
            tokenRepo.save(tokenObj);
            
            
            
        } catch (JWTCreationException exception){
        
        }
        return token;
    }
    
    public boolean validateToken(String token) {
        Dotenv dotenv = Dotenv.load();
        String secret = dotenv.get("SECRET_JWT");
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
    
    public void deleteToken(String tokenA, String tokenR) {
        Token tokenObjA = tokenRepo.findByToken(tokenA);
        Token tokenObjR = tokenRepo.findByToken(tokenR);
        if (tokenObjA != null && tokenObjR != null){
            tokenObjA.setSubject(null);
            tokenObjR.setSubject(null);
            tokenRepo.save(tokenObjA);
            tokenRepo.save(tokenObjR);
            tokenRepo.delete(tokenObjA);
            tokenRepo.delete(tokenObjR);
        } else if(tokenObjA != null && tokenObjR == null){
            tokenObjA.setSubject(null);
            tokenRepo.save(tokenObjA);
            tokenRepo.delete(tokenObjA);
        } else if(tokenObjA == null && tokenObjR != null){
            tokenObjR.setSubject(null);
            tokenRepo.save(tokenObjR);
            tokenRepo.delete(tokenObjR);
        }
   
    }
    
    public boolean isAccessTokenOutOfDate(String token) {
        Token tokenObj = tokenRepo.findByToken(token);
        if (tokenObj.getTokenType() == TokenType.ACCESS_TOKEN && tokenObj.getIssuedAt().getTime() <= System.currentTimeMillis()) {
            return true;
        } else if (tokenObj.getTokenType() == TokenType.ACCESS_TOKEN && tokenObj.getIssuedAt().getTime() > System.currentTimeMillis()) {
            return false;
        }
        else {
            return true;
        }
    }
    public boolean isRefreshTokenOutOfDate(String token) {
        Token tokenObj = tokenRepo.findByToken(token);
        if (tokenObj.getTokenType() == TokenType.REFRESH_TOKEN && tokenObj.getIssuedAt().getTime() <= System.currentTimeMillis()) {
            return true;
        } else if (tokenObj.getTokenType() == TokenType.REFRESH_TOKEN && tokenObj.getIssuedAt().getTime() > System.currentTimeMillis()) {
            return false;
        }
        else {
            return true;
        }
    }
    
    
}
