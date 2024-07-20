package com.azion.Azion.MFA.Controller;

import com.azion.Azion.MFA.Service.MFAService;
import com.azion.Azion.Token.TokenRepo;
import com.azion.Azion.Token.TokenService;
import com.azion.Azion.User.Repository.UserRepository;
import com.azion.Azion.User.Service.UserService;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}