package com.azion.Azion.Projects.Service;

import com.azion.Azion.Projects.Model.DTO.ProjectsDTO;
import com.azion.Azion.Projects.Model.Project;
import com.azion.Azion.Projects.Model.ProjectFiles;
import com.azion.Azion.Projects.Repository.FileRepo;
import com.azion.Azion.Projects.Repository.ProjectsRepository;
import com.azion.Azion.User.Model.DTO.UserDTO;
import com.azion.Azion.User.Model.User;
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
public class ProjectsService {
    
    //VirusTotal config
    private static final String API_KEY = System.getProperty("virusTotalApiKey");
    private static final String VIRUSTOTAL_URL = "https://www.virustotal.com/api/v3/files";
    
    private final ProjectsRepository projectsRepository;
    private final FileRepo fileRepo;
    
    public ProjectsService(ProjectsRepository projectsRepository, FileRepo fileRepo) {
        this.projectsRepository = projectsRepository;
        this.fileRepo = fileRepo;
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
    
    //!User to Data Transfer Object
    private UserDTO convertToUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setAge(user.getAge().toString());
        dto.setRole(user.getRole());
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
    public void taskReturner(User user, Project project) {
        Set<User> users = project.getDoneBy();
        users.remove(user);
        project.setDoneBy(users);       //NOT users it won't work use doneBy!
        List<ProjectFiles> files = project.getFiles();
        //*Find user's work and delete it
        for (ProjectFiles file : files) {
            if (file.getUser() == user) {
                fileRepo.delete(file);
            }
        }
        if (Objects.equals(project.getStatus(), "Done") || Objects.equals(project.getStatus(), "Submitted")) {
            project.setStatus("Due");
        }
        progressCalc(project);      //!DO NOT FORGET TO CALCULATE THE PROGRESS AGAIN
        projectsRepository.save(project);
    }
    
    //*Calculates project progress
    public void progressCalc(Project project) {
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
        projectsRepository.save(project);
    }
    
    //*List top 3 projects by
    public List<ProjectsDTO> sortProjectsByDate(List<Project> projects) {
        projects.sort(Comparator
                .comparing(Project::getDate) //!Compare by date
                .thenComparing(Comparator.comparing(Project::getPriority).reversed()) //!Compare by priority
        );
        List<ProjectsDTO> topProjects = new ArrayList<>();
        
        if (projects.size() >= 3) {
            topProjects.add(convertToDTO(projects.get(0)));
            topProjects.add(convertToDTO(projects.get(1)));
            topProjects.add(convertToDTO(projects.get(2)));
        } else {
            for (Project project : projects) {
                topProjects.add(convertToDTO(project));
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
    public List<ProjectsDTO> getProjectByUser(User user) {
        List<Project> projectsAssigned = projectsRepository.findByUsers(user); //!Projects the user is assigned to do
        List<Project> projectsCreatedBy = projectsRepository.findProjectByCreatedBy(user); //!Project the user has created
        
        //Remove duplicates
        for(Project project : projectsAssigned) {
            if(projectsCreatedBy.contains(project)) {
                projectsCreatedBy.remove(project);
            }
        }
        
        //Join and return
        List<Project> projects = new ArrayList<>(projectsCreatedBy);
        projects.addAll(projectsAssigned);
        
        return projects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    //!Task deleting func
    @Transactional
    public void deleteTask(String id) {
        Project projectObj = projectsRepository.findById(id).get();
        if (projectObj == null) {
            throw new RuntimeException("Project not found");
        }
        try {
            projectObj.setUsers(null);
            projectObj.setCreatedBy(null);
            projectsRepository.save(projectObj);
            projectsRepository.delete(projectObj);
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
    
    //*ProjectFiles safety checks with VT API
    public boolean isFileSafe(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("ProjectFiles is empty");
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
