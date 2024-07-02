package com.azion.Azion.Token;

import com.azion.Azion.Org.Model.Org;
import com.azion.Azion.User.Model.User;
import jakarta.persistence.*;

import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "tokens_azion")
public class Token {
    
    @Id
    private String id;
    
    @Column(nullable = false)
    private String issuer;
    
    @Column(nullable = false)
    private String audience;
    
    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String token;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TokenType tokenType;
    
    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "email", referencedColumnName = "email")
    private User subject;
    
    @Column(nullable = false)
    private Date issuedAt;
    
    @Column(nullable = false)
    private Date expiresAt;
    
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
    
    public String getIssuer() {
        return issuer;
    }
    
    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }
    
    public String getAudience() {
        return audience;
    }
    
    public void setAudience(String audience) {
        this.audience = audience;
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
    
    public Date getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(Date expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    public Date getIssuedAt() {
        return issuedAt;
    }
    
    public void setIssuedAt(Date issuedAt) {
        this.issuedAt = issuedAt;
    }
    
    
    public Token() {
    }
    public Token(String issuer, String audience, String token, User subject, Date issuedAt, Date expiresAt) {
        setIssuer(issuer);
        setAudience(audience);
        setToken(token);
        setSubject(subject);
        setIssuedAt(issuedAt);
        setExpiresAt(expiresAt);
    }
}
