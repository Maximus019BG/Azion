package com.azion.Azion.Token;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import io.github.cdimascio.dotenv.Dotenv;

import java.util.Date;
import java.util.UUID;

public class TokenService {
   
   /*TODO:
    * !
    * !Make it so it takes the issuer and the audience as parameters!!!!!!!!!!!!!!!!
    * !
    */
    public String generateToken(TokenType tokenType, String email){
        Dotenv dotenv = Dotenv.load();
        
        String token = "";
        String token_type = tokenType.toString();
        String secret = dotenv.get("SECRET_JWT");
        
        try {
            Algorithm algorithm = Algorithm.HMAC512(secret);
            token = JWT.create()
                    .withIssuer("https://azion.com/auth/login")
                    .withAudience("https://azion.com/")
                    .withJWTId(token_type.toLowerCase()+"_"+ UUID.randomUUID().toString().replace("-", ""))
                    .withSubject(email) // use email
                    .withIssuedAt(new Date(System.currentTimeMillis()))
                    .withExpiresAt(new Date(System.currentTimeMillis() + 60*60*1000))
                    .sign(algorithm);
            
        } catch (JWTCreationException exception){
        
        }
        return token;
    }
}
