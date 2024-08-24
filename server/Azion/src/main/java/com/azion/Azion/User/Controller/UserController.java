package com.azion.Azion.User.Controller;


import com.azion.Azion.Token.Token;
import com.azion.Azion.Token.TokenRepo;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Model.UserData;
import com.azion.Azion.User.Repository.UserRepository;
import com.azion.Azion.User.Returns.UserReturns;
import com.azion.Azion.User.Service.UserService;
import com.azion.Azion.MFA.Service.MFAService;
import jakarta.transaction.Transactional;
import org.apache.coyote.Request;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.util.Map;
import java.util.stream.Collectors;


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
            
            //This fixes the 500 error DO NOT REMOVE!!!
            user.getName();
            
            UserData userData = new UserData();
            userData.setName(user.getName());
            userData.setEmail(user.getEmail());
            userData.setAge(user.getAge());
            userData.setRole(user.getRole());
            userData.setOrgid(user.getOrgid());
            userData.setProjects(user.getProjects().stream().collect(Collectors.toSet()));
            
            return ResponseEntity.ok(userData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }




}