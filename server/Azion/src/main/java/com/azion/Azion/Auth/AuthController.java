package com.azion.Azion.Auth;


import com.azion.Azion.MFA.Service.MFAService;
import com.azion.Azion.Projects.Service.ProjectsService;
import com.azion.Azion.Token.TokenRepo;
import com.azion.Azion.Token.TokenService;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import com.azion.Azion.User.Service.EmailService;
import com.azion.Azion.User.Service.UserService;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.ParsePosition;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static com.azion.Azion.Token.TokenType.ACCESS_TOKEN;
import static com.azion.Azion.Token.TokenType.REFRESH_TOKEN;

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
    private final ProjectsService projectsService;

    @Autowired
    public AuthController(TokenService tokenService, UserService userService, TokenRepo tokenRepo, UserRepository userRepository, MFAService mfaService, EmailService emailService, ProjectsService projectsService) {
        this.tokenService = tokenService;
        this.userService = userService;
        this.tokenRepo = tokenRepo;
        this.userRepository = userRepository;
        this.mfaService = mfaService;
        this.emailService = emailService;
        this.projectsService = projectsService;
    }

    @Transactional
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> request, @RequestHeader(value = "User-Agent") String UserAgent) {
        String name = (String) request.get("name");
        String email = (String) request.get("email");
        String password = (String) request.get("password");
        String role = (String) request.get("role");
        boolean mfaEnabled = (boolean) request.get("mfaEnabled");
        String bornAt = (String) request.get("age");

        //Date validation
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        try {
            LocalDate date = LocalDate.parse(bornAt, formatter);
            if (!projectsService.dateIsValid(date, true)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid date format or non-existent date.");
            }
        } catch (DateTimeParseException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid date format or non-existent date");
        }


        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        ParsePosition pos = new ParsePosition(0);

        User user = new User();
        user.setName(name);
        user.setAge(dateFormat.parse(bornAt, pos));
        user.setEmail(email);
        user.setPassword(password);
        user.setRole(role);
        user.setMfaEnabled(mfaEnabled);

        userRepository.save(user);

        String accessToken = tokenService.generateToken(ACCESS_TOKEN, user, System.getProperty("issuerName"), "https://azion.net/", UserAgent);
        String refreshToken = tokenService.generateToken(REFRESH_TOKEN, user, System.getProperty("issuerName"), "https://azion.net/", UserAgent);

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

        User user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User does not exist");
        }
        boolean passwordMatches = BCrypt.checkpw(password, user.getPassword());
        if (!passwordMatches) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
        }
        if (user.isMfaEnabled()) {
            if (OTP == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("MFA is enabled. Please provide OTP");
            } else if (!mfaService.checkMfaCredentials(user.getEmail(), OTP)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid OTP");
            } else if (mfaService.checkMfaCredentials(user.getEmail(), OTP)) {
                String accessToken = tokenService.generateToken(ACCESS_TOKEN, user, System.getProperty("issuerName"), "https://azion.net/", UserAgent);
                String refreshToken = tokenService.generateToken(REFRESH_TOKEN, user, System.getProperty("issuerName"), "https://azion.net/", UserAgent);

                Map<String, String> tokens = new HashMap<>();
                tokens.put("accessToken", accessToken);
                tokens.put("refreshToken", refreshToken);
                emailService.sendLoginEmail(user.getEmail(), "normal login method", user.getName());
                return ResponseEntity.ok(tokens);
            }

        }
        String accessToken = tokenService.generateToken(ACCESS_TOKEN, user, System.getProperty("issuerName"), "https://azion.net/", UserAgent);
        String refreshToken = tokenService.generateToken(REFRESH_TOKEN, user, System.getProperty("issuerName"), "https://azion.net/", UserAgent);

        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshToken);

        emailService.sendLoginEmail(user.getEmail(), "fast login method", user.getName());

        return ResponseEntity.ok(tokens);
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

        String accessToken = tokenService.generateToken(ACCESS_TOKEN, user, System.getProperty("issuerName"), "https://azion.net/", UserAgent);
        String refreshToken = tokenService.generateToken(REFRESH_TOKEN, user, System.getProperty("issuerName"), "https://azion.net/", UserAgent);

        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshToken);
        try {
            emailService.sendLoginEmail(user.getEmail(), "faceID login method", user.getName());
        } catch (Exception e) {
            e.printStackTrace();
        }
        return ResponseEntity.ok(tokens);
    }

    //Send the link to email
    @PutMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<Object, String> request) {
        String email = request.get("email");

        User user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User does not exist");
        }
        if (!user.isMfaEnabled()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("MFA is not enabled for this user");
        }

        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        userRepository.save(user);
        try {
            emailService.sendResetPasswordEmail(user.getEmail(), resetToken);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred");
        }

        return ResponseEntity.ok("Password reset link sent to email");
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
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token is out of date");
            }

        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }

    }
}