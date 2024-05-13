package com.azion.Azion.User.Model;

import java.util.Date;

public class Token {
    private String value;
    private User user;
    private Date expiryDate;

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
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

    public Token(String value, User user, Date expiryDate) {
        setValue(value);
        setUser(user);
        setExpiryDate(expiryDate);
    }
}