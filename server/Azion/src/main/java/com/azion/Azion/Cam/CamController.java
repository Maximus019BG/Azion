package com.azion.Azion.Cam;

import com.azion.Azion.MFA.Service.MFAService;
import com.azion.Azion.Token.TokenService;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import com.azion.Azion.User.Service.EmailService;
import jakarta.persistence.Table;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.azion.Azion.Cam.Cam;

import java.util.HashMap;
import java.util.Map;

import static com.azion.Azion.Token.TokenType.ACCESS_TOKEN;
import static com.azion.Azion.Token.TokenType.REFRESH_TOKEN;

@RestController
@CrossOrigin(origins = "AzionCam", allowedHeaders = "*")
@RequestMapping("/api/cam")
public class CamController {
    
    private final EmailService emailService;
    private final TokenService tokenService;
    private final UserRepository userRepository;
    private final MFAService mfaService;
    private final CamService camService;
    private final CamRepository camRepository;
    
    @Autowired
    public CamController(EmailService emailService, TokenService tokenService, UserRepository userRepository, MFAService mfaService, CamService camService, CamRepository camRepository) {
        this.emailService = emailService;
        this.tokenService = tokenService;
        this.userRepository = userRepository;
        this.mfaService = mfaService;
        this.camService = camService;
        this.camRepository = camRepository;
    }
    
    //Route for the camera
    @Transactional
    @PostMapping("/sec")
    public ResponseEntity<?> esp32Cam(@RequestBody Map<String, Object> requestBody, @RequestHeader("authorization") String auth) {
        Map<String, String> payload = (Map<String, String>) requestBody.get("payload");
        User user = null;
        if(!camService.camValid(auth)){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Camera not registered in Azion");
        }
        try {
            String base64Image = payload.get("image");
            String userEmail = mfaService.faceRecognition(base64Image);
            if (userEmail == null) {
                camService.addLog(auth, "Unidentified person tried to get in");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Face not recognized");
            }
            user = userRepository.findByEmail(userEmail);
            if (user == null) {
                camService.addLog(auth, "Unidentified person tried to get in");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User does not exist");
            }
        } catch (Exception e) {
            e.printStackTrace();
            camService.addLog(auth, "Camera Error");
            Cam cam = camRepository.findByCamName(auth).get();
            emailService.camErrorEmail(cam.getOrgAddress(), cam.getCamName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred");
        }
        
        try {
            camService.addLog(auth, "User " + user.getName() + "got in");
            emailService.sendLoginEmail(user.getEmail(), "faceID login method", user.getName());
        } catch (Exception e) {
            e.printStackTrace();
        }
        return ResponseEntity.ok("Secured");
    }
}
