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
        
        try {
            
            Token tokenObj = new Token();
            tokenObj.setIssuer(issuer);
            tokenObj.setAudience(audience);
            //setToken() is lower in code
            tokenObj.setTokenType(tokenType);
            tokenObj.setSubject(user);// use email
            tokenObj.setIssuedAt(new Date(System.currentTimeMillis()));
            tokenObj.setExpiresAt(new Date(System.currentTimeMillis() + 60*60*1000));
            Algorithm algorithm = Algorithm.HMAC512(secret);
            
            token = JWT.create()
                    .withIssuer(tokenObj.getIssuer())
                    .withAudience(tokenObj.getAudience())
                    .withJWTId(token_type.toLowerCase()+"_"+ UUID.randomUUID().toString().replace("-", ""))
                    .withSubject(tokenObj.getSubject().getEmail())
                    .withIssuedAt(tokenObj.getIssuedAt())
                    .withExpiresAt(tokenObj.getExpiresAt())
                    .sign(algorithm);
            
            tokenObj.setToken(token);
            
            tokenRepo.save(tokenObj);
            
            
            
        } catch (JWTCreationException exception){
        
        }
        return token;
    }
}
