package com.azion.Azion.Meetings.Service;

import com.azion.Azion.Meetings.Enum.EnumDays;
import com.azion.Azion.Meetings.Model.Meeting;
import com.azion.Azion.Meetings.Model.MeetingDTO;
import com.azion.Azion.Meetings.Repository.MeetingRepo;
import com.azion.Azion.Meetings.Util.MeetingUtil;
import com.azion.Azion.User.Model.DTO.UserDTO;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
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
    public void createMeeting(String topic, String description, String day, String start, String end, List<String> userEmails, String link) {
        //*Set all employees
        if (!isValidTimeFormat(start) || !isValidTimeFormat(end)) {
            throw new IllegalArgumentException("Invalid time format");
        }
        
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
            meeting.setLink(link);
            meetingRepo.save(meeting);
        } catch (Exception e) {
            throw new RuntimeException("Error creating meeting", e);
        }
    }
    
    //! Get Meetings for the current week (Mon - Fri)
    public List<MeetingDTO> getMeetingsThisWeek(User user) {
        List<Meeting> meetings = meetingRepo.findAllMeetingsByUser(user);
        
        LocalDate today = LocalDate.now();
        DayOfWeek currentDayOfWeek = today.getDayOfWeek();
        
        // Filter
        List<EnumDays> validDays = getWeekdays();   //*Monday to Friday
        List<MeetingDTO> thisWeekMeetings = new ArrayList<>();
        for (Meeting meeting : meetings) {
            if (validDays.contains(meeting.getDay())) {
                thisWeekMeetings.add(convertToDTO(meeting));
            }
        }
        return thisWeekMeetings;
    }
    
    //!Helper method valid weekdays
    private List<EnumDays> getWeekdays() {
        List<EnumDays> weekdays = new ArrayList<>();
        weekdays.add(EnumDays.MONDAY);
        weekdays.add(EnumDays.TUESDAY);
        weekdays.add(EnumDays.WEDNESDAY);
        weekdays.add(EnumDays.THURSDAY);
        weekdays.add(EnumDays.FRIDAY);
        return weekdays;
    }
    
    //!Helper method Meeting to MeetingDTO
    private MeetingDTO convertToDTO(Meeting meeting) {
        MeetingDTO dto = new MeetingDTO();
        dto.setId(meeting.getId());
        dto.setTopic(meeting.getTopic());
        dto.setDescription(meeting.getDescription());
        dto.setDay(meeting.getDay());
        dto.setStart(meeting.getStart());
        dto.setEnd(meeting.getEnd());
        dto.setLink(meeting.getLink());
        
        List<UserDTO> userDTOs = new ArrayList<>();
        for (User user : meeting.getUsers()) {
            UserDTO userDTO = new UserDTO();
            userDTO.setId(user.getId());
            userDTO.setEmail(user.getEmail());
            userDTO.setName(user.getName());
            userDTO.setAge(user.getAge().toString());
            if (user.getProfilePicture() != null) {
                userDTO.setProfilePicture(Arrays.toString(user.getProfilePicture()));
            }
            userDTO.setOrgid(user.getOrgid());
            userDTO.setRoleLevel(user.getRoleLevel());
            userDTO.setRole(user.getRole());
            userDTOs.add(userDTO);
        }
        dto.setUsers(userDTOs);
        return dto;
    }
    
    private boolean isValidTimeFormat(String time) {
        String timePattern = "^([01]\\d|2[0-3]):([0-5]\\d)$";
        return time != null && time.matches(timePattern);
    }
}
