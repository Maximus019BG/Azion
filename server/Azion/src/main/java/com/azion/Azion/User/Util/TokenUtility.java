package com.azion.Azion.User.Util;

import com.azion.Azion.User.Model.Token;
import com.azion.Azion.User.Model.User;

import java.util.Date;
import java.util.UUID;

public class TokenUtility {

    // Token for 1 day
    public static Token generateToken(User user) {
        String value = UUID.randomUUID().toString();
        Date expiryDate = new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000);
        return new Token(value, user, expiryDate);
    }

    public static boolean validateToken(Token token) {
        return token.getExpiryDate().after(new Date());
    }

    // Refresh token for 2 days
    public static Token refreshToken(Token token) {
        token.setExpiryDate(new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000 * 2));
        return token;
    }
}