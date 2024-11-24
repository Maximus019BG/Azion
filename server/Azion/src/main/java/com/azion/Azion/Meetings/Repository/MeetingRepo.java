package com.azion.Azion.Meetings.Repository;

import com.azion.Azion.Meetings.Model.Meeting;
import com.azion.Azion.Org.Model.Org;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MeetingRepo extends JpaRepository<Meeting, String> {
    
    @Query("SELECT m FROM Meeting m WHERE :role MEMBER OF m.roles")
    List<Meeting> findByRolesContaining(String role);
    
    List<Meeting> findByOrg(Org org);
}
