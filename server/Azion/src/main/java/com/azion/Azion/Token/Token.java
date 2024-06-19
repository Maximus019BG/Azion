package com.azion.Azion.Token;

import com.azion.Azion.User.Model.User;
import jakarta.persistence.*;


@Entity
@Table(name="tokens_azion")
public class Token {
    
    @Id
    @GeneratedValue
    private Integer id;
    
    @Column(unique = true)
    private String token;
    
    @Enumerated(EnumType.STRING)
    private TokenType tokenType;
    
    @Column
    private String created_at;
    
    @Column
    private boolean is_revoked;
    
    @Column
    private String revoked_at;
    
    @Column
    private boolean expired;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
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
    
    public String getCreated_at() {
        return created_at;
    }
    
    public void setCreated_at(String created_at) {
        this.created_at = created_at;
    }
    
    public boolean isIs_revoked() {
        return is_revoked;
    }
    
    public void setIs_revoked(boolean is_revoked) {
        this.is_revoked = is_revoked;
    }
    
    public String getRevoked_at() {
        return revoked_at;
    }
    
    public void setRevoked_at(String revoked_at) {
        this.revoked_at = revoked_at;
    }
    
    public boolean isExpired() {
        return expired;
    }
    
    public void setExpired(boolean expired) {
        this.expired = expired;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
}