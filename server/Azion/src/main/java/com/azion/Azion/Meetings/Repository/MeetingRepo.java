package com.azion.Azion.Meetings.Repository;

import com.azion.Azion.Meetings.Model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MeetingRepo extends JpaRepository<Meeting, String> {
}
