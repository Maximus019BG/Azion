package com.azion.Azion.Models;

import com.azion.Azion.Enums.TokenType;
import jakarta.persistence.*;

import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "tokens_azion")
public class Token {
    
    @Id
    private String id;
    
    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String token;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TokenType tokenType;
    
    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "user", referencedColumnName = "id", unique = false)
    private User subject;
    
    @Column(nullable = false)
    private Date issuedAt;
    
    @Column(nullable = false)
    private String UserAgent;
    
    @PrePersist
    public void generateId() {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        this.id = uuid.substring(0, Math.min(uuid.length(), 50)) + System.currentTimeMillis();
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public TokenType getTokenType() {
        return tokenType;
    }
    
    public void setTokenType(TokenType tokenType) {
        this.tokenType = tokenType;
    }
    
    public User getSubject() {
        return subject;
    }
    
    public void setSubject(User subject) {
        this.subject = subject;
    }
    
    public Date getIssuedAt() {
        return issuedAt;
    }
    
    public void setIssuedAt(Date issuedAt) {
        this.issuedAt = issuedAt;
    }
    
    public String getUserAgent() {
        return UserAgent;
    }
    
    public void setUserAgent(String userAgent) {
        UserAgent = userAgent;
    }
    
    public Token() {
    }
    
    public Token(String token, User subject, Date issuedAt) {
        
        setToken(token);
        setSubject(subject);
        setIssuedAt(issuedAt);
    }
}
