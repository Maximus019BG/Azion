package com.azion.Azion.Org.Controller;

import com.azion.Azion.Org.Model.DTO.OrgDTO;
import com.azion.Azion.Org.Model.Org;
import com.azion.Azion.Org.Repository.OrgRepository;
import com.azion.Azion.Org.Service.OrgService;
import com.azion.Azion.Org.Util.OrgUtility;
import com.azion.Azion.Projects.Model.DTO.ProjectsDTO;
import com.azion.Azion.Projects.Model.Project;
import com.azion.Azion.Token.Token;
import com.azion.Azion.Token.TokenService;
import com.azion.Azion.User.Model.DTO.UserDTO;
import com.azion.Azion.User.Model.User;
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
    public ResponseEntity<?> createOrg(@RequestBody Map<String, Object> request) {
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
        
        orgService.addUserToOrg(org, user);
        user.setRole("owner");
        user.setRoleLevel(1);
        userRepository.save(user);
        orgService.welcomeEmail(user.getEmail(), user.getName(), org.getOrgName());
        
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
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        } else if (user.getOrgid() != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User already part of an organization.");
        }
        orgService.addUserToOrg(org, user);
        return ResponseEntity.ok("User added to organization.");
    }
    
    @Transactional
    @PutMapping("/con/str/{conStr}")
    public ResponseEntity<?> addUserToOrg(@PathVariable String conStr, @RequestBody Map<String, Object> request) {
        String accessToken = (String) request.get("accessToken");
        String refreshToken = (String) request.get("refreshToken");
        //Token validation
        if(!tokenService.validateToken(accessToken)){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid access token.");
        }
        tokenService.sessionCheck(refreshToken,accessToken);
        
        User user = tokenService.getUserFromToken(accessToken);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        Org org = orgService.findOrgByConnectString(conStr);
        if(org == null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Invalid link");
        }
        orgService.addUserToOrg(org,user);
        return ResponseEntity.ok("User added to organization.");
    }
    
    @Transactional
    @GetMapping("/get/invites")
    public ResponseEntity<?> getInvites(@RequestHeader Map<String, String> headers) {
        String accessToken = (String) headers.get("authorization");
        User user = tokenService.getUserFromToken(accessToken);
        //Validation
        if(!tokenService.validateToken(accessToken)){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid access token.");
        }
        else if(!userService.userSuperAdmin(user)){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Access denied.");
        }
        Org org = orgService.findOrgByUser(user);
        if(org == null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        
        Map<String,String> result = new HashMap<>();
        result = orgService.listPeople(org); //Display related people
        return ResponseEntity.ok(result);
    }
    
    @Transactional
    @GetMapping("/conn/{AccessToken}")
    public ResponseEntity<?> connStringShow(@PathVariable String AccessToken) {
        User user = tokenService.getUserFromToken(AccessToken);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        Org org = orgRepository.findById(user.getOrgid()).orElse(null);
        
        if (org == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organization not found.");
        }
        String encryptedString = org.getOrgConnectString();
        String conSring = OrgUtility.decrypt(encryptedString);
        return ResponseEntity.ok(conSring);
    }
    
    @Transactional
    @GetMapping("/{AccessToken}")
    public ResponseEntity<?> orgData(@PathVariable String AccessToken) {
        User user = tokenService.getUserFromToken(AccessToken);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        Org org = orgRepository.findById(user.getOrgid()).orElse(null);
        
        if (org == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organization not found.");
        }
        Optional<OrgDTO> orgDTO = orgRepository.findByOrgAddress(org.getOrgAddress());
        
        return ResponseEntity.ok(orgDTO);
    }
    
    @Transactional
    @PutMapping("/update/{accessToken}")
    public ResponseEntity<?> updateOrg(@RequestBody Map<String, Object> request, @PathVariable String accessToken) {
        String orgName = (String) request.get("orgName");
        String orgType = (String) request.get("orgType");
        String orgAddress = (String) request.get("orgAddress");
        String orgEmail = (String) request.get("orgEmail");
        String orgPhone = (String) request.get("orgPhone");
        String orgDescription = (String) request.get("orgDescription");
        
        User user = tokenService.getUserFromToken(accessToken);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        if (user.getRoleLevel() != 1) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not admin");
        }
        Org org = orgRepository.findById(user.getOrgid()).orElse(null);
        if (org == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organization not found.");
        }
        
        org.setOrgName(orgName);
        org.setOrgType(orgType);
        org.setOrgAddress(orgAddress);
        org.setOrgEmail(orgEmail);
        org.setOrgPhone(orgPhone);
        org.setOrgDescription(orgDescription);
        orgRepository.save(org);
        
        return ResponseEntity.ok("Organization updated.");
    }
    
    @Transactional
    @PostMapping("/partOfOrg")
    public ResponseEntity<?> getOrg(@RequestBody Map<String, Object> request) {
        String token = (String) request.get("accessToken");
        if (token == null) {
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
                u.getProjects().forEach(project -> Hibernate.initialize(project.getUsers()));
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
        userDTO.setId(user.getId());
        userDTO.setName(user.getName());
        userDTO.setEmail(user.getEmail());
        userDTO.setAge(user.getAge().toString());
        userDTO.setRole(user.getRole());
        userDTO.setOrgid(user.getOrgid());
        userDTO.setRoleLevel(user.getRoleLevel());
        userDTO.setProfilePicture(Arrays.toString(user.getProfilePicture()));
        
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
    
    @Transactional
    @GetMapping("/list/roles/{accessToken}")
    public ResponseEntity<?> listRoles(@PathVariable String accessToken) {
        User user = tokenService.getUserFromToken(accessToken);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        Org org = orgRepository.findById(user.getOrgid()).orElse(null);
        if (org == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organization not found.");
        }
        Map<String, Integer> roles = orgService.getOrgRoles(org);
        return ResponseEntity.ok(roles);
    }
    
    @Transactional
    @PutMapping("/update/roles/{accessToken}")
    public ResponseEntity<?> updateRole(@RequestBody Map<String, Object> request, @PathVariable String accessToken) {
        User user = tokenService.getUserFromToken(accessToken);
        
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        if (user.getRoleLevel() > 3 || user.getRoleLevel() < 1) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User does not have permission to update roles.");
        }
        Map<String, Integer> roles = (Map<String, Integer>) request.get("roles");
        Map<String, String> users = (Map<String, String>) request.get("users");
        boolean isOwner = user.getRoleLevel() == 1;
        boolean triedToChangeOwner = false;
        
        if (roles == null || users == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Roles or users not found.");
        }
        
        for (Map.Entry<String, String> entry : users.entrySet()) {
            String email = entry.getKey();
            String role = entry.getValue();
            User u = userRepository.findByEmail(email);
            if (u == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User with email " + email + " not found.");
            }
            if (isOwner) {
                u.setRole(role);
            } else {
                if (!role.equals("owner")) {
                    u.setRole(role);
                }
            }
        }
        
        for (Map.Entry<String, Integer> entry : roles.entrySet()) {
            String role = entry.getKey();
            Integer roleLevel = entry.getValue();
            for (Map.Entry<String, String> userEntry : users.entrySet()) {
                String email = userEntry.getKey();
                String userRole = userEntry.getValue();
                User u = userRepository.findByEmail(email);
                if (u == null) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User with email " + email + " not found.");
                }
                if (isOwner) {
                    if (u.getRole().equals(role)) {
                        u.setRoleLevel(roleLevel);
                    }
                } else {
                    if (u.getRoleLevel() != 1 && u.getRole().equals(role) && roleLevel != 1) {
                        u.setRoleLevel(roleLevel);
                    } else if (u.getRoleLevel() != 1 && u.getRole().equals(role) && roleLevel == 1) {
                        triedToChangeOwner = true;
                    }
                }
            }
        }
        
        orgService.ensureOwnerHasLevelOne(user.getOrgid());
        
        if (triedToChangeOwner) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Roles and user updated. Except for the roleLevel 1");
        }
        return ResponseEntity.ok("Roles and users updated.");
    }
    
    @Transactional
    @DeleteMapping("/remove/employee/{eId}")
    public ResponseEntity<?> removeEmployee(@PathVariable String eId, @RequestHeader("authorization") String accessToken) {
        userService.userValid(accessToken);
        User user = tokenService.getUserFromToken(accessToken);
        if (!userService.userSuperAdmin(user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not super admin");
        }
        User employee = userRepository.findById(eId).orElse(null);
        if (employee == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Employee not found.");
        }
        orgService.removeEmployee(employee);
        return ResponseEntity.ok("Employee removed.");
    }
    
    @Transactional
    @PutMapping("/invite/{id}")
    public ResponseEntity<?> invite(@PathVariable String id, @RequestHeader("authorization") String accessToken) {
        userService.userValid(accessToken);
        User user = tokenService.getUserFromToken(accessToken);
        
        if (!userService.userSuperAdmin(user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not super admin");
        }
        orgService.addUserToOrg(orgService.findOrgByUser(user),userRepository.findById(id).get());
        
        return ResponseEntity.ok("User added");
    }
}