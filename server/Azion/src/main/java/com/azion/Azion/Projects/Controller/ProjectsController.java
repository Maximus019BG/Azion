package com.azion.Azion.Projects.Controller;

import com.azion.Azion.Exception.FileSize;
import com.azion.Azion.Org.Model.Org;
import com.azion.Azion.Org.Repository.OrgRepository;
import com.azion.Azion.Projects.Model.DTO.FileDTO;
import com.azion.Azion.Projects.Model.DTO.ProjectsDTO;
import com.azion.Azion.Projects.Model.Project;
import com.azion.Azion.Projects.Model.ProjectFiles;
import com.azion.Azion.Projects.Repository.FileRepo;
import com.azion.Azion.Projects.Repository.ProjectsRepository;
import com.azion.Azion.Projects.Service.ProjectsService;
import com.azion.Azion.Projects.Type.SubmitType;
import com.azion.Azion.Token.TokenService;
import com.azion.Azion.User.Model.DTO.UserDTO;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;


@Slf4j
@RestController
@RequestMapping("/api/projects")
public class ProjectsController extends FileSize {
    
    private final ProjectsRepository projectsRepository;
    private final ProjectsService projectsService;
    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final OrgRepository orgRepository;
    private final FileRepo fileRepo;
    
    @Autowired
    public ProjectsController(ProjectsRepository projectsRepository, ProjectsService projectsService, UserRepository userRepository, TokenService tokenService, OrgRepository orgRepository, FileRepo fileRepo) {
        this.projectsService = projectsService;
        this.projectsRepository = projectsRepository;
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.orgRepository = orgRepository;
        this.fileRepo = fileRepo;
    }
    
    @GetMapping
    public List<Project> getAllProjects() {
        return projectsRepository.findAll();
    }
    
    
    @Transactional
    @PostMapping("/create/new")
    public ResponseEntity<?> createTask(@RequestBody Map<Object, Object> request) {
        String accessToken = (String) request.get("accessToken");
        String title = (String) request.get("title");
        String description = (String) request.get("description");
        String dueDate = (String) request.get("dueDate");
        String priority = (String) request.get("priority");
        String status = (String) request.get("status");
        int progress = (int) request.get("progress");
        String source = (String) request.get("source");
        List<String> usersArr = (List<String>) request.get("users");
        
        User user = tokenService.getUserFromToken(accessToken);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid access token");
        }
        if (title == null || description == null || dueDate == null || priority == null || status == null || source == null || usersArr == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing required fields");
        }
        Org org = orgRepository.findById(user.getOrgid()).orElse(null);
        
        Project project = new Project();
        project.setName(title);
        project.setDescription(description);
        
        //Date validation
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd/yyyy");
        
        try {
            LocalDate date = LocalDate.parse(dueDate, formatter);
            if (!projectsService.dateIsValid(date, false)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid date format or non-existent date.");
            }
            project.setDate(date);
        } catch (DateTimeParseException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid date format or non-existent date");
        }
        
        //!This fixes error 500
        //!DO NOT REMOVE
        user.getEmail();
        project.setOrg(org);
        project.setPriority(priority);
        project.setStatus(status);
        project.setProgress(progress);
        project.setSource(source);
        project.setCreatedBy(user);
        
        Set<User> users = new HashSet<>();
        for (String email : usersArr) {
            User u = userRepository.findByEmail(email);
            if (u == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User with email " + email + " not found");
            }
            users.add(u);
        }
        project.setUsers(users);
        projectsRepository.save(project);
        
