package com.azion.Azion.User.Service;


import com.azion.Azion.MFA.Service.MFAService;
import com.azion.Azion.Tasks.Model.DTO.TasksDTO;
import com.azion.Azion.Tasks.Model.Task;
import com.azion.Azion.Tasks.Repository.ProjectsRepository;
import com.azion.Azion.Token.Token;
import com.azion.Azion.Token.TokenRepo;
import com.azion.Azion.Token.TokenService;
import com.azion.Azion.Token.TokenType;
import com.azion.Azion.User.Model.DTO.UserDTO;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;


@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final MFAService mfaService;
    private final TokenService tokenService;
    private final TokenRepo tokenRepo;
    private final ProjectsRepository projectsRepository;
    
    
    @Autowired
    public UserService(UserRepository userRepository, MFAService mfaService, TokenService tokenService, TokenRepo tokenRepo, ProjectsRepository projectsRepository) {
        this.userRepository = userRepository;
        this.mfaService = mfaService;
        this.tokenService = tokenService;
        this.tokenRepo = tokenRepo;
        this.projectsRepository = projectsRepository;
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
            userDTO.setRole(project.getCreatedBy().getRole());
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
    
    //Check if user has a right to do something
    ///<summary>IN ORDER:
    ///
    /// Calendar                0
    ///
    /// Settings                1
    ///
    /// Employees               2
    ///
    /// Roles                   3
    ///
    /// Create Tasks            4
    ///
    /// View Tasks              5
    ///
    /// Azion Cameras (Write)   6
    ///
    /// Azion Cameras (Read)    7
    /// </summary>
    public boolean UserHasRight(User user, int right) {
        return user.getRoleAccess().charAt(right) == '1';
    }
   
    //Get max access
    public String highestAccess(){
        return "11111111";
    }
    
    //Give new access to a row
    public void updateRoleAccess(String roleName, String roleAccess, String orgId){
        List<User> users = userRepository.findByRoleAndOrgid(roleName, orgId);
        for (User user : users) {
            user.setRoleAccess(roleAccess);
        }
    }
    
    public String getAccessByRoleName(String roleName, String orgId){
        User user = userRepository.findByRoleAndOrgid(roleName, orgId).get(0);
        return user.getRoleAccess();
    }
    
    //remove the OTP pass
    public void remove2FA(User user) {
        user.setMfaEnabled(false);
        user.newMFASecret();
        userRepository.save(user);
    }
}