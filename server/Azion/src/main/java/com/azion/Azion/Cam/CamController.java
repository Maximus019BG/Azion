package com.azion.Azion.Cam;

import com.azion.Azion.MFA.Service.MFAService;
import com.azion.Azion.Org.Model.Org;
import com.azion.Azion.Org.Repository.OrgRepository;
import com.azion.Azion.Token.TokenService;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import com.azion.Azion.User.Service.EmailService;
import com.azion.Azion.User.Service.UserService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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
    private final OrgRepository orgRepository;
    private final UserService userService;
    
    @Autowired
    public CamController(EmailService emailService, TokenService tokenService, UserRepository userRepository, MFAService mfaService, CamService camService, CamRepository camRepository, OrgRepository orgRepository, UserService userService) {
        this.emailService = emailService;
        this.tokenService = tokenService;
        this.userRepository = userRepository;
        this.mfaService = mfaService;
        this.camService = camService;
        this.camRepository = camRepository;
        this.orgRepository = orgRepository;
        this.userService = userService;
    }
    
    //Route for the camera
    @Transactional
    @PostMapping("/sec")
    public ResponseEntity<?> esp32Cam(@RequestBody Map<String, Object> requestBody, @RequestHeader("authorization") String auth) {
        Map<String, String> payload = (Map<String, String>) requestBody.get("payload");
        User user = null;
        if (!camService.camValid(auth)) {
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
    
    @PostMapping("/add")
    public ResponseEntity<?> addLog(@RequestBody Map<String, Object> requestBody, @RequestHeader("authorization") String auth) {
        String camName = (String) requestBody.get("camName");
        int roleLevel = (int) requestBody.get("roleLevel");
        User user = userRepository.findByEmail(auth);
        
        try {
            if(!userService.userSuperAdmin(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User does not have permission to add a camera");
            }
            Cam cam = new Cam();
            cam.setCamName(camName);
            cam.setRoleLevel(roleLevel);
            cam.setOrgAddress(orgRepository.findById(user.getOrgid()).get().getOrgAddress());
            camRepository.save(cam);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred");
        }
        
        return ResponseEntity.ok("Cam added");
    }
}
