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

import java.text.ParseException;
import java.text.ParsePosition;
import java.text.SimpleDateFormat;
import java.time.format.DateTimeFormatter;
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
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> request) {
        String name = (String) request.get("name");
        String email = (String) request.get("email");
        String password = (String) request.get("password");
        String role = (String) request.get("role");
        boolean mfaEnabled = (boolean) request.get("mfaEnabled");
        String bornAt =(String) request.get("age");
        
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        ParsePosition pos = new ParsePosition(0);
        
        
        User user = new User();
        user.setName(name);
        user.setAge(dateFormat.parse(bornAt, pos));
        user.setEmail(email);
        user.setPassword(password);
        user.setFaceID("hardcodedFaceID");
        user.setRole(role);
        user.setMfaEnabled(mfaEnabled);
        
        userRepository.save(user);
        
        String accessToken = tokenService.generateToken(ACCESS_TOKEN, user, System.getProperty("issuerName"), "https://azion.net/");
        String refreshToken = tokenService.generateToken(REFRESH_TOKEN, user, System.getProperty("issuerName"), "https://azion.net/");
        
        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshToken);
        
        return ResponseEntity.ok(tokens);
    }
    
    @Transactional
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, Object> request) {
        String email = (String) request.get("email");
        String password = (String) request.get("password");
        
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User does not exist");
        }
        else if(tokenRepo.existsByUser(user)){
            return ResponseEntity.badRequest().body("User already logged in");
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

    @PostMapping("/logout/{token}/{tokenR}")
    public String logout(@PathVariable String token, @PathVariable String tokenR) {
        if(tokenService.validateToken(token) && tokenService.validateToken(tokenR)) {
            if (!tokenService.isAccessTokenOutOfDate(token) && !tokenService.isRefreshTokenOutOfDate(tokenR)) {
                    tokenService.deleteTokens(token, tokenR);
                    return "Logged out";
            }
            else {
                return "Tokens are out of date. Logged out.";
            }
            
        }
       else {
           return "Invalid token";
       }
       
    }
}
