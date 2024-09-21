package com.azion.Azion.Projects.Service;

import com.azion.Azion.Projects.Model.DTO.ProjectsDTO;
import com.azion.Azion.Projects.Model.Project;
import com.azion.Azion.Projects.Repository.ProjectsRepository;
import com.azion.Azion.User.Model.DTO.UserDTO;
import com.azion.Azion.User.Model.User;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Arrays;
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
    
    public Set<UserDTO> convertToUserDTOSet(Set<User> users) {
        return users.stream()
                .map(this::convertToUserDTO)
                .collect(Collectors.toSet());
    }
    
    public boolean dateIsValid(LocalDate date, boolean isPastDate) {
        if (date == null) {
            return true;
        }
        if (isPastDate) {
            log.debug("Date is in the past " + date + " " + LocalDate.now() + " " + date.isBefore(LocalDate.now()));
            return date.isBefore(LocalDate.now());
            
        } else if (!isPastDate) {
            log.debug("Date is in the future " + date + " " + LocalDate.now() + " " + date.isAfter(LocalDate.now()) + " " + date.isBefore(LocalDate.now()) + " " + date.isEqual(LocalDate.now()));
            return date.isAfter(LocalDate.now()) || date.isEqual(LocalDate.now());
        }
        return true;
    }
    
    //*ProjectFiles safety checks
    public boolean isFileSafe(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("ProjectFiles is empty");
        }
        try {
            byte[] fileContent = file.getBytes();
            String content = new String(fileContent);
            String name = file.getOriginalFilename();
            //Basic checks
            if (name == null || name.isEmpty()) {
                return false;
            }
            else if (name.contains(".txt")) {
                return true;
            }
            else if (name.contains(".sh") || name.contains(".exe") || name.contains(".bat") || name.contains(".cmd") || name.contains(".dll") || name.contains(".jar") || name.contains(".iso") || name.contains(".hex") ||
                    name.contains(".asp") || name.contains(".aspx") || name.contains(".aspx-exe") || name.contains(".elf") || name.contains(".elf-so") || name.contains(".exe-only") ||
                    name.contains(".exe-service") || name.contains(".exe-small") || name.contains(".hta-psh") || name.contains(".loop-vbs") || name.contains(".macho") || name.contains(".msi") || name.contains(".msi-nouac") ||
                    name.contains(".osx-app") || name.contains(".psh") || name.contains(".psh-net") || name.contains(".psh-reflection") || name.contains(".psh-cmd") || name.contains(".vba") || name.contains(".vba-exe") ||
                    name.contains(".vba-psh") || name.contains(".vbs") || name.contains(".war")) {
                return false;
            }
            else if (content.contains("rm -rf") || content.contains("rm -rf /") || content.contains("rm -rf /*") || content.contains("rm -rf /*.*") || content.contains("rm -rf *") || content.contains(" rm ")) {
                return false;
            }
            else if (content.contains("del /f /s /q") || content.contains("del /f /s /q *") || content.contains("del /f /s /q *.*") || content.contains("del /f /s /q /f") || content.contains("del /f /s /q /f *") || content.contains("del /f /s /q /f *.*") || content.contains(" del ")) {
                return false;
            }
            
            log.debug("ProjectFiles type specific checks");
            //ProjectFiles type specific checks
            switch (name.substring(name.lastIndexOf('.'))) {
                case ".pdf":
                    return fileSafePDF(content);
                case ".py":
                    return fileSafePython(content);
                case ".js":
                    return fileSafeJavaScript(content);
                case ".java":
                    return fileSafeJava(content);
                case ".cpp":
                case ".c":
                case ".h":
                    return fileSafeCpp(content);
                case ".html":
                    return fileSafeHtml(content);
                case ".rb":
                    return fileSafeRuby(content);
                case ".go":
                    return fileSafeGo(content);
                case ".doc":
                    return fileSafeDoc(content);
                default:
                    return true;
            }
        } catch (IOException e) {
            log.debug("Error reading file content:   "+e);
            return false;
        }
    }
    
    public boolean fileSafeMacro(String content) {
        if (content.contains("AutoOpen") || content.contains("AutoExec") || content.contains("Document_Open") || content.contains("Workbook_Open") || content.contains("Application.Run") || content.contains("Shell") || content.contains("CreateObject") || content.contains("GetObject") || content.contains("ExecuteExcel4Macro")) {
            return false;
        }
        //!Keywords for file operations
        String[] fileOpK = {"ProjectFiles", "FileInputStream", "FileOutputStream", "FileReader",
                "FileWriter", "Files", "Path", "Paths", "BufferedReader", "BufferedWriter", "RandomAccessFile",
                "FileChannel", "FileLock", "FileSystem", "FileSystems", "FileStore", "FileVisitor", "DirectoryStream",
                "Stream", "Scanner", "PrintWriter", "PrintStream"};
        
        for (String keyword : fileOpK) {
            if (content.contains(keyword)) {
                return false;
            }
        }
        return true;
    }
    
    public boolean fileSafePDF(String content) {
        if (content.contains("javascript") || content.contains("obj") || content.contains("endobj") || content.contains("stream") || content.contains("endstream") || content.contains("xref") || content.contains("trailer") || content.contains("startxref") || content.contains("/JS") || content.contains("/JavaScript")) {
            return false;
        }
        
        return fileSafeMacro(content);
    }
    
    public boolean fileSafePython(String content) {
        if (content.contains("import os") || content.contains("import sys") || content.contains("subprocess") || content.contains("eval") || content.contains("exec") || content.contains("pickle") || content.contains("os.system") || content.contains("os.popen") || content.contains("os.execvp") || content.contains("os.fork") || content.contains("os.kill")) {
            return false;
        }
        
        return fileSafeMacro(content);
    }
    
    public boolean fileSafeJavaScript(String content) {
        if (content.contains("eval") || content.contains("Function") || content.contains("setTimeout") || content.contains("setInterval") || content.contains("XMLHttpRequest") || content.contains("ActiveXObject") || content.contains("document.write") || content.contains("document.execCommand") || content.contains("window.location") || content.contains("window.open")) {
            return false;
        }
        
        return fileSafeMacro(content);
    }
    
    public boolean fileSafeJava(String content) {
        if (content.contains("Runtime.getRuntime()") || content.contains("ProcessBuilder") || content.contains("exec") || content.contains("System.exit") || content.contains("java.lang.reflect") || content.contains("java.io.ProjectFiles") || content.contains("java.io.FileInputStream") || content.contains("java.io.FileOutputStream") || content.contains("java.io.FileReader") || content.contains("java.io.FileWriter")) {
            return false;
        }
        
        return fileSafeMacro(content);
    }
    
    public boolean fileSafeCpp(String content) {
        if (content.contains("system(") || content.contains("popen(") || content.contains("execvp(") || content.contains("fork(") || content.contains("kill(") || content.contains("execl(") || content.contains("execlp(") || content.contains("execle(") || content.contains("execv(") || content.contains("execve(") || content.contains("execvpe(")) {
            return false;
        }
        
        return fileSafeMacro(content);
    }
    
    public boolean fileSafeHtml(String content) {
        if (content.contains("<script>") || content.contains("javascript:") || content.contains("onerror=") || content.contains("onload=") || content.contains("onclick=") || content.contains("onmouseover=") || content.contains("onfocus=") || content.contains("onblur=") || content.contains("onchange=") || content.contains("onsubmit=")) {
            return false;
        }
        
        return fileSafeMacro(content);
    }
    
    public boolean fileSafeRuby(String content) {
        if (content.contains("system") || content.contains("exec") || content.contains("eval") || content.contains("open") || content.contains("IO.popen") || content.contains("Kernel.exec") || content.contains("Kernel.system") || content.contains("Kernel.eval") || content.contains("Kernel.open") || content.contains("ProjectFiles.open")) {
            return false;
        }
        
        return fileSafeMacro(content);
    }
    
    public boolean fileSafeGo(String content) {
        if (content.contains("os/exec") || content.contains("syscall") || content.contains("unsafe") || content.contains("eval") || content.contains("os.Remove") || content.contains("os.RemoveAll") || content.contains("os.Rename") || content.contains("os.Chmod") || content.contains("os.Chown") || content.contains("os.Create")) {
            return false;
        }
        
        return fileSafeMacro(content);
    }
    public boolean fileSafeDoc(String content) {
        if (content.contains("ActiveXObject") || content.contains("Shell") || content.contains("CreateObject") || content.contains("GetObject") || content.contains("ExecuteExcel4Macro")) {
            return false;
        }
        return fileSafeMacro(content);
    }
}
