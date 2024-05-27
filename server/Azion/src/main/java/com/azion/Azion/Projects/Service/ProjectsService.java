package com.azion.Azion.Projects.Service;

import com.azion.Azion.Projects.Model.Project;
import com.azion.Azion.Projects.Repository.ProjectsRepository;
import org.springframework.stereotype.Service;

@Service
public class ProjectsService {

    private final ProjectsRepository projectsRepository;

    public ProjectsService(ProjectsRepository projectsRepository) {
        this.projectsRepository = projectsRepository;
    }

    public Project saveProject(Project project) {
        return projectsRepository.save(project);
    }
}