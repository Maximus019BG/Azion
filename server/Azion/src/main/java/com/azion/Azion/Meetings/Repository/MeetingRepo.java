package com.azion.Azion.Meetings.Repository;

import com.azion.Azion.Meetings.Model.Meeting;
import com.azion.Azion.User.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MeetingRepo extends JpaRepository<Meeting, String> {
    
    @Query("SELECT m FROM Meeting m JOIN m.users u WHERE u = :user")
    List<Meeting> findAllMeetingsByUser(User user);
}
