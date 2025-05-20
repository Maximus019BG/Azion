package com.azion.Azion.Repositories;

import com.azion.Azion.Models.Org;
import com.azion.Azion.Models.Task;
import com.azion.Azion.Models.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TasksRepository extends JpaRepository<Task, String> {
    
    @Query("SELECT t FROM Task t WHERE :user MEMBER OF t.users")
    List<Task> findByUsers(User user);
    
    @Query("SELECT t FROM Task t WHERE :user MEMBER OF t.users AND t.org = :org")
    List<Task> findByUserAndOrg(User user, Org org);
    
    @Query("SELECT t FROM Task t WHERE :user = t.createdBy AND t.org = :org")
    List<Task> findProjectByCreatedByAndOrg(User user, Org org);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM Task t WHERE t.createdBy = :user")
    void deleteByCreatedBy(@Param("user") User user);
}
