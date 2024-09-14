package com.azion.Azion.User.Service;


import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;

import com.azion.Azion.MFA.Service.MFAService;
import com.azion.Azion.Projects.Model.DTO.ProjectsDTO;
import com.azion.Azion.Projects.Model.Project;
import com.azion.Azion.Token.Token;
import com.azion.Azion.Token.TokenService;
import com.azion.Azion.User.Model.DTO.UserDTO;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import com.azion.Azion.User.Returns.UserReturns;
import jakarta.persistence.NonUniqueResultException;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import static com.azion.Azion.Token.TokenType.ACCESS_TOKEN;


@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserReturns userReturns;
    private final MFAService mfaService;
    private final TokenService tokenService;
    
    
    @Autowired
    public UserService(UserRepository userRepository,UserReturns userReturns, MFAService mfaService, TokenService tokenService) {
        this.userRepository = userRepository;
        this.userReturns = userReturns;
        this.mfaService = mfaService;
        this.tokenService = tokenService;
    }
    
    public User updateProfilePicture(String id, byte[] profilePicture) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setProfilePicture(profilePicture);
            return userRepository.save(user);
        }
        return null;
    }
    
    public byte[] convertToBytes(MultipartFile file) throws IOException {
        return file.getBytes();
    }
    
    public ProjectsDTO convertToProjectsDTO(Project project) {
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
        return projects.stream()
                .map(this::convertToProjectsDTO)
                .collect(Collectors.toSet());
    }
    
}