package com.azion.Azion.Projects.Controller;

import com.azion.Azion.Projects.Model.Project;
import com.azion.Azion.Projects.Repository.ProjectsRepository;
import com.azion.Azion.Projects.Service.ProjectsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import com.azion.Azion.Org.Model.Org;
import com.azion.Azion.User.Model.User;


@RestController
@RequestMapping("/api/projects")
public class ProjectsController {
    
    private final ProjectsRepository projectsRepository;
    private final ProjectsService projectsService;
    
    @Autowired
    public ProjectsController(ProjectsRepository projectsRepository, ProjectsService projectsService) {
        this.projectsService = projectsService;
        this.projectsRepository = projectsRepository;
    }

    @GetMapping
    public List<Project> getAllProjects() {
        return projectsRepository.findAll();
    }
    
@GetMapping("/hardcoded")
public Project getHardcodedProject() {
    Set<User> users = new HashSet<>();
    Org org = new Org();
    Project hardcodedProject = new Project();
    hardcodedProject.setName("Hardcoded Project");
    hardcodedProject.setDescription("Hardcoded Description");
    hardcodedProject.setDate(LocalDate.now());
    hardcodedProject.setUsers(users);
    hardcodedProject.setOrg(org);
    
    return projectsService.saveProject(hardcodedProject);
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