package com.azion.Azion.Services;

import com.azion.Azion.Models.DTO.MeetingDTO;
import com.azion.Azion.Models.Meeting;
import com.azion.Azion.Models.Org;
import com.azion.Azion.Models.Role;
import com.azion.Azion.Models.User;
import com.azion.Azion.Repositories.MeetingRepo;
import com.azion.Azion.Repositories.OrgRepository;
import com.azion.Azion.Repositories.RoleRepository;
import com.azion.Azion.Repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MeetingService {
    
    
    private final UserRepository userRepository;
    private final MeetingRepo meetingRepo;
    private final OrgRepository orgRepository;
    private final RoleRepository roleRepository;
    
    public MeetingService(UserRepository userRepository, MeetingRepo meetingRepo, OrgRepository orgRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.meetingRepo = meetingRepo;
        this.orgRepository = orgRepository;
        this.roleRepository = roleRepository;
    }
    
    //!Meeting Creation
    public String createMeeting(String title, boolean allDay, Date start, Date end, List<String> roles, String link, User user) {
        
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
            return meeting.getId();
        } catch (Exception e) {
            throw new RuntimeException("Error creating meeting", e);
        }
    }
    
    
    @Transactional(readOnly = true)
    public List<MeetingDTO> getMeetings(User user) {
        Org org = orgRepository.findById(user.getOrgid()).orElse(null);
        if (org == null) {
            throw new RuntimeException("Organization not found for user.");
        }
        Role role = roleRepository.findByUserAndOrg(user, org).orElse(null);
        if (role == null) {
            throw new RuntimeException("Role not found for user in the organization.");
        }
        
        List<Meeting> meetings = meetingRepo.findByOrg(org);
        
        return meetings.stream()
                .filter(meeting -> meeting.getRoles().contains(role.getName()))
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
