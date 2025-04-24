package com.azion.Azion.Controllers;

import com.azion.Azion.Models.User;
import com.azion.Azion.Repositories.UserRepository;
import com.azion.Azion.Services.MFAService;
import com.azion.Azion.Services.TokenService;
import com.azion.Azion.Services.UserService;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/mfa")
public class MFAController {
    
    private final MFAService mfaService;
    private final TokenService tokenService;
    private final UserService userService;
    private final UserRepository userRepository;
    
    @Autowired
    public MFAController(TokenService tokenService, MFAService mfaService, UserService userService, UserRepository userRepository) {
        this.tokenService = tokenService;
        this.mfaService = mfaService;
        this.userService = userService;
        this.userRepository = userRepository;
    }
    
    @Transactional
    @GetMapping("/qr-code")
    public ResponseEntity<?> getQrCodeUri(@RequestParam("accessToken") String accessToken) {
        log.debug("GET /api/mfa/qr-code");
        if (accessToken == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Access token is required");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        try {
            String userEmail = tokenService.getUserFromToken(accessToken).getEmail();
            String qrCodeUri = mfaService.generateQRCodeUriForCurrentUser(userEmail);
            Map<String, String> response = new HashMap<>();
            response.put("qrCodeUri", qrCodeUri);
            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Could not generate QR code URI");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @Transactional
    @GetMapping("/mfa-code")
    public ResponseEntity<?> getMfaCode(@RequestParam("accessToken") String accessToken) {
        log.debug("GET /api/mfa/mfa-code");
        if (accessToken == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Access token is required");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        try {
            String userEmail = tokenService.getUserFromToken(accessToken).getEmail();
            String mfaCode = mfaService.getManualEntryCode(userEmail);
            Map<String, String> response = new HashMap<>();
            response.put("mfaCode", mfaCode);
            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Could not generate MFA code");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @Transactional
    @PostMapping("/verify-qr")
    public ResponseEntity<?> verifyQrCode(@RequestBody Map<String, Object> request) {
        String OTP = (String) request.get("OTP");
        String accessToken = (String) request.get("accessToken");
        
        log.debug("POST /api/mfa/verify-qr");
        if (accessToken == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Access token is required");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        try {
            User user = tokenService.getUserFromToken(accessToken);
            if (!mfaService.checkMfaCredentials(user.getEmail(), OTP)) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid OTP");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            } else if (mfaService.checkMfaCredentials(user.getEmail(), OTP)) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "OTP verified");
                response.put("email", user.getEmail());
                user.setMfaEnabled(true);
                return ResponseEntity.ok().body(response);  
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid OTP");
                return ResponseEntity.badRequest().body(errorResponse);
            }
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Could not verify OTP");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @Transactional
    @PostMapping("/face-scan")
    public ResponseEntity<?> handleFaceRecognition(@RequestBody Map<String, Object> requestBody) {
        Map<String, String> request = (Map<String, String>) requestBody.get("request");
        Map<String, String> payload = (Map<String, String>) requestBody.get("payload");

        String token = request.get("accessToken");
        if (token == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Access token is required"));
        }
        User user = tokenService.getUserFromToken(token);
    
        if(user.getFaceID()!=null){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Face ID already exists");
        }
        try {
            String base64Image = payload.get("image");
            Map<String, String> response = new HashMap<>();
            String processedImage = mfaService.faceIdMFAScan(base64Image, token);
            response.put("image", processedImage);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing image");
        }
    }
    
    @Transactional
    @PutMapping("/check/mfa")
    public ResponseEntity<?> checkMFAEnabled(@RequestBody Map<Object,String> requestBody) {
        log.debug("PUT /api/mfa/check/mfa");
        String accessToken = requestBody.get("accessToken");
        if (accessToken == null) {
            String errorResponse = "Access token is required";
            return ResponseEntity.badRequest().body(errorResponse);
        }
        try {
            User user = tokenService.getUserFromToken(accessToken);
            Boolean response = user.isMfaEnabled();
            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            String errorResponse = "Could not check MFA status";
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @Transactional
    @PutMapping("/rem")
    public ResponseEntity<?> removeMFA(@RequestBody Map<Object,String> requestBody) {
        String accessToken = requestBody.get("accessToken");
        String OTP = requestBody.get("OTP");
        
        if (accessToken == null) {
            String errorResponse = "Access token is required";
            return ResponseEntity.badRequest().body(errorResponse);
        }
        try {
            User user = tokenService.getUserFromToken(accessToken);
            if (!mfaService.checkMfaCredentials(user.getEmail(), OTP)) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid OTP");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            } else if (mfaService.checkMfaCredentials(user.getEmail(), OTP)) {
                userService.remove2FA(user);
                return ResponseEntity.ok().body("2FA (OTP) removed");
            }
            else{
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid OTP");
            }
        } catch (Exception e) {
            String errorResponse = "Could not check MFA status";
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @Transactional
    @PutMapping("/rem/face")
    public ResponseEntity<?> removeFaceID(@RequestBody Map<Object,String> requestBody) {
        String accessToken = requestBody.get("accessToken");
        if (accessToken == null) {
            String errorResponse = "Access token is required";
            return ResponseEntity.badRequest().body(errorResponse);
        }
        try {
            User user = tokenService.getUserFromToken(accessToken);
            user.setFaceID(null);
            userRepository.save(user);
            return ResponseEntity.ok().body("Face ID removed");
        } catch (Exception e) {
            String errorResponse = "Could remove faceId";
            log.info(e.toString());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}