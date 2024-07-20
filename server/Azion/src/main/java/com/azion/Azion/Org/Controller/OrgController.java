package com.azion.Azion.Org.Controller;

import com.azion.Azion.Org.Model.Org;
import com.azion.Azion.Org.OrgProjection;
import com.azion.Azion.Org.Repository.OrgRepository;
import com.azion.Azion.Org.Service.OrgService;
import com.azion.Azion.Token.TokenService;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import com.azion.Azion.User.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;


@RestController
@RequestMapping("/api/org")
public class OrgController {
    
    private final OrgService orgService;
    private final OrgRepository orgRepository;
    private final UserService userService;
    private final UserRepository userRepository;
    private final TokenService tokenService;
    //Constructor
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
        
        
        Optional<Org> existingOrg = orgRepository.findOrgByOrgName(orgAddress);

        if (existingOrg.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("An organization with the same connection string already exists.");
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
    public ResponseEntity<?> getOrg(@RequestBody Map<String, Object> request) {
        String token = (String) request.get("token");
        User user = tokenService.getUserFromToken(token);
        Org org = orgService.findOrgByUser(user);
        if (org == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organization not found");
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