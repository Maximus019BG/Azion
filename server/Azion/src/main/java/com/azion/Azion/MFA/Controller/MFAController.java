package com.azion.Azion.MFA.Controller;

import com.azion.Azion.MFA.Service.MFAService;
import com.azion.Azion.Token.TokenRepo;
import com.azion.Azion.Token.TokenService;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import com.azion.Azion.User.Service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.Base64;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/mfa")
public class MFAController {
    
    private final MFAService mfaService;
    private final TokenService tokenService;
    
    @Autowired
    public MFAController(TokenService tokenService, MFAService mfaService) {
        this.tokenService = tokenService;
        this.mfaService = mfaService;
    }
   

    @Transactional
    @GetMapping("/qr-code")
    public ResponseEntity<?> getQrCodeUri(@RequestParam("accessToken") String accessToken) {
        log.info("GET /api/mfa/qr-code");
        if (accessToken == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Access token is required"));
        }
        try {
            String userEmail = tokenService.getUserFromToken(accessToken).getEmail();
            String qrCodeUri = mfaService.generateQRCodeUriForCurrentUser(userEmail);
            return ResponseEntity.ok().body(Map.of("qrCodeUri", qrCodeUri));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Could not generate QR code URI"));
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
    
    
}
