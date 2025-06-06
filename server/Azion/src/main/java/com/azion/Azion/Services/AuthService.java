package com.azion.Azion.Services;

import com.azion.Azion.Models.User;
import com.azion.Azion.Repositories.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static com.azion.Azion.Enums.TokenType.ACCESS_TOKEN;
import static com.azion.Azion.Enums.TokenType.REFRESH_TOKEN;

@Service
@Slf4j
public class AuthService {
    
    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final MFAService mfaService;
    private final EmailService emailService;
    
    @Autowired
    public AuthService(UserRepository userRepository, TokenService tokenService, MFAService mfaService, EmailService emailService) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.mfaService = mfaService;
        this.emailService = emailService;
        
    }
    
    public boolean checkFaceIdEnabled(String email) {
        User user = userRepository.findByEmail(email);
        return user != null && user.getFaceID() != null;
    }
    
    public Map<String, String> loginTokenCreation( User user, String OTP, String UserAgent) {
        Map<String, String> tokens = new HashMap<>();
        if (user.isMfaEnabled()) {
            if(OTP == null) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "OTP required");
                return response;
            }
            if (!mfaService.checkMfaCredentials(user.getEmail(), OTP)) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Invalid OTP");
                return response;
            } else {
                String accessToken = tokenService.generateToken(ACCESS_TOKEN, user, System.getProperty("issuerName"),  UserAgent);
                String refreshToken = tokenService.generateToken(REFRESH_TOKEN, user, System.getProperty("issuerName"), UserAgent);
                tokens.put("accessToken", accessToken);
                tokens.put("refreshToken", refreshToken);
                emailService.sendLoginEmail(user.getEmail(), "normal login method (with OTP)", user.getName());
                return tokens;
            }
        }
        else{
            String accessToken = tokenService.generateToken(ACCESS_TOKEN, user, System.getProperty("issuerName"),  UserAgent);
            String refreshToken = tokenService.generateToken(REFRESH_TOKEN, user, System.getProperty("issuerName"), UserAgent);
            tokens.put("accessToken", accessToken);
            tokens.put("refreshToken", refreshToken);
            emailService.sendLoginEmail(user.getEmail(), "normal login method (without OTP)", user.getName());
            return tokens;
        }
    }
    
    public String resetTokenGeneration(User user) {
        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        userRepository.save(user);
        return resetToken;
    }
    
    public boolean userExists(String email) {
        return userRepository.findByEmail(email) != null;
    }
}
