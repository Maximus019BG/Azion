package com.azion.Azion.Controllers;

import com.azion.Azion.Models.DTO.RoleDTO;
import com.azion.Azion.Models.DTO.UserDTO;
import com.azion.Azion.Models.Role;
import com.azion.Azion.Models.Token;
import com.azion.Azion.Models.User;
import com.azion.Azion.Repositories.*;
import com.azion.Azion.Services.MFAService;
import com.azion.Azion.Services.TokenService;
import com.azion.Azion.Services.UserService;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Base64;
import java.util.Date;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/user")
public class UserController {
    
    private final UserService userService;
    private final UserRepository userRepository;
    private final MFAService mfaService;
    private final TokenRepo tokenRepo;
    private final TokenService tokenService;
    private final TasksRepository tasksRepository;
    private final RoleRepository roleRepository;
    private final OrgRepository orgRepository;
    
    @Autowired
    public UserController(UserService userService, UserRepository userRepository, MFAService mfaService, TokenRepo tokenRepo, TokenService tokenService, TasksRepository tasksRepository, RoleRepository roleRepository, OrgRepository orgRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.mfaService = mfaService;
        this.tokenRepo = tokenRepo;
        this.tokenService = tokenService;
        this.tasksRepository = tasksRepository;
        this.roleRepository = roleRepository;
        this.orgRepository = orgRepository;
    }
    
    private RoleDTO convertToRoleDTO(Role role) {
        RoleDTO roleDTO = new RoleDTO();
        roleDTO.setId(role.getId());
        roleDTO.setName(role.getName());
        roleDTO.setRoleAccess(role.getRoleAccess());
        roleDTO.setColor(role.getColor());
        return roleDTO;
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
    
    @Transactional
    @PostMapping("/data")
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
            userDTO.setAge(user.getAge().toString());
            if (user.getRoles() != null && !user.getRoles().isEmpty()) {
                if (orgRepository.findById(user.getOrgid()).orElse(null) != null && user.getOrgid() != null) {
                    Role role = roleRepository.findByUserAndOrg(user, orgRepository.findById(user.getOrgid()).orElse(null)).orElse(null);
                    if (role != null) {
                        userDTO.setAccess(role.getRoleAccess());
                        userDTO.setRole(convertToRoleDTO(role));
                    } else {
                        userDTO.setAccess(" ");
                    }
                }
            }
            userDTO.setOrgid(user.getOrgid());
            userDTO.setId(user.getId());
            userDTO.setProjects(userService.convertProjectsToDTO(user.getTasks()));
            userDTO.setMfaEnabled(user.isMfaEnabled());
            userDTO.setFaceIdEnabled(user.getFaceID() != null);
            userDTO.setUserType(user.getUserType());
            
            if (user.getProfilePicture() != null) {
                userDTO.setProfilePicture(Base64.getEncoder().encodeToString(user.getProfilePicture()));
            } else if (user.getProfilePicture() == null) {
                userDTO.setProfilePicture(null);
            }
            
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }
    
    @Transactional
    @DeleteMapping("/user/delete")
    public ResponseEntity<?> deleteUser(@RequestHeader("authorization") String authorization, @RequestHeader(value = "OTP", required = false) String otp) {
        String token = authorization;
        if (token == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Access token is missing.");
        }
        User user = tokenService.getUserFromToken(token);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found.");
        }
        
        if (user.isMfaEnabled()) {
            String OTP = otp;
            if (!mfaService.checkMfaCredentials(user.getEmail(), OTP)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("OTP does not match.");
            }
        }
        
        // Remove user from tasks and delete tasks created by the user
        tasksRepository.findByUsers(user).forEach(task -> task.getUsers().remove(user));
        tasksRepository.deleteByCreatedBy(user);
        
        user.setOrgid(null);
        user.setTasks(null);
        
        // Delete user and relationships
        tokenRepo.deleteBySubject(user);
        userRepository.delete(user);
        return ResponseEntity.ok("User deleted");
    }
    
    @Transactional
    @PutMapping("/update")
    public ResponseEntity<?> updateUser(@RequestParam Map<String, String> request, @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            String token = request.get("accessToken");
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
            
            String name = request.get("name");
            String email = request.get("email");
            String dateOfBirth = request.get("dateOfBirth");
            
            if (file != null) {
                userService.updateProfilePicture(user.getId(), userService.convertToBytes(file));
            }
            
            boolean dateOfBirthValid = false;
            if (dateOfBirth != null) {
                if (dateOfBirth.matches("\\d{4}-\\d{2}-\\d{2}")) {
                    dateOfBirthValid = true;
                }
            }
            if (!dateOfBirthValid && dateOfBirth != null) {
                String[] date = dateOfBirth.split("/");
                dateOfBirth = date[2] + "-" + date[1] + "-" + date[0];
            }
            
            if (name != null) {
                user.setName(name);
            }
            if (email != null) {
                user.setEmail(email);
            }
            if (dateOfBirth != null) {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                try {
                    Date dob = sdf.parse(dateOfBirth);
                    user.setAge(dob);
                } catch (ParseException e) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid date format.");
                }
            }
            
            userRepository.save(user);
            return ResponseEntity.ok("User updated successfully.");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing profile picture.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }
    
}