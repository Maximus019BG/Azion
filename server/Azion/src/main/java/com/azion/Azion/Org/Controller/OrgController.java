package com.azion.Azion.Org.Controller;

import com.azion.Azion.Org.Model.Org;
import com.azion.Azion.Org.OrgProjection;
import com.azion.Azion.Org.Repository.OrgRepository;
import com.azion.Azion.Org.Service.OrgService;
import com.azion.Azion.Org.Util.OrgUtility;
import com.azion.Azion.Token.TokenService;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import com.azion.Azion.User.Service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

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
    

    
    @PostMapping("/create")
    public ResponseEntity<?> createOrg(@RequestBody Map<String,Object> request) {
        String orgName = (String) request.get("orgName");
        String orgType = (String) request.get("orgType");
        String orgAddress = (String) request.get("orgAddress");
        String orgEmail = (String) request.get("orgEmail");
        String orgPhone = (String) request.get("orgPhone");
        String orgDescription = (String) request.get("orgDescription");
        
        
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
        return ResponseEntity.ok(org);
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
    
    @GetMapping("/decrypt")
    public ResponseEntity<?> decryptString(@RequestParam String encryptedString) {
        try {
            String decryptedString = OrgUtility.decrypt(encryptedString);
            return ResponseEntity.ok(decryptedString);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error decrypting string: " + e.getMessage());
        }
    }
    
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
    
    @PostMapping("/partOfOrg")
    @Transactional
    public ResponseEntity<?> getOrg(@RequestBody Map<String, Object> request) {
        String token = (String) request.get("accessToken");
        User user = tokenService.getUserFromToken(token);
        if (user == null) {
            log.error("User not found for token: " + token);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        if (user.getOrgid() == null) {
            log.error("Organization not found for user: " + user.getId());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organization not found.");
        }
        Org org = orgRepository.findById(user.getOrgid()).orElse(null);
        if (org == null) {
            log.error("Organization not found for ID: " + user.getOrgid());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organization not found.");
        }
        return ResponseEntity.ok(org);
    }
    
    @Transactional
    @GetMapping("/list/all")
    public ResponseEntity<?> listOrgs() {
        List<OrgProjection> orgs = orgRepository.findAllOrgs();
        return ResponseEntity.ok(orgs);
    }
    
    @GetMapping("/list/employees")
    public ResponseEntity<?> listEmployees() {
        Org org = orgRepository.findById("ce77d1227d6c43e5a72457de785e4a9b1715804886698").orElse(null);
        if(org == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organization not found.");
        }
        Set<User> users = org.getUsers();
        return ResponseEntity.ok(users);
    }
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