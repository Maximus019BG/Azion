package com.azion.Azion.Tasks.Repository;

import com.azion.Azion.Tasks.Model.Task;
import com.azion.Azion.User.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;


public interface ProjectsRepository extends JpaRepository<Task, String> {
    
    @Query("SELECT p FROM Task p WHERE :user MEMBER OF p.users")
    List<Task> findByUsers(User user);
    
    @Query("SELECT p FROM Task p WHERE p.createdBy = :user")
    List<Task> findProjectByCreatedBy(@Param("user") User user);
}
