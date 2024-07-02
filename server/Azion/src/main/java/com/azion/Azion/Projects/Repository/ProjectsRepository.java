package com.azion.Azion.Projects.Repository;

import com.azion.Azion.Projects.Model.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectsRepository extends JpaRepository<Project, String> {

}
