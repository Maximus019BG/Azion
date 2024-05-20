package com.azion.Azion.User.Service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Model.Token;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class TokenService {
    
    
    public Token createToken(User user, String secret) {
        Algorithm algorithm = Algorithm.HMAC256(secret);
        String Issuer = System.getProperty("issuerName");
        String tokenValue = JWT.create()
                .withIssuer(Issuer)
                .withSubject(user.getName())
                .withExpiresAt(new Date(System.currentTimeMillis() + 3600*1000/2)) //30 min
                .sign(algorithm);

        String refreshTokenValue = JWT.create()
                .withIssuer(Issuer)
                .withSubject(user.getName())
                .withExpiresAt(new Date(System.currentTimeMillis() + 3600L *1000*24*30)) // 30 days
                .sign(algorithm);
        
        Token token = new Token(tokenValue, user, tokenValue, refreshTokenValue, new Date(System.currentTimeMillis() + 3600*1000));
        token.setRefreshToken(refreshTokenValue);
        

        return token;
    }
}