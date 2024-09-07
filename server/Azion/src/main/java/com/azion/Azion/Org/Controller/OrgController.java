package com.azion.Azion.Org.Controller;

import com.azion.Azion.Org.Model.Org;
import com.azion.Azion.Org.Model.DTO.OrgDTO;
import com.azion.Azion.Org.Repository.OrgRepository;
import com.azion.Azion.Org.Service.OrgService;
import com.azion.Azion.Org.Util.OrgUtility;
import com.azion.Azion.Projects.Model.DTO.ProjectsDTO;
import com.azion.Azion.Projects.Model.Project;
import com.azion.Azion.Token.TokenService;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Model.DTO.UserDTO;
import com.azion.Azion.User.Repository.UserRepository;
import com.azion.Azion.User.Service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/org")
public class OrgController {
    
    private final OrgService orgService;
    private final OrgRepository orgRepository;
    private final UserService userService;
    private final UserRepository userRepository;
    private final TokenService tokenService;

    @Autowired
    public OrgController(OrgService orgService, OrgRepository orgRepository, UserService userService, UserRepository userRepository, TokenService tokenService) {
        this.orgService = orgService;
        this.orgRepository = orgRepository;
        this.userService = userService;
        this.userRepository = userRepository;
        this.tokenService = tokenService;
    }
    

    @Transactional
    @PostMapping("/create")
    public ResponseEntity<?> createOrg(@RequestBody Map<String,Object> request) {
        String orgName = (String) request.get("orgName");
        String orgType = (String) request.get("orgType");
        String orgAddress = (String) request.get("orgAddress");
        String orgEmail = (String) request.get("orgEmail");
        String orgPhone = (String) request.get("orgPhone");
        String orgDescription = (String) request.get("orgDescription");
        String accessToken = (String) request.get("accessToken");
        
        Optional<Org> existingOrg = orgRepository.findOrgByOrgAddress(orgAddress);

        if (existingOrg.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("An organization with the same address already exists.");
        }

        Org org = new Org();
        org.setOrgName(orgName);
        org.setOrgType(orgType);
        org.setOrgAddress(orgAddress);
        org.setOrgEmail(orgEmail);
        org.setOrgPhone(orgPhone);
        org.setOrgDescription(orgDescription);
        org.setUsers(new HashSet<>());
        
        orgRepository.save(org);
        
        User user = tokenService.getUserFromToken(accessToken);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        
        //!Fixes no session error
        orgService.addUserToOrg(org, user);
        user.setRole("owner");
        userRepository.save(user);
        String encryptedString = org.getOrgConnectString();
        String conSring = OrgUtility.decrypt(encryptedString);
        
        return ResponseEntity.ok(conSring);
    }
    
    @PostMapping("/join")
    @Transactional
    public ResponseEntity<?> checkConnectString(@RequestBody Map<String, Object> request) {
        String connectionString = (String) request.get("connString");
        String accessToken = (String) request.get("accessToken");
        Org org = orgService.findOrgByConnectString(connectionString);
        if (org == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organization not found");
        }
        User user = tokenService.getUserFromToken(accessToken);
        if(user == null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        else if(user.getOrgid() != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User already part of an organization.");
        }
     
        orgService.addUserToOrg(org, user);
        
        return ResponseEntity.ok("User added to organization.");
    }
    //!DEBUG ONLY
//    @GetMapping("/decrypt")
//    public ResponseEntity<?> decryptString(@RequestParam String encryptedString) {
//        try {
//            String decryptedString = OrgUtility.decrypt(encryptedString);
//            return ResponseEntity.ok(decryptedString);
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error decrypting string: " + e.getMessage());
//        }
//    }
    
    @GetMapping("/invite/{email}")
    public ResponseEntity<?> inviteUserToOrg(@PathVariable String email) {
        
        User user = userRepository.findByEmail(email);
        
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        
        user.setOrgid("ce77d1227d6c43e5a72457de785e4a9b1715804886698");
        
        userRepository.save(user);
        
        return ResponseEntity.ok("User with email " + email + " invited.");
    }
    
    @Transactional
    @PostMapping("/partOfOrg")
    public ResponseEntity<?> getOrg(@RequestBody Map<String, Object> request) {
        String token = (String) request.get("accessToken");
        if(token == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token not found.");
        }
        User user = tokenService.getUserFromToken(token);
        if (user == null) {
            log.debug("User not found for token: " + token);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        if (user.getOrgid() == null) {
            log.debug("Organization not found for user: " + user.getId());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organization not found.");
        }
        Org org = orgRepository.findById(user.getOrgid()).orElse(null);
        if (org == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organization not found.");
        }
        Optional<OrgDTO> orgDTO = orgRepository.findByOrgAddress(org.getOrgAddress());
        
        
        return ResponseEntity.ok(orgDTO);
    }
    
    @Transactional
    @GetMapping("/list/all")
    public ResponseEntity<?> listOrgs() {
        List<OrgDTO> orgs = orgRepository.findAllOrgs();
        return ResponseEntity.ok(orgs);
    }
    
    
    @Transactional
    @GetMapping("/list/employees")
    public ResponseEntity<?> listEmployees(@RequestHeader("authorization") String token) {
        try {
            if (token == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Authorization token not found.");
            }
            
            User user = tokenService.getUserFromToken(token);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
            }
            
            Org org = orgRepository.findById(user.getOrgid()).orElse(null);
            if (org == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organization not found.");
            }
            Hibernate.initialize(org.getUsers());
            org.getUsers().forEach(u -> {
                Hibernate.initialize(u.getProjects());
                u.getProjects().forEach(project -> Hibernate.initialize(project.getUsers())); // Initialize Project.users
            });
            
            Set<UserDTO> userDTOs = org.getUsers().stream()
                    .map(this::convertToUserData)
                    .collect(Collectors.toSet());
            
            return ResponseEntity.ok(userDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }
    
    private UserDTO convertToUserData(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setName(user.getName());
        userDTO.setEmail(user.getEmail());
        userDTO.setAge(user.getAge());
        userDTO.setRole(user.getRole());
        userDTO.setOrgid(user.getOrgid());
        
        Hibernate.initialize(user.getProjects());
        Set<Project> projects = user.getProjects();
        Set<ProjectsDTO> projectDTOs = userService.convertProjectsToDTO(projects);
        userDTO.setProjects(projectDTOs);
        
        return userDTO;
    }

    
    @Transactional
    @GetMapping("/remove/{email}")
    public ResponseEntity<?> removeUserFromOrg(@PathVariable String email) {

        User user = userRepository.findByEmail(email);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }

        user.setOrgid(null);

        userRepository.save(user);

        return ResponseEntity.ok("User with email " + email + " removed.");
    }
    
    @GetMapping("/delete/org/{orgName}")
    public ResponseEntity<?> deleteOrg(@PathVariable String orgName) {
        Org org = orgRepository.findById(orgName).orElse(null);
        
        if (org == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organization not found.");
        }
        orgRepository.delete(org);
        return ResponseEntity.ok("Organization with id " + orgName + " deleted.");
    }
}