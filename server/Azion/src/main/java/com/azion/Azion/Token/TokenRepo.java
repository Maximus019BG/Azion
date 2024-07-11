package com.azion.Azion.Token;

import com.azion.Azion.User.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface TokenRepo extends JpaRepository<Token, String> {
    
    Token findByToken(String token);
    Token findByTokenType(TokenType tokenType);
    List<Token> findBySubject(User subject);
}
