package com.azion.Azion.Repositories;

import com.azion.Azion.Models.Meeting;
import com.azion.Azion.Models.Org;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MeetingRepo extends JpaRepository<Meeting, String> {
    
    @Query("SELECT m FROM Meeting m WHERE :role MEMBER OF m.roles")
    List<Meeting> findByRolesContaining(String role);
    
    List<Meeting> findByOrg(Org org);
}
