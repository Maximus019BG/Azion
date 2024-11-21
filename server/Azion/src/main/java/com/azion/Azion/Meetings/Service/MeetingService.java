package com.azion.Azion.Meetings.Service;

import com.azion.Azion.Meetings.Enum.EnumDays;
import com.azion.Azion.Meetings.Model.Meeting;
import com.azion.Azion.Meetings.Model.MeetingDTO;
import com.azion.Azion.Meetings.Repository.MeetingRepo;
import com.azion.Azion.Meetings.Util.MeetingUtil;
import com.azion.Azion.Org.Repository.OrgRepository;
import com.azion.Azion.User.Model.DTO.UserDTO;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MeetingService {
    
    
    private final UserRepository userRepository;
    private final MeetingRepo meetingRepo;
    private final OrgRepository orgRepository;
    
    public MeetingService(UserRepository userRepository, MeetingRepo meetingRepo, OrgRepository orgRepository) {
        this.userRepository = userRepository;
        this.meetingRepo = meetingRepo;
        this.orgRepository = orgRepository;
    }
    
    //!Meeting Creation
    public void createMeeting(String title, boolean allDay, Date start, Date end, List<String> roles, String link, User user) {
        
        //Save the meeting
        try {
            Meeting meeting = new Meeting();
            meeting.setTitle(title);
            meeting.setStart(start);
            meeting.setAllDay(allDay);
            meeting.setEnd(end);
            meeting.setRoles(roles);
            meeting.setLink(link);
            meeting.setOrg(orgRepository.findById(user.getOrgid()).get());
            
            meetingRepo.save(meeting);
        } catch (Exception e) {
            throw new RuntimeException("Error creating meeting", e);
        }
    }
    
    
    @Transactional(readOnly = true)
    public List<MeetingDTO> getMeetings(User user) {
        List<Meeting> meetings = meetingRepo.findByOrg(orgRepository.findById(user.getOrgid()).get());
        return meetings.stream()
                .filter(meeting -> meeting.getRoles().contains(user.getRole()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private MeetingDTO convertToDTO(Meeting meeting) {
        MeetingDTO dto = new MeetingDTO();
        dto.setId(meeting.getId());
        dto.setTitle(meeting.getTitle());
        dto.setAllDay(meeting.isAllDay());
        dto.setRoles(meeting.getRoles());
        dto.setStart(meeting.getStart());
        dto.setEnd(meeting.getEnd());
        dto.setLink(meeting.getLink());
        return dto;
    }
    
    public void deleteMeeting(String id) {
        meetingRepo.deleteById(id);
    }
}
