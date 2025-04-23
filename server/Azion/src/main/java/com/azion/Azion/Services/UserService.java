package com.azion.Azion.Services;


import com.azion.Azion.Enums.TokenType;
import com.azion.Azion.Models.DTO.RoleDTO;
import com.azion.Azion.Models.DTO.TasksDTO;
import com.azion.Azion.Models.DTO.UserDTO;
import com.azion.Azion.Models.Role;
import com.azion.Azion.Models.Task;
import com.azion.Azion.Models.Token;
import com.azion.Azion.Models.User;
import com.azion.Azion.Repositories.RoleRepository;
import com.azion.Azion.Repositories.TasksRepository;
import com.azion.Azion.Repositories.TokenRepo;
import com.azion.Azion.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final MFAService mfaService;
    private final TokenService tokenService;
    private final TokenRepo tokenRepo;
    private final TasksRepository tasksRepository;
    private final RoleRepository roleRepository;
    
    
    @Autowired
    public UserService(UserRepository userRepository, MFAService mfaService, TokenService tokenService, TokenRepo tokenRepo, TasksRepository tasksRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.mfaService = mfaService;
        this.tokenService = tokenService;
        this.tokenRepo = tokenRepo;
        this.tasksRepository = tasksRepository;
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
    
    //Pfp update
    public User updateProfilePicture(String id, byte[] profilePicture) {
        Optional<User> optionalUser = userRepository.findById(id);
        //User exists
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setProfilePicture(profilePicture);
            return userRepository.save(user);
        }
        return null;
    }
    
    //MultipartFile to byte array
    public byte[] convertToBytes(MultipartFile file) throws IOException {
        return file.getBytes();
    }
    
    public TasksDTO convertToProjectsDTO(Task project) {
        //project to projectDTO
        TasksDTO dto = new TasksDTO();
        dto.setId(project.getProjectID());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setDate(project.getDate());
        dto.setPriority(project.getPriority());
        dto.setStatus(project.getStatus());
        dto.setProgress(project.getProgress());
        dto.setSource(project.getSource());
        dto.setOrgId(project.getOrg().getOrgID());
        
        //createdBy to userDTO
        if (project.getCreatedBy() != null) {
            UserDTO userDTO = new UserDTO();
            userDTO.setName(project.getCreatedBy().getName());
            userDTO.setEmail(project.getCreatedBy().getEmail());
            userDTO.setAge(project.getCreatedBy().getAge().toString());
            userDTO.setRole(convertToRoleDTO(project.getCreatedBy().getRole()));
            userDTO.setOrgid(project.getCreatedBy().getOrgid());
            dto.setCreatedBy(userDTO);
        }
        
        return dto;
    }
    
    public Set<TasksDTO> convertProjectsToDTO(Set<Task> projects) {
        //projects to projectDTOs set
        return projects.stream()
                .map(this::convertToProjectsDTO)
                .collect(Collectors.toSet());
    }
    
    //Validating user
    public void userValid(String token) {
        if (token == null || token.isEmpty()) {
            throw new RuntimeException("Invalid token");
        }
        Token tokeobj = tokenRepo.findByToken(token);
        if (tokeobj.getTokenType() != TokenType.ACCESS_TOKEN) {
            throw new RuntimeException("Not access token");
        }
        User user = tokenService.getUserFromToken(token);
        if (user == null) {
            throw new RuntimeException("Invalid token");
        }
    }
    
    /// <summary>
    /// IN ORDER:
    ///
    /// Calendar                calendar:write
    ///
    /// Settings                settings:write  settings:read
    ///
    /// Employees               employees:read
    ///
    /// Roles                   roles:write     roles:read
    ///
    /// Create Tasks            tasks:write
    ///
    /// View Tasks              tasks:read
    ///
    /// Azion Cameras (Write)   cameras:write
    ///
    /// Azion Cameras (Read)    cameras:read
    /// </summary>
    public boolean UserHasRight(User user, String right) {
        Role role = user.getRole();
        return role.getRoleAccess().contains(right.trim());
    }
    
    //Get max access
    public String highestAccess() {
        return "calendar:write settings:write settings:read employees:read roles:write roles:read tasks:write tasks:read cameras:write cameras:read";
    }
    
    public String lowestAccess() {
        return " ";
    }
    
    //Give new access to a row
    public void updateRoleAccess(String color, String roleName, String roleAccess, String orgId) {
        if(roleName.equals("owner")) {
            Role role = roleRepository.findByNameAndOrg(roleName, orgId).orElse(null);
            role.setColor(color);
            return;
        }
        Role role = roleRepository.findByNameAndOrg(roleName, orgId).orElse(null);
        role.setColor(color);
        role.setRoleAccess(roleAccess);
      
    }
    
    public boolean isUserOwner(User user) {
        Role role = user.getRole();
        String[] rights = {
                "calendar:write", "settings:write", "settings:read",
                "employees:read", "roles:write", "roles:read",
                "tasks:write", "tasks:read", "cameras:write", "cameras:read"
        };
        
        for (String right : rights) {
            boolean hasRight = UserHasRight(user, right);
            if (!hasRight) {
                return false;
            }
        }
        
        return role.getName().equals("owner");
    }
    
    public String getAccessByRoleName(String roleName, String orgId) {
        Role role = roleRepository.findByNameAndOrg(roleName, orgId).orElse(null);
        return role.getRoleAccess();
    }
    
    //remove the OTP pass
    public void remove2FA(User user) {
        user.setMfaEnabled(false);
        user.newMFASecret();
        userRepository.save(user);
    }
}