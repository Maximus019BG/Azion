package com.azion.Azion.Auth;


import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.azion.Azion.Token.Token;
import com.azion.Azion.Token.TokenRepo;
import com.azion.Azion.Token.TokenType;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import com.azion.Azion.User.Service.UserService;
import jakarta.transaction.Transactional;
import org.mindrot.jbcrypt.BCrypt;
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
    private final UserRepository userRepository;
    
    @Autowired
    public AuthController(TokenService tokenService, UserService userService, TokenRepo tokenRepo, UserRepository userRepository) {
        this.tokenService = tokenService;
        this.userService = userService;
        this.tokenRepo = tokenRepo;
        this.userRepository = userRepository;
    }
    
    @Transactional
    @GetMapping("/register/{email}")
    public ResponseEntity<?> login(@PathVariable String email) {
        User existingUser = userRepository.findByEmail(email);
        if (existingUser != null) {
            return ResponseEntity.badRequest().body("User already exists");
        }
        
        User user = new User();
        user.setName("Hardcoded Name");
        user.setAge(30);
        user.setEmail(email);
        user.setPassword("hardcodedPassword");
        user.setFaceID("hardcodedFaceID");
        user.setRole("hardcodedRole");
        user.setMfaEnabled(true);
        
        userRepository.save(user);
        
        String accessToken = tokenService.generateToken(ACCESS_TOKEN, user, System.getProperty("issuerName"), "https://azion.net/");
        String refreshToken = tokenService.generateToken(REFRESH_TOKEN, user, System.getProperty("issuerName"), "https://azion.net/");
        
        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshToken);
        
        return ResponseEntity.ok(tokens);
    }
    
    @Transactional
    @GetMapping("/login/{email}/{password}")
    public ResponseEntity<?> login(@PathVariable String email, @PathVariable String password) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User does not exist");
        }

        boolean passwordMatches = BCrypt.checkpw(password, user.getPassword());
        if (!passwordMatches) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
        }

        String accessToken = tokenService.generateToken(ACCESS_TOKEN, user, System.getProperty("issuerName"), "https://azion.net/");
        String refreshToken = tokenService.generateToken(REFRESH_TOKEN, user, System.getProperty("issuerName"), "https://azion.net/");

        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshToken);

        return ResponseEntity.ok(tokens);
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

    @GetMapping("/logout/{token}/{tokenR}")
    public String logout(@PathVariable String token, @PathVariable String tokenR) {
       if(tokenService.validateToken(token)){
           tokenService.deleteToken(token,tokenR);
           return "Logged out";
       }
       else {
           return "Invalid token";
       }
       
    }
}
