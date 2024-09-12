package com.azion.Azion.Projects.Service;

import com.azion.Azion.Projects.Model.DTO.ProjectsDTO;
import com.azion.Azion.Projects.Model.Project;
import com.azion.Azion.Projects.Repository.ProjectsRepository;
import com.azion.Azion.User.Model.DTO.UserDTO;
import com.azion.Azion.User.Model.User;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ProjectsService {
    
    private final ProjectsRepository projectsRepository;
    
    public ProjectsService(ProjectsRepository projectsRepository) {
        this.projectsRepository = projectsRepository;
    }
    
    public Project saveProject(Project project) {
        return projectsRepository.save(project);
    }
    
    @Transactional
    public List<ProjectsDTO> getProjectByUser(User user) {
        List<Project> projects = projectsRepository.findByUsers(user);
        return projects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private ProjectsDTO convertToDTO(Project project) {
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
        
        Set<UserDTO> userDTOs = project.getUsers().stream()
                .map(this::convertToUserDTO)
                .collect(Collectors.toSet());
        dto.setUsers(userDTOs);
        
        return dto;
    }
    
    private UserDTO convertToUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setAge(user.getAge().toString());
        dto.setRole(user.getRole());
        dto.setOrgid(user.getOrgid());
        
        return dto;
    }
    
    public boolean dateIsValid(LocalDate date, boolean isPastDate) {
        if(date == null) {
            return true;
        }
        if(isPastDate) {
            log.debug("Date is in the past "+date+" "+LocalDate.now()+" "+date.isBefore(LocalDate.now()));
            return date.isBefore(LocalDate.now());
            
        }
        else if(!isPastDate) {
            log.debug("Date is in the future "+date+" "+LocalDate.now()+" "+date.isAfter(LocalDate.now())+" "+date.isBefore(LocalDate.now())+" "+date.isEqual(LocalDate.now()));
            return date.isAfter(LocalDate.now()) || date.isEqual(LocalDate.now());
        }
        return true;
    }
}
