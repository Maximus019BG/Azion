package com.azion.Azion.Projects.Repository;

import com.azion.Azion.Projects.Model.Project;
import com.azion.Azion.User.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;


public interface ProjectsRepository extends JpaRepository<Project, String> {
    
    @Query("SELECT p FROM Project p WHERE :user MEMBER OF p.users")
    List<Project> findByUsers(User user);
    
    @Query("SELECT p FROM Project p WHERE p.createdBy = :user")
    List<Project> findProjectByCreatedBy(@Param("user") User user);
}
