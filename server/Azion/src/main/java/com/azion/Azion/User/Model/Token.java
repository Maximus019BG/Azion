package com.azion.Azion.User.Model;

import java.util.Date;

public class Token {
    private String value;
    private String jwtToken;
    private String refreshToken;
    private User user;
    private Date expiryDate;

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
    public String getJwtToken() {
        return jwtToken;
    }
    
    public void setJwtToken(String jwtToken) {
        this.jwtToken = jwtToken;
    }
    public String getRefreshToken() {
        return refreshToken;
    }
    
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    
    
    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Date getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(Date expiryDate) {
        this.expiryDate = expiryDate;
    }
    
 
    public Token(String value, User user, String jwtToken, String refreshToken, Date expiryDate) {
        setValue(value);
        setJwtToken(jwtToken);
        setRefreshToken(refreshToken);
        setUser(user);
        setExpiryDate(expiryDate);
    }

}