package com.azion.Azion.Tasks.Controller;

import com.azion.Azion.Exception.FileSize;
import com.azion.Azion.Org.Model.Org;
import com.azion.Azion.Org.Repository.OrgRepository;
import com.azion.Azion.Tasks.Enum.SubmitType;
import com.azion.Azion.Tasks.Model.DTO.FileDTO;
import com.azion.Azion.Tasks.Model.DTO.TasksDTO;
import com.azion.Azion.Tasks.Model.Task;
import com.azion.Azion.Tasks.Model.TaskFiles;
import com.azion.Azion.Tasks.Repository.FileRepo;
import com.azion.Azion.Tasks.Repository.TasksRepository;
import com.azion.Azion.Tasks.Service.TasksService;
import com.azion.Azion.Token.TokenService;
import com.azion.Azion.User.Model.DTO.RoleDTO;
import com.azion.Azion.User.Model.DTO.UserDTO;
import com.azion.Azion.User.Model.Role;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import com.azion.Azion.User.Service.UserService;
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
public class TasksController extends FileSize {
    
    private final TasksRepository tasksRepository;
    private final TasksService tasksService;
    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final OrgRepository orgRepository;
    private final FileRepo fileRepo;
    private final UserService userService;
    
    @Autowired
    public TasksController(TasksRepository tasksRepository, TasksService tasksService, UserRepository userRepository, TokenService tokenService, OrgRepository orgRepository, FileRepo fileRepo, UserService userService) {
        this.tasksService = tasksService;
        this.tasksRepository = tasksRepository;
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.orgRepository = orgRepository;
        this.fileRepo = fileRepo;
        this.userService = userService;
    }
    
    private RoleDTO convertToRoleDTO(Role role){
        RoleDTO roleDTO = new RoleDTO();
        roleDTO.setId(role.getId());
        roleDTO.setName(role.getName());
        roleDTO.setRoleAccess(role.getRoleAccess());
        roleDTO.setColor(role.getColor());
        return roleDTO;
    }
    
    @GetMapping
    public List<Task> getAllProjects() {
        return tasksRepository.findAll();
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
        
        if(accessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid access token");
        }
        userService.userValid(accessToken);//Token validation
        User user = tokenService.getUserFromToken(accessToken);
        
        //Admin check
        if (!userService.UserHasRight(user, "tasks:write")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing privileges");
        }
        
        if (title == null || description == null || dueDate == null || priority == null || status == null || source == null || usersArr == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing required fields");
        }
        Org org = orgRepository.findById(user.getOrgid()).orElse(null);
        
        Task task = new Task();
        task.setName(title);
        task.setDescription(description);
        
        //Date validation
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd/yyyy");
        
        try {
            LocalDate date = LocalDate.parse(dueDate, formatter);
            if (!tasksService.dateIsValid(date, false)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid date format or non-existent date.");
            }
            task.setDate(date);
        } catch (DateTimeParseException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid date format or non-existent date");
        }
        
        //!This fixes error 500
        //!DO NOT REMOVE
        user.getEmail();
        task.setOrg(org);
        task.setPriority(priority);
        task.setStatus(status);
        task.setProgress(progress);
        task.setSource(source);
        task.setCreatedBy(user);
        
        Set<User> users = new HashSet<>();
        for (String email : usersArr) {
            User u = userRepository.findByEmail(email);
            if (u == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User with email " + email + " not found");
            }
            users.add(u);
        }
        task.setUsers(users);
        tasksRepository.save(task);
        
        return ResponseEntity.status(HttpStatus.CREATED).body("Task created successfully");
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
        List<TasksDTO> projects = tasksService.getProjectByUser(user);
        if (projects.isEmpty()) {
            return ResponseEntity.ok("no projects");
        }
        return ResponseEntity.ok(projects);
    }
    
    
    @Transactional
    @GetMapping("/{id}")
    public ResponseEntity<?> getProjectById(@PathVariable String id, @RequestHeader("authorization") String token) {
        userService.userValid(token);
        User user = tokenService.getUserFromToken(token);
        
        Optional<Task> project = tasksRepository.findById(id);
        TasksDTO projectDTO = new TasksDTO();
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
            
            if (project.get().getCreatedBy().getEmail().equals(user.getEmail()) || (userService.UserHasRight(user,"tasks:write") && userService.UserHasRight(user," tasks:read"))) {
                projectDTO.setIsCreator(true);
                projectDTO.setUsers(tasksService.convertToUserDTOSet(project.get().getUsers()));
                if (project.get().getFiles() != null) {
                    projectDTO.setFiles(convertToFileDTO(project.get().getFiles()));
                }
            } else {
                projectDTO.setIsCreator(false);
                projectDTO.setUsers(null);
            }
            projectDTO.setDoneBy(tasksService.convertToUserDTOSet(project.get().getDoneBy()).stream().toList());
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
        dto.setRole(convertToRoleDTO(user.getRole()));
        dto.setOrgid(user.getOrgid());
        
        return dto;
    }
    
