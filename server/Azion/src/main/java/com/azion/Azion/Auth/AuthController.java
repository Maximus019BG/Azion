package com.azion.Azion.Auth;


import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.azion.Azion.Token.Token;
import com.azion.Azion.Token.TokenRepo;
import com.azion.Azion.Token.TokenType;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    private final UserService userService;
    private final TokenRepo tokenRepo;
    
    @Autowired
    public AuthController(TokenService tokenService, UserService userService, TokenRepo tokenRepo) {
        this.tokenService = tokenService;
        this.userService = userService;
        this.tokenRepo = tokenRepo;
    }

    
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
    
@GetMapping("/login/{email}/{password}")
public ResponseEntity<?> login(@PathVariable String email, @PathVariable String password) {
    try {
        String token = userService.loginUser(email, password);
        if (token != null) {
            return ResponseEntity.ok().body("Token: " + token);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred during login");
    }
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

    @GetMapping("/logout/{token}")
    public String logout(@PathVariable String token) {
       if(tokenService.validateToken(token)){
           tokenService.deleteToken(token);
           return "Logged out";
       }
       else {
           return "Invalid token";
       }
       
    }
}
