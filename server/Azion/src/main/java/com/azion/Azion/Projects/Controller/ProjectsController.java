package com.azion.Azion.Projects.Controller;

import com.azion.Azion.Org.Repository.OrgRepository;
import com.azion.Azion.Projects.Model.DTO.ProjectsDTO;
import com.azion.Azion.Projects.Model.Project;
import com.azion.Azion.Projects.Repository.ProjectsRepository;
import com.azion.Azion.Projects.Service.ProjectsService;
import com.azion.Azion.Projects.Type.ProjectPriority;
import com.azion.Azion.Token.TokenService;
import com.azion.Azion.User.Repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

import com.azion.Azion.Org.Model.Org;
import com.azion.Azion.User.Model.User;


@RestController
@RequestMapping("/api/projects")
public class ProjectsController {
    
    private final ProjectsRepository projectsRepository;
    private final ProjectsService projectsService;
    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final OrgRepository orgRepository;
    
    @Autowired
    public ProjectsController(ProjectsRepository projectsRepository, ProjectsService projectsService, UserRepository userRepository, TokenService tokenService, OrgRepository orgRepository) {
        this.projectsService = projectsService;
        this.projectsRepository = projectsRepository;
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.orgRepository = orgRepository;
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
       Org org = orgRepository.findById(user.getOrgid()).orElse(null);
       
       Project project = new Project();
       project.setName(title);
       project.setDescription(description);
       
       //Date validation
       DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd/yyyy");
       try {
           LocalDate date = LocalDate.parse(dueDate, formatter);
           if(!projectsService.dateIsValid(date, "MM/dd/yyyy", false)) {
               return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid date format or non-existent date");
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
       
       projectsService.saveProject(project);
       
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
    
    
    
    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable String id) {
        Optional<Project> project = projectsRepository.findById(id);
        return project.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Project createProject(@RequestBody Project project) {
        return projectsRepository.save(project);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable String id, @RequestBody Project updatedProject) {
        return projectsRepository.findById(id)
                .map(project -> {
                    project.setName(updatedProject.getName());
                    project.setDescription(updatedProject.getDescription());
                    project.setDate(updatedProject.getDate());
                    project.setUsers(updatedProject.getUsers());
                    project.setOrg(updatedProject.getOrg());
                    Project savedProject = projectsRepository.save(project);
                    return ResponseEntity.ok(savedProject);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable String id) {
        projectsRepository.findById(id)
                .ifPresent(projectsRepository::delete);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}