    private List<FileDTO> convertToFileDTO(List<TaskFiles> files) {
        List<FileDTO> dtos = new ArrayList<>();
        
        for (TaskFiles file : files) {
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
        tasksRepository.findById(id)
                .ifPresent(tasksRepository::delete);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    
    //!Task submitting
    @Transactional
    @PutMapping(value = "/submit/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> submitProject(@PathVariable String id, @RequestHeader("authorization") String token, @RequestParam("file") MultipartFile file) {
        //*Basic check
        userService.userValid(token);
        
        User user = tokenService.getUserFromToken(token);
        
        boolean fileSafe = tasksService.isFileSafe(file);
        if (!fileSafe) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("TaskFiles could be harmful");
        }
        boolean typeLink = false;
        Optional<Task> project = tasksRepository.findById(id);
        if (project.isPresent()) {
            if (file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.OK).body("Marked as done");
            }
            try {
                TaskFiles fileObj = new TaskFiles();
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
                
                Task proj = project.get();
                List<TaskFiles> listProj = proj.getFiles();
                listProj.add(fileObj);
                proj.setFiles(listProj);
                
                Set<User> doneUsers = proj.getDoneBy();
                doneUsers.add(user);
                Set<User> allUsers = proj.getUsers();
                tasksRepository.save(proj);
                
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
                    tasksService.progressCalc(proj);
                }
                tasksRepository.save(proj);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            
            return ResponseEntity.ok("Task submitted successfully");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Task not found");
    }
    
    //*List top projects
    @Transactional
    @GetMapping("/top/{accessToken}")
    public ResponseEntity<?> topProjects(@PathVariable String accessToken) {
        if (accessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid access token");
        }
        User user = tokenService.getUserFromToken(accessToken);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
        }
        List<Task> projects = tasksRepository.findByUsers(user);
        if (projects.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body("projects not found");
        }
        
        int numberOfTasks = Math.min(projects.size(), 3); //The number of task to be shown on the user
        
        return ResponseEntity.ok(tasksService.sortProjectsByDate(projects).subList(0,numberOfTasks));
    }
    
    //!Task return
    @Transactional
    @PutMapping("/return/task/{id}")
    public ResponseEntity<?> returnTask(@PathVariable String id, @RequestBody Map<Object, String> request, @RequestHeader("authorization") String token) {
        userService.userValid(token);
        String userREmail = request.get("email");
        
        User user = userRepository.findByEmail(userREmail);
        Task task = tasksRepository.findById(id).get();
        
        if (task == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Task not found");
        }
        tasksService.taskReturner(user, task);
        
        return ResponseEntity.ok("User task returned");
    }
    
    @Transactional
    @DeleteMapping("/delete/task/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable String id, @RequestHeader("authorization") String token) {
        userService.userValid(token);
        tasksService.deleteTask(id);
        return ResponseEntity.ok("task deleted successfully");
    }
}
