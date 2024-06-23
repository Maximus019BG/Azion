package com.azion.Azion.Auth;


import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.azion.Azion.Token.TokenType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.azion.Azion.Token.TokenService;

import java.util.*;
import java.util.Date;
import java.util.UUID;

import static com.azion.Azion.Token.TokenType.ACCESS_TOKEN;
import static com.azion.Azion.Token.TokenType.REFRESH_TOKEN;



@Controller
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
        //TEST JWT
    @RequestMapping("/test")
    public String test() {
        TokenService tokenService = new TokenService();
        String token = tokenService.generateToken(ACCESS_TOKEN, "testche@mail.bg");
        
        return token;
    }

    
    @RequestMapping("/login")
    public String login() {
        return "Login";
    }

    @RequestMapping("/register")
    public String register() {
        return "Register";
    }

    @RequestMapping("/forgot-password")
    public String forgotPassword() {
        return "Forgot Password";
    }

    @RequestMapping("/reset-password")
    public String resetPassword() {
        return "Reset Password";
    }

    @RequestMapping("/change-password")
    public String changePassword() {
        return "Change Password";
    }

    @RequestMapping("/logout")
    public String logout() {
        return "Logout";
    }
}
