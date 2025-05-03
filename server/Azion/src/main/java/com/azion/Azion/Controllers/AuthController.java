package com.azion.Azion.Controllers;

import com.azion.Azion.Enums.UserType;
import com.azion.Azion.Models.User;
import com.azion.Azion.Repositories.TokenRepo;
import com.azion.Azion.Repositories.UserRepository;
import com.azion.Azion.Services.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.ParsePosition;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.Map;

import static com.azion.Azion.Enums.TokenType.ACCESS_TOKEN;
import static com.azion.Azion.Enums.TokenType.REFRESH_TOKEN;

@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final TokenService tokenService;
    private final UserService userService;
    private final TokenRepo tokenRepo;
    private final UserRepository userRepository;
    private final MFAService mfaService;
    private final EmailService emailService;
    private final TasksService tasksService;
    private final AuthService authService;
    
    @Autowired
    public AuthController(TokenService tokenService, UserService userService, TokenRepo tokenRepo, UserRepository userRepository, MFAService mfaService, EmailService emailService, TasksService tasksService, AuthService authService) {
        this.tokenService = tokenService;
        this.userService = userService;
        this.tokenRepo = tokenRepo;
        this.userRepository = userRepository;
        this.mfaService = mfaService;
        this.emailService = emailService;
        this.tasksService = tasksService;
        this.authService = authService;
    }
    
    //Google auth
    @Value("${google.client.id}")
    private String clientId;
    
    @Value("${google.client.secret}")
    private String clientSecret;
    
    @Value("${google.redirect.uri}")
    private String redirectUri;
    
    @Transactional
    @PostMapping("/google")
    public ResponseEntity<?> handleGoogleCallback(@RequestBody Map<String, String> requestBody, @RequestHeader(value = "User-Agent") String UserAgent) {
        String code = requestBody.get("code");
        
        if (code == null || code.isEmpty()) {
            return ResponseEntity.badRequest().body("Authorization code is missing.");
        }
        
        String tokenEndpoint = "https://oauth2.googleapis.com/token";
        Map<String, String> tokenRequest = new HashMap<>();
        tokenRequest.put("code", code);
        tokenRequest.put("client_id", clientId);
        tokenRequest.put("client_secret", clientSecret);
        tokenRequest.put("redirect_uri", redirectUri);
        tokenRequest.put("grant_type", "authorization_code");
        
        //Change auth code for token
        try {
            URL url = new URL(tokenEndpoint);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
            connection.setDoOutput(true);
            
            StringBuilder postData = new StringBuilder();
            for (Map.Entry<String, String> entry : tokenRequest.entrySet()) {
                if (postData.length() > 0) postData.append('&');
                postData.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8));
                postData.append('=');
                postData.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
            }
            
            try (OutputStream os = connection.getOutputStream()) {
                byte[] input = postData.toString().getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
                os.flush();
            }
            
            //Get response
            int responseCode = connection.getResponseCode();
            ObjectMapper objectMapper = new ObjectMapper();
            
            if (responseCode == 200) {
                //Extract token
                Map<String, Object> tokenResponse = objectMapper.readValue(connection.getInputStream(), Map.class);
                
                String accessToken = (String) tokenResponse.get("access_token");
                String refreshToken = (String) tokenResponse.get("refresh_token");
                
                if (accessToken != null) {
                    // Get user info
                    String userInfoEndpoint = "https://www.googleapis.com/oauth2/v2/userinfo";
                    URL userInfoUrl = new URL(userInfoEndpoint + "?access_token=" + accessToken);
                    HttpURLConnection userInfoConnection = (HttpURLConnection) userInfoUrl.openConnection();
                    userInfoConnection.setRequestMethod("GET");
                    
                    Map<String, Object> userInfo = objectMapper.readValue(userInfoConnection.getInputStream(), Map.class);
                    
                    //Get user information
                    String email = (String) userInfo.get("email");
                    String name = (String) userInfo.get("name");
                    String pictureUrl = (String) userInfo.get("picture");
                    
                    //Check if user already exists
                    User user = userRepository.findByEmail(email);
                    if (user == null) {
                        //Create new user
                        user = new User();
                        user.setEmail(email);
                        user.setName(name);
                        user.setPassword(null); //Google users don't have a password
                        user.setMfaEnabled(false);
                        user.setRoles(null);
                        user.setUserType(Enum.valueOf(UserType.class, "WORKER"));
                        
                        byte[] profilePicture = null;
                        if (pictureUrl != null) {
                            try (InputStream in = new URL(pictureUrl).openStream();
                                 ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                                byte[] buffer = new byte[1024];
                                int n;
                                while ((n = in.read(buffer)) != -1) {
                                    out.write(buffer, 0, n);
                                }
                                profilePicture = out.toByteArray();
                            } catch (IOException e) {
                                log.warn("Failed to download profile picture", e);
                            }
                        }
                        user.setProfilePicture(profilePicture);
                        
                        String birthdate = (String) userInfo.get("birthdate");
                        if (birthdate != null) {
                            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
                            try {
                                user.setAge(dateFormat.parse(birthdate));
                            } catch (Exception e) {
                                log.warn("Failed to parse birthdate", e);
                            }
                        } else {
                            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
                            try {
                                user.setAge(dateFormat.parse("2000-01-01"));
                            } catch (Exception e) {
                                log.warn("Failed to parse birthdate", e);
                            }
                        }
                        
                        userRepository.save(user);
                    }
                    
                    //Generate tokens
                    String azionAccessToken = tokenService.generateToken(ACCESS_TOKEN, user, System.getProperty("issuerName"), UserAgent);
                    String azionRefreshToken = tokenService.generateToken(REFRESH_TOKEN, user, System.getProperty("issuerName"), UserAgent);
                    
                    //Create response
                    Map<String, Object> response = new HashMap<>();
                    response.put("accessToken", azionAccessToken);
                    response.put("refreshToken", azionRefreshToken);
                    
                    return ResponseEntity.ok(response);
                } else {
                    return ResponseEntity.status(500).body("Failed to retrieve access token.");
                }
            } else {
                Map<String, Object> errorResponse = objectMapper.readValue(connection.getErrorStream(), Map.class);
                return ResponseEntity.status(responseCode).body("Error: " + errorResponse.get("error"));
            }
            
        } catch (IOException ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body("Error during token exchange: " + ex.getMessage());
        }
    }
    
    
    @Transactional
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> request, @RequestHeader(value = "User-Agent") String UserAgent) {
        String name = (String) request.get("name");
        String email = (String) request.get("email");
        String password = (String) request.get("password");
        String bornAt = (String) request.get("age");
        boolean isWorker = (boolean) request.get("isWorker");
        boolean isOrgOwner = (boolean) request.get("isOrgOwner"); // Used to check if the user is just client
        
        if (isOrgOwner) {
            isWorker = true;
        }
        
        //Date validation
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        try {
            LocalDate date = LocalDate.parse(bornAt, formatter);
            if (!tasksService.dateIsValid(date, true)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid date format or non-existent date.");
            }
        } catch (DateTimeParseException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid date format or non-existent date");
        }
        
        if (authService.userExists(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User already exists");
        }
        
        
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        ParsePosition pos = new ParsePosition(0);
        
        User user = new User();
        user.setName(name);
        user.setAge(dateFormat.parse(bornAt, pos));
        user.setEmail(email);
        user.setPassword(password);
        user.setMfaEnabled(false);
        user.setRoles(null);
        user.setUserType(Enum.valueOf(UserType.class, isWorker ? "WORKER" : "CLIENT"));
        
        userRepository.save(user);
        
        String accessToken = tokenService.generateToken(ACCESS_TOKEN, user, System.getProperty("issuerName"), UserAgent);
        String refreshToken = tokenService.generateToken(REFRESH_TOKEN, user, System.getProperty("issuerName"), UserAgent);
        
        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshToken);
        
        log.debug("User registered");
        emailService.welcomeEmail(user.getEmail(), user.getName());
        
        return ResponseEntity.ok(tokens);
    }
    
    
    @Transactional
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, Object> request, @RequestHeader(value = "User-Agent") String UserAgent) {
        log.debug("Login attempt");
        String email = (String) request.get("email");
        String password = (String) request.get("password");
        String OTP = (String) request.get("OTP");
        
        //User validation
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User does not exist");
        }
        
        //Password validation
        boolean passwordMatches = BCrypt.checkpw(password, user.getPassword());
        if (!passwordMatches) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
        }
        
        //Token creation and validation
        Map<String, String> tokens = authService.loginTokenCreation(user, OTP, UserAgent);
        if (tokens.containsKey("message")) {
            if (tokens.get("message").equals("OTP required")) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT).body(tokens.get("message"));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(tokens.get("message"));
        }
        return ResponseEntity.ok(tokens); //Return the tokens
    }
    
    //Login with face recognition
    @Transactional
    @PostMapping("/fast-login")
    public ResponseEntity<?> fastLogin(@RequestBody Map<String, Object> requestBody, @RequestHeader(value = "User-Agent") String UserAgent) {
        log.debug("Fast login attempt");
        Map<String, String> payload = (Map<String, String>) requestBody.get("payload");
        User user = null;
        try {
            String base64Image = payload.get("image");
            String userEmail = mfaService.faceRecognition(base64Image);
            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Face not recognized");
            }
            user = userRepository.findByEmail(userEmail);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User does not exist");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred");
        }
        
        String accessToken = tokenService.generateToken(ACCESS_TOKEN, user, System.getProperty("issuerName"), UserAgent);
        String refreshToken = tokenService.generateToken(REFRESH_TOKEN, user, System.getProperty("issuerName"), UserAgent);
        
        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshToken);
        try {
            emailService.sendLoginEmail(user.getEmail(), "faceID login method", user.getName());
        } catch (Exception e) {
            e.printStackTrace();
        }
        return ResponseEntity.ok(tokens); //Return the tokens
    }
    
    //Send the link to email
    @PutMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<Object, String> request) {
        String email = request.get("email");
        
        //User validation
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User does not exist");
        }
        if (!user.isMfaEnabled()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("MFA is not enabled for this user");
        }
        
        //Reset token generation
        String resetToken = authService.resetTokenGeneration(user);
        //Send the email
        try {
            emailService.sendResetPasswordEmail(user.getEmail(), resetToken);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred");
        }
        
        return ResponseEntity.ok("Password reset link sent to email"); //Return msg
    }
    
    //Reset the password
    @PutMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<Object, String> request) {
        String resetToken = request.get("token");
        String newPassword = request.get("password");
        
        User user = userRepository.findByResetToken(resetToken);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid reset token");
        }
        
        user.setPassword(newPassword);
        user.setResetToken(null);
        userRepository.save(user);
        
        return ResponseEntity.ok("Password reset successfully");
    }
    
    @Transactional
    @PostMapping("/logout/{token}/{tokenR}")
    public ResponseEntity<?> logout(@PathVariable String token, @PathVariable String tokenR) {
        if (tokenService.validateToken(token) && tokenService.validateToken(tokenR)) {
            if (!tokenService.isAccessTokenOutOfDate(token) && !tokenService.isRefreshTokenOutOfDate(tokenR)) {
                tokenService.deleteTokens(token, tokenR);
                return ResponseEntity.ok("Logged out");
            } else {
                tokenService.deleteTokens(token, tokenR);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token is out of date"); //Return msg
            }
            
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token"); //Return msg
        }
        
    }
}