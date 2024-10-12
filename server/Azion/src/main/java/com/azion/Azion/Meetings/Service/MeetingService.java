package com.azion.Azion.Meetings.Service;

import com.azion.Azion.Meetings.Model.Meeting;
import com.azion.Azion.Meetings.Repository.MeetingRepo;
import com.azion.Azion.Meetings.Util.MeetingUtil;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class MeetingService {
    
    
    private final UserRepository userRepository;
    private final MeetingRepo meetingRepo;
    
    public MeetingService(UserRepository userRepository, MeetingRepo meetingRepo) {
        this.userRepository = userRepository;
        this.meetingRepo = meetingRepo;
    }
    
    //!Meeting Creation
    public void createMeeting(String topic, String description, String day, String start, String end, List<String> userEmails) {
        if (topic == null || description == null || day == null || start == null || end == null || userEmails == null || userEmails.isEmpty()) {
            throw new IllegalArgumentException("Invalid parameters");
        }
        //*Set all employees
        List<User> employees = new ArrayList<>();
        User employee;
        for (String email : userEmails) {
            employee = userRepository.findByEmail(email);
            employees.add(employee);
        }
        //Save the meeting
        try {
            Meeting meeting = new Meeting();
            meeting.setTopic(topic);
            meeting.setDescription(description);
            meeting.setDay(MeetingUtil.dayToEnum(day));
            meeting.setStart(start);
            meeting.setEnd(end);
            meeting.setUsers(employees);
            meetingRepo.save(meeting);
        } catch (Exception e) {
            throw new RuntimeException("Error creating meeting", e);
        }
    }
}
