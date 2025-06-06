package com.azion.Azion.Repositories;

import com.azion.Azion.Enums.TokenType;
import com.azion.Azion.Models.Token;
import com.azion.Azion.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;


public interface TokenRepo extends JpaRepository<Token, String> {
    
    Token findByToken(String token);
    Token findByTokenType(TokenType tokenType);
    
   
    @Query("SELECT COUNT(t) > 0 FROM Token t WHERE t.subject = :subject")
    boolean existsByUser(@Param("subject") User user);
    
    List<Token> findAllBySubject(User user);
    
    User findSubjectByToken(String token);
    
    void deleteBySubject(User user);
}
