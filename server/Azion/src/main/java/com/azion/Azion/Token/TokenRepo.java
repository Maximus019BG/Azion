package com.azion.Azion.Token;

import com.azion.Azion.User.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;


public interface TokenRepo extends JpaRepository<Token, String> {
    
    Token findByToken(String token);
    Token findByTokenType(TokenType tokenType);
    
   
    @Query("SELECT COUNT(t) > 0 FROM Token t WHERE t.subject = :subject")
    boolean existsByUser(@Param("subject") User user);
    
    
    void deleteBySubject(User user);
}
