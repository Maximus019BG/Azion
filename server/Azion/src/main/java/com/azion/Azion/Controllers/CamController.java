package com.azion.Azion.Controllers;

import com.azion.Azion.Models.*;
import com.azion.Azion.Models.DTO.CamDTO;
import com.azion.Azion.Models.DTO.RoleDTO;
import com.azion.Azion.Repositories.*;
import com.azion.Azion.Services.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

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
    private final CamLogRepository camLogRepository;
    private final RoleRepository roleRepository;
    
    @Autowired
    public CamController(EmailService emailService, TokenService tokenService, UserRepository userRepository, MFAService mfaService, CamService camService, CamRepository camRepository, OrgRepository orgRepository, UserService userService, CamLogRepository camLogRepository, RoleRepository roleRepository) {
        this.emailService = emailService;
        this.tokenService = tokenService;
        this.userRepository = userRepository;
        this.mfaService = mfaService;
        this.camService = camService;
        this.camRepository = camRepository;
        this.orgRepository = orgRepository;
        this.userService = userService;
        this.camLogRepository = camLogRepository;
        this.roleRepository = roleRepository;
    }
    
    private RoleDTO convertToRoleDTO(Role role) {
        RoleDTO roleDTO = new RoleDTO();
        roleDTO.setId(role.getId());
        roleDTO.setName(role.getName());
        roleDTO.setRoleAccess(role.getRoleAccess());
        roleDTO.setColor(role.getColor());
        return roleDTO;
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
        //Person id from pic
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
            //Get what people can go in and what not
            if(Objects.equals(user.getRole().getRoleAccess(), camRepository.findByCamName(auth).get().getRole()) || Objects.equals(user.getRole().getRoleAccess(), userService.highestAccess())) {
                camService.addLog(auth, "User " + user.getName() + " got in");
                emailService.sendLoginEmail(user.getEmail(), "faceID login method", user.getName());
            } else {
                camService.addLog(auth, "User " + user.getName() + " tried to get in");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User does not have permission to enter");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return ResponseEntity.ok("Secured");
    }
    
    @Transactional
    @PostMapping("/add")
    public ResponseEntity<?> addLog(@RequestBody Map<String, Object> requestBody, @RequestHeader("authorization") String auth) {
        String camName = (String) requestBody.get("camName");
        String roleId = (String) requestBody.get("roleId");
        User user = tokenService.getUserFromToken(auth);
        
        if(user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
        }
        
        try {
            if(!userService.UserHasRight(user,"cameras:write")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User does not have permission to add a camera");
            }
            
            if(camRepository.findByCamName(camName).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Camera already exists");
            }
            
            //Camera
            Cam cam = new Cam();
            cam.setCamName(camName);
            cam.setRole(roleRepository.findById(roleId).get());
            cam.setOrgAddress(orgRepository.findById(user.getOrgid()).get().getOrgAddress());
            camRepository.save(cam);
            //Logs
            CamLog camLog = new CamLog();
            camLog.setCamID(camRepository.findByCamName(camName).get());
            camLog.addLog("Camera added");
            camLogRepository.save(camLog);
            cam.setLog(camLog);
            camRepository.save(cam);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred");
        }
        
        return ResponseEntity.ok("Cam added");
    }
    
    @Transactional
    @GetMapping("/logs/{camId}")
    public ResponseEntity<?> getLog(@RequestHeader("authorization") String auth, @PathVariable String camId) {
        User user = tokenService.getUserFromToken(auth);
        //User validation
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
        }
        if (!userService.UserHasRight(user,"cameras:read")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User does not have permission to view logs");
        }
        //Logs
        CamLog camLog = camRepository.findByCamName(camId).get().getLog();
        String logMessage = new String(camLog.getLog());
        Map<String, String> logMap = Map.of("logs", logMessage);
        return ResponseEntity.ok(logMap);
    }
    
    
    @Transactional
    @GetMapping("/all")
    public ResponseEntity<?> getAllCams(@RequestHeader("authorization") String auth) {
        User user = tokenService.getUserFromToken(auth);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
        }
        if (!userService.UserHasRight(user,"cameras:read")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User does not have permission to view logs");
        }
        Org org = orgRepository.findById(user.getOrgid()).orElse(null);
        if (org == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Organization not found");
        }
        List<CamDTO> camDTOs = camRepository.findByOrgAddress(org.getOrgAddress()).stream()
            .map(cam -> {
                CamDTO dto = new CamDTO();
                dto.setCamName(cam.getCamName());
                dto.setRole(convertToRoleDTO(cam.getRole()));
                dto.setOrgAddress(cam.getOrgAddress());
                dto.setId(cam.getId());
                return dto;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(camDTOs);
    }
}