        return ResponseEntity.status(HttpStatus.CREATED).body("Project created successfully");
    }
    
    @Transactional
    @GetMapping("/list")
    public ResponseEntity<?> getProjects(@RequestHeader("authorization") String token) {
        User user = tokenService.getUserFromToken(token);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid access token");
        }
        Org org = orgRepository.findById(user.getOrgid()).orElse(null);
        if (org == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organization not found");
        }
        List<ProjectsDTO> projects = projectsService.getProjectByUser(user);
        
        return ResponseEntity.ok(projects);
    }
    
    
    @Transactional
    @GetMapping("/{id}")
    public ResponseEntity<?> getProjectById(@PathVariable String id, @RequestHeader("authorization") String token) {
        User user = tokenService.getUserFromToken(token);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid access token");
        }
        
        Optional<Project> project = projectsRepository.findById(id);
        ProjectsDTO projectDTO = new ProjectsDTO();
        if (project.isPresent()) {
            projectDTO.setId(project.get().getProjectID());
            projectDTO.setName(project.get().getName());
            projectDTO.setDescription(project.get().getDescription());
            projectDTO.setDate(project.get().getDate());
            projectDTO.setPriority(project.get().getPriority());
            projectDTO.setStatus(project.get().getStatus());
            projectDTO.setProgress(project.get().getProgress());
            projectDTO.setSource(project.get().getSource());
            projectDTO.setOrgId(project.get().getOrg().getOrgID());
            
            if (project.get().getCreatedBy() != null) {
                projectDTO.setCreatedBy(convertToUserDTO(project.get().getCreatedBy()));
            }
            
            if (project.get().getCreatedBy().getEmail().equals(user.getEmail()) || (user.getRoleLevel() >= 1 && user.getRoleLevel() <= 3) && user.getOrgid().equals(project.get().getOrg().getOrgID())) {
                projectDTO.setIsCreator(true);
                projectDTO.setUsers(projectsService.convertToUserDTOSet(project.get().getUsers()));
                if (project.get().getFiles() != null) {
                    projectDTO.setFiles(convertToFileDTO(project.get().getFiles()));
                }
            } else {
                projectDTO.setIsCreator(false);
                projectDTO.setUsers(null);
            }
            projectDTO.setDoneBy(projectsService.convertToUserDTOSet(project.get().getDoneBy()).stream().toList());
            return ResponseEntity.ok(projectDTO);
        } else {
            return ResponseEntity.notFound().build();
        }
        
    }
    
    //!Converting to Data Transfer Objects
    private UserDTO convertToUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setAge(user.getAge().toString());
        dto.setRole(user.getRole());
        dto.setOrgid(user.getOrgid());
        
        return dto;
    }
    
    private List<FileDTO> convertToFileDTO(List<ProjectFiles> files) {
        List<FileDTO> dtos = new ArrayList<>();
        
        for (ProjectFiles file : files) {
            FileDTO dto = new FileDTO();
            dto.setFileData(file.getFileData());
            dto.setLink(file.getLink());
            dto.setUser(convertToUserDTO(file.getUser()));
            dto.setSubmitType(file.getSubmitType());
            dto.setProjectID(file.getProjectID());
            dto.setFileName(file.getFileName());
            dto.setContentType(file.getContentType());
            dto.setDate(file.getDate().toString());
            dtos.add(dto);
        }
        
        return dtos;
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable String id) {
        projectsRepository.findById(id)
                .ifPresent(projectsRepository::delete);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    
    @Transactional
    @PutMapping(value = "/submit/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> submitProject(@PathVariable String id, @RequestHeader("authorization") String token, @RequestParam("file") MultipartFile file) {
        User user = tokenService.getUserFromToken(token);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid access token");
        }
        boolean fileSafe = projectsService.isFileSafe(file);
        if (!fileSafe) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("ProjectFiles could be harmful");
        }
        boolean typeLink = false;
        Optional<Project> project = projectsRepository.findById(id);
        if (project.isPresent()) {
            if (file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.OK).body("Marked as done");
            }
            try {
                ProjectFiles fileObj = new ProjectFiles();
                try {
                    byte[] fileContent = file.getBytes();
                    String content = new String(fileContent);
                    String name = file.getOriginalFilename();
                    if (name.equals("AzionLink.txt")) {
                        fileObj.setLink(content);
                        typeLink = true;
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
                }
                if (typeLink) {
                    fileObj.setSubmitType(SubmitType.LINK);
                } else if (!typeLink) {
                    fileObj.setSubmitType(SubmitType.FILE);
                    fileObj.setFileData(file.getBytes());
                    fileObj.setFileName(file.getOriginalFilename());
                    fileObj.setContentType(file.getContentType());
                }
                
                fileObj.setUser(user);
                fileObj.setDate(LocalDate.now());
                fileRepo.save(fileObj);
                
                Project proj = project.get();
                List<ProjectFiles> listProj = proj.getFiles();
                listProj.add(fileObj);
                proj.setFiles(listProj);
                
                Set<User> doneUsers = proj.getDoneBy();
                doneUsers.add(user);
                Set<User> allUsers = proj.getUsers();
                
                if (doneUsers.containsAll(allUsers)) {
                    log.debug("done");
                    proj.setProgress(100);
                    if (Objects.equals(proj.getStatus(), "Past")) {
                        proj.setStatus("Done Late");
                    } else {
                        proj.setStatus("Done");
                    }
                } else {
                    log.debug("not done");
                    List<User> notDoneUsers = new ArrayList<>();
                    for (User aUser : allUsers) {
                        if (!doneUsers.contains(aUser)) {
                            notDoneUsers.add(aUser);
                        }
                    }
                    int progress = 100 - (int) (((double) notDoneUsers.size() / allUsers.size()) * 100);
                    log.debug("not done " + notDoneUsers.size() + " all users " + allUsers.size());
                    log.debug("progress: " + progress);
                    proj.setProgress(progress);
                }
                projectsRepository.save(proj);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            
            return ResponseEntity.ok("Project submitted successfully");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Project not found");
    }
}
