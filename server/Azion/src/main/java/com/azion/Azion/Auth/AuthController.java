package com.azion.Azion.Auth;


import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.azion.Azion.Token.TokenType;
import com.azion.Azion.User.Model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import com.azion.Azion.Token.TokenService;

import java.util.*;
import java.util.Date;
import java.util.UUID;

import static com.azion.Azion.Token.TokenType.ACCESS_TOKEN;
import static com.azion.Azion.Token.TokenType.REFRESH_TOKEN;




@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final TokenService tokenService;
    
    @Autowired
    public AuthController(TokenService tokenService) {
        this.tokenService = tokenService;
    }
        //TEST JWT
//    @GetMapping("/test")
//    public String test() {
//        String token1 = tokenService.generateToken(ACCESS_TOKEN, , System.getProperty("issuerName"), "https://azion.net/");
//
//        return token1;
//    }

    
   @GetMapping("/register/{email}")
   public String login(@PathVariable String email) {
        
        
        User user = new User();
        user.setName("Hardcoded Name");
        user.setAge(30);
        user.setEmail(email);
        user.setPassword("hardcodedPassword");
        user.setFaceID("hardcodedFaceID");
        user.setRole("hardcodedRole");
        user.setMfaEnabled(true);
//        user.setMfaSecret(mfaService.generateNewSecret());
        
        
        String token = tokenService.generateToken(ACCESS_TOKEN, user, System.getProperty("issuerName"), "https://azion.net/");
        
        return token;
    }

    @GetMapping("/login")
    public String register() {
        return "Register";
    }

    @GetMapping("/forgot-password")
    public String forgotPassword() {
        return "Forgot Password";
    }

    @GetMapping("/reset-password")
    public String resetPassword() {
        return "Reset Password";
    }

    @GetMapping("/change-password")
    public String changePassword() {
        return "Change Password";
    }

    @GetMapping("/logout")
    public String logout() {
        return "Logout";
    }
}
