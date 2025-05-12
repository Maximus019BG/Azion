package com.azion.Azion.Controllers;

import com.azion.Azion.Enums.SubmitType;
import com.azion.Azion.Exceptions.FileSize;
import com.azion.Azion.Models.DTO.FileDTO;
import com.azion.Azion.Models.DTO.RoleDTO;
import com.azion.Azion.Models.DTO.TasksDTO;
import com.azion.Azion.Models.DTO.UserDTO;
import com.azion.Azion.Models.*;
import com.azion.Azion.Repositories.*;
import com.azion.Azion.Services.TasksService;
import com.azion.Azion.Services.TokenService;
import com.azion.Azion.Services.UserService;
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
@RequestMapping("/api/tasks")
public class TasksController extends FileSize {
    
    private static final int TASK_SIZE = 7;
    
    
    private final TasksRepository tasksRepository;
    private final TasksService tasksService;
    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final OrgRepository orgRepository;
    private final FileRepo fileRepo;
    private final UserService userService;
    private final RoleRepository roleRepository;
    
    @Autowired
    public TasksController(TasksRepository tasksRepository, TasksService tasksService, UserRepository userRepository, TokenService tokenService, OrgRepository orgRepository, FileRepo fileRepo, UserService userService, RoleRepository roleRepository) {
        this.tasksService = tasksService;
        this.tasksRepository = tasksRepository;
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.orgRepository = orgRepository;
        this.fileRepo = fileRepo;
        this.userService = userService;
        this.roleRepository = roleRepository;
    }
    
    private RoleDTO convertToRoleDTO(Role role){
        RoleDTO roleDTO = new RoleDTO();
        roleDTO.setId(role.getId());
        roleDTO.setName(role.getName());
        roleDTO.setRoleAccess(role.getRoleAccess());
        roleDTO.setColor(role.getColor());
        return roleDTO;
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
        
        if (title == null || description == null || dueDate == null || priority == null || status == null || usersArr == null) {
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
    public ResponseEntity<?> getTasks(@RequestHeader("authorization") String token) {
        User user = tokenService.getUserFromToken(token);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid access token");
        }
        Org org = orgRepository.findById(user.getOrgid()).orElse(null);
        if (org == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organization not found");
        }
        List<TasksDTO> tasks = tasksService.getProjectByUser(user, org);
        if (tasks.isEmpty()) {
            return ResponseEntity.ok("no tasks");
        }
        return ResponseEntity.ok(tasks);
    }
    
    
    @Transactional
    @GetMapping("/{id}")
    public ResponseEntity<?> getProjectById(@PathVariable String id, @RequestHeader("authorization") String token) {
        userService.userValid(token);
        User user = tokenService.getUserFromToken(token);
        
        Optional<Task> task = tasksRepository.findById(id);
        if(!task.get().getUsers().contains(user) || !userService.UserHasRight(user, "tasks:read")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing privileges");
        }
        
        TasksDTO taskDTO = new TasksDTO();
        if (task.isPresent()) {
            taskDTO.setId(task.get().getProjectID());
            taskDTO.setName(task.get().getName());
            taskDTO.setDescription(task.get().getDescription());
            taskDTO.setDate(task.get().getDate());
            taskDTO.setPriority(task.get().getPriority());
            taskDTO.setStatus(task.get().getStatus());
            taskDTO.setProgress(task.get().getProgress());
            taskDTO.setSource(task.get().getSource());
            taskDTO.setOrgId(task.get().getOrg().getOrgID());
            taskDTO.setUsers(tasksService.convertToUserDTOSet(task.get().getUsers()));
            
            if (task.get().getCreatedBy() != null) {
                taskDTO.setCreatedBy(convertToUserDTO(task.get().getCreatedBy()));
            }
            
            if (task.get().getCreatedBy().getEmail().equals(user.getEmail()) || (userService.UserHasRight(user,"tasks:write") && userService.UserHasRight(user," tasks:read"))) {
                taskDTO.setIsCreator(true);
                taskDTO.setUsers(tasksService.convertToUserDTOSet(task.get().getUsers()));
                if (task.get().getFiles() != null) {
                    taskDTO.setFiles(convertToFileDTO(task.get().getFiles()));
                }
            } else {
                taskDTO.setIsCreator(false);
                taskDTO.setUsers(null);
            }
            taskDTO.setDoneBy(tasksService.convertToUserDTOSet(task.get().getDoneBy()).stream().toList());
            return ResponseEntity.ok(taskDTO);
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
        Role role = roleRepository.findByUserAndOrg(user, orgRepository.findById(user.getOrgid()).orElse(null)).orElse(null);
        dto.setRole(convertToRoleDTO(role));
        dto.setOrgid(user.getOrgid());
        dto.setId(user.getId());
        
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
            dto.setTaskID(file.getTaskID());
            dto.setFileName(file.getFileName());
            dto.setContentType(file.getContentType());
            dto.setDate(file.getDate().toString());
            dtos.add(dto);
        }
        
        return dtos;
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable String id) {
        tasksRepository.findById(id)
                .ifPresent(tasksRepository::delete);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    
    //!Task submitting
    @Transactional
    @PutMapping(value = "/submit/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> submitTask(@PathVariable String id, @RequestHeader("authorization") String token, @RequestParam("file") MultipartFile file) {
        //*Basic check
        userService.userValid(token);
        
        User user = tokenService.getUserFromToken(token);
        
        boolean fileSafe = tasksService.isFileSafe(file);
        if (!fileSafe) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("TaskFiles could be harmful");
        }
        boolean typeLink = false;
        Optional<Task> task = tasksRepository.findById(id);
        if (task.isPresent()) {
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
                
                Task tsk = task.get();
                List<TaskFiles> listProj = tsk.getFiles();
                listProj.add(fileObj);
                tsk.setFiles(listProj);
                
                Set<User> doneUsers = tsk.getDoneBy();
                doneUsers.add(user);
                Set<User> allUsers = tsk.getUsers();
                tasksRepository.save(tsk);
                
                if (doneUsers.containsAll(allUsers)) {
                    log.debug("done");
                    tsk.setProgress(100);
                    if (Objects.equals(tsk.getStatus(), "Past")) {
                        tsk.setStatus("Done Late");
                    } else {
                        tsk.setStatus("Done");
                    }
                } else {
                    log.debug("not done");
                    tasksService.progressCalc(tsk);
                }
                tasksRepository.save(tsk);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            
            return ResponseEntity.ok("Task submitted successfully");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Task not found");
    }
    
    //List top tasks
    @Transactional
    @GetMapping("/top/{accessToken}")
    public ResponseEntity<?> topTasks(@PathVariable String accessToken) {
        if (accessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid access token");
        }
        User user = tokenService.getUserFromToken(accessToken);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
        }
        
        Org org = orgRepository.findById(user.getOrgid()).orElse(null);
        if (org == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organization not found");
        }
        
        List<Task> tasks = tasksRepository.findByUserAndOrg(user, org);
        
        if (tasks.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body("tasks not found");
        }
        
        int numberOfTasks = Math.min(tasks.size(), TASK_SIZE); //The number of task to be shown on the user
        
        return ResponseEntity.ok(tasksService.sortProjectsByDate(tasks).subList(0,numberOfTasks));
    }
    
    //Task return
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
