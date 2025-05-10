package com.azion.Azion.Services;

import com.azion.Azion.Models.*;
import com.azion.Azion.Models.DTO.RoleDTO;
import com.azion.Azion.Models.DTO.TasksDTO;
import com.azion.Azion.Models.DTO.UserDTO;
import com.azion.Azion.Repositories.FileRepo;
import com.azion.Azion.Repositories.OrgRepository;
import com.azion.Azion.Repositories.RoleRepository;
import com.azion.Azion.Repositories.TasksRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class TasksService {
    
    //VirusTotal config
    private static final String API_KEY = System.getProperty("virusTotalApiKey");
    private static final String VIRUSTOTAL_URL = "https://www.virustotal.com/api/v3/files";
    
    private final TasksRepository tasksRepository;
    private final FileRepo fileRepo;
    private final RoleRepository roleRepository;
    private final OrgRepository orgRepository;
    
    public TasksService(TasksRepository tasksRepository, FileRepo fileRepo, RoleRepository roleRepository, OrgRepository orgRepository) {
        this.tasksRepository = tasksRepository;
        this.fileRepo = fileRepo;
        this.roleRepository = roleRepository;
        this.orgRepository = orgRepository;
    }
    
    private RoleDTO convertToRoleDTO(Role role){
        RoleDTO roleDTO = new RoleDTO();
        roleDTO.setId(role.getId());
        roleDTO.setName(role.getName());
        roleDTO.setRoleAccess(role.getRoleAccess());
        roleDTO.setColor(role.getColor());
        return roleDTO;
    }
    
    //*Converter (file to MLTFile)
    public static File convertMultipartFileToFile(MultipartFile multipartFile) throws IOException {
        File file = new File(multipartFile.getOriginalFilename());
        try (FileOutputStream fos = new FileOutputStream(file)) {
            fos.write(multipartFile.getBytes());
        }
        return file;
    }
    
    
    //!Proj to Data Transfer Object
    private TasksDTO convertToDTO(Task project) {
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
        
        if (project.getCreatedBy() != null) {
            UserDTO userDTO = new UserDTO();
            userDTO.setName(project.getCreatedBy().getName());
            userDTO.setEmail(project.getCreatedBy().getEmail());
            userDTO.setAge(project.getCreatedBy().getAge().toString());
            User user = project.getCreatedBy();
            Role role = roleRepository.findByUserAndOrg(user, orgRepository.findById(user.getOrgid()).orElse(null)).orElse(null);
            userDTO.setRole(convertToRoleDTO(role));
            userDTO.setOrgid(project.getCreatedBy().getOrgid());
            dto.setCreatedBy(userDTO);
        }
        
        Set<UserDTO> userDTOs = project.getUsers().stream()
                .map(this::convertToUserDTO)
                .collect(Collectors.toSet());
        dto.setUsers(userDTOs);
        
        return dto;
    }
    
    //!User to Data Transfer Object
    private UserDTO convertToUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setAge(user.getAge().toString());
        Role role = roleRepository.findByUserAndOrg(user, orgRepository.findById(user.getOrgid()).orElse(null)).orElse(null);
        dto.setRole(convertToRoleDTO(role));
        dto.setOrgid(user.getOrgid());
        
        return dto;
    }
    
    //!Date validation
    public boolean dateIsValid(LocalDate date, boolean isPastDate) {
        if (date == null) {
            return true;
        }
        //*Selecting mode
        if (isPastDate) {
            log.debug("Date is in the past " + date + " " + LocalDate.now() + " " + date.isBefore(LocalDate.now()));
            return date.isBefore(LocalDate.now());
            
        } else if (!isPastDate) {
            log.debug("Date is in the future " + date + " " + LocalDate.now() + " " + date.isAfter(LocalDate.now()) + " " + date.isBefore(LocalDate.now()) + " " + date.isEqual(LocalDate.now()));
            return date.isAfter(LocalDate.now()) || date.isEqual(LocalDate.now());
        }
        return true;
    }
    
    //!Returns tasks to user
    public void taskReturner(User user, Task project) {
        Set<User> users = project.getDoneBy();
        users.remove(user);
        project.setDoneBy(users);       //NOT users it won't work use doneBy!
        List<TaskFiles> files = project.getFiles();
        //*Find user's work and delete it
        for (TaskFiles file : files) {
            if (file.getUser() == user) {
                fileRepo.delete(file);
            }
        }
        if (Objects.equals(project.getStatus(), "Done") || Objects.equals(project.getStatus(), "Submitted")) {
            project.setStatus("Due");
        }
        progressCalc(project);      //!DO NOT FORGET TO CALCULATE THE PROGRESS AGAIN
        tasksRepository.save(project);
    }
    
    //*Calculates project progress
    public void progressCalc(Task project) {
        Set<User> doneUsers = project.getDoneBy();
        Set<User> allUsers = project.getUsers();
        List<User> notDoneUsers = new ArrayList<>();
        //Finding not done users
        for (User aUser : allUsers) {
            if (!doneUsers.contains(aUser)) {
                notDoneUsers.add(aUser);
            }
        }
        //!Formula
        int progress = 100 - (int) (((double) notDoneUsers.size() / allUsers.size()) * 100);
        log.debug("not done " + notDoneUsers.size() + " all users " + allUsers.size());
        log.debug("progress: " + progress);
        project.setProgress(progress);
        project.setStatus("In Progress");
        tasksRepository.save(project);
    }
    
    //*List top 3 projects by
    public List<TasksDTO> sortProjectsByDate(List<Task> projects) {
        projects.sort(Comparator
                .comparing(Task::getDate) //!Compare by date
                .thenComparing(Comparator.comparing(Task::getPriority).reversed()) //!Compare by priority
        );
        List<TasksDTO> topProjects = new ArrayList<>();
        
        if (projects.size() >= 3) {
            topProjects.add(convertToDTO(projects.get(0)));
            topProjects.add(convertToDTO(projects.get(1)));
            topProjects.add(convertToDTO(projects.get(2)));
        } else {
            for (Task task : projects) {
                topProjects.add(convertToDTO(task));
            }
        }
        return topProjects;
    }
    
    public Set<UserDTO> convertToUserDTOSet(Set<User> users) {
        return users.stream()
                .map(this::convertToUserDTO)
                .collect(Collectors.toSet());
    }
    
    @Transactional
    public List<TasksDTO> getProjectByUser(User user, Org org) {
        List<Task> projectsAssigned = tasksRepository.findByUserAndOrg(user, org); //!Projects the user is assigned to do
        List<Task> projectsCreatedBy = tasksRepository.findProjectByCreatedByAndOrg(user, org); //!Task the user has created
        
        //Remove duplicates
        for(Task task : projectsAssigned) {
            projectsCreatedBy.remove(task);
        }
        
        //Join and return
        List<Task> projects = new ArrayList<>(projectsCreatedBy);
        projects.addAll(projectsAssigned);
        
        return projects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    //!Task deleting func
    @Transactional
    public void deleteTask(String id) {
        Task projectObj = tasksRepository.findById(id).get();
        if (projectObj == null) {
            throw new RuntimeException("Task not found");
        }
        try {
            projectObj.setUsers(null);
            projectObj.setOrg(null);
            projectObj.setCreatedBy(null);
            tasksRepository.save(projectObj);
            tasksRepository.delete(projectObj);
        } catch (RuntimeException e) {
            throw new RuntimeException(e);
            
        }
    }
    
    
    //!File scan with VirusTotal API
    public static String scanFile(File file) throws IOException {
        OkHttpClient client = new OkHttpClient();
        
        MediaType mediaType = MediaType.parse("multipart/form-data; boundary=---011000010111000001101001");
        RequestBody fileBody = RequestBody.create(file, MediaType.parse("application/octet-stream"));
        RequestBody body = new MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart("file", file.getName(), fileBody)
                .build();
        
        Request request = new Request.Builder()
                .url(VIRUSTOTAL_URL)
                .post(body)
                .addHeader("accept", "application/json")
                .addHeader("x-apikey", API_KEY)
                .build();
        
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Failed to scan file: " + response.code());
            }
            return response.body().string();
        }
    }
    
    //*TaskFiles safety checks with VT API
    public boolean isFileSafe(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("TaskFiles is empty");
        }
        try {
            File convertedFile = convertMultipartFileToFile(file);
            String response = scanFile(convertedFile);
            int positives = parsePositivesFromResponse(response);
            if (positives > 0) {
                log.debug("File is malicious: " + positives + " positives");
                return false;
            }
            log.debug("File is clean: " + positives + " positives");
            return true;
        } catch (IOException e) {
            log.debug("Error reading file content: " + e);
            return false;
        }
    }
    
    //!Getting analysis for the file from VT API
    private int parsePositivesFromResponse(String response) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(response);
        String analysisId = rootNode.path("data").path("id").asText();
        String analysisUrl = "https://www.virustotal.com/api/v3/analyses/" + analysisId;
        
        HttpURLConnection connection = (HttpURLConnection) new URL(analysisUrl).openConnection();
        connection.setRequestMethod("GET");
        connection.setRequestProperty("x-apikey", API_KEY);
        connection.setRequestProperty("accept", "application/json");
        
        int responseCode = connection.getResponseCode();
        if (responseCode == HttpURLConnection.HTTP_OK) {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()))) {
                StringBuilder analysisResponse = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    analysisResponse.append(line);
                }
                JsonNode analysisRootNode = objectMapper.readTree(analysisResponse.toString());
                return analysisRootNode.path("data").path("attributes").path("stats").path("malicious").asInt();
            }
        } else {
            throw new IOException("Failed to get analysis results: " + responseCode);
        }
    }
}
