package com.azion.Azion.Projects.Repository;

import com.azion.Azion.Projects.Model.ProjectFiles;
import org.springframework.data.jpa.repository.JpaRepository;



public interface FileRepo extends JpaRepository<ProjectFiles, String> {

}
