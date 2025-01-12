package com.azion.Azion.User.Service;


import com.azion.Azion.MFA.Service.MFAService;
import com.azion.Azion.Projects.Model.DTO.ProjectsDTO;
import com.azion.Azion.Projects.Model.Project;
import com.azion.Azion.Projects.Repository.ProjectsRepository;
import com.azion.Azion.Token.Token;
import com.azion.Azion.Token.TokenRepo;
import com.azion.Azion.Token.TokenService;
import com.azion.Azion.Token.TokenType;
import com.azion.Azion.User.Model.DTO.UserDTO;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Objects;
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
    
    public ProjectsDTO convertToProjectsDTO(Project project) {
        //project to projectDTO
        ProjectsDTO dto = new ProjectsDTO();
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
    
    public Set<ProjectsDTO> convertProjectsToDTO(Set<Project> projects) {
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
    
    //User admin validation
    @Transactional
    public boolean userAdmin(User user) {
        String role = user.getRole();
        int roleLevel = user.getRoleLevel();
        return (roleLevel > 0 && roleLevel < 4) || (Objects.equals(role.toLowerCase(), "admin") || Objects.equals(role.toLowerCase(), "boss"));
    }
    
    //User superAdmin validation
    @Transactional
    public boolean userSuperAdmin(User user) {
        int roleLevel = user.getRoleLevel();
        return (roleLevel > 0 && roleLevel <= 2);
    }
    
    //remove the OTP pass
    public void remove2FA(User user) {
        user.setMfaEnabled(false);
        user.newMFASecret();
        userRepository.save(user);
    }
}