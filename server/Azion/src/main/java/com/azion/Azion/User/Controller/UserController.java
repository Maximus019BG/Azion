package com.azion.Azion.User.Controller;

import com.azion.Azion.Token.Token;
import com.azion.Azion.Token.TokenRepo;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Model.DTO.UserDTO;
import com.azion.Azion.User.Repository.UserRepository;
import com.azion.Azion.User.Service.UserService;
import com.azion.Azion.MFA.Service.MFAService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {
    
    private final UserService userService;
    private final UserRepository userRepository;
    private final MFAService mfaService;
    private final TokenRepo tokenRepo;
    
    @Autowired
    public UserController(UserService userService, UserRepository userRepository, MFAService mfaService, TokenRepo tokenRepo) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.mfaService = mfaService;
        this.tokenRepo = tokenRepo;
    }
    
    @GetMapping("/delete/{email}")
    public ResponseEntity<?> removeUserFromOrg(@PathVariable String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        userRepository.delete(user);
        return ResponseEntity.ok("User with email " + email + " deleted");
    }
    
    @PostMapping("/data")
    @Transactional
    public ResponseEntity<?> getUserData(@RequestBody Map<String, Object> request) {
        try {
            String token = (String) request.get("accessToken");
            if (token == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Access token is missing.");
            }
            
            Token tokenObj = tokenRepo.findByToken(token);
            if (tokenObj == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token not found.");
            }
            
            User user = tokenObj.getSubject();
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No user associated with this token.");
            }
            
            UserDTO userDTO = new UserDTO();
            userDTO.setName(user.getName());
            userDTO.setEmail(user.getEmail());
            userDTO.setAge(user.getAge());
            userDTO.setRole(user.getRole());
            userDTO.setOrgid(user.getOrgid());
            
            userDTO.setProjects(userService.convertProjectsToDTO(user.getProjects()));
            
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }
}
