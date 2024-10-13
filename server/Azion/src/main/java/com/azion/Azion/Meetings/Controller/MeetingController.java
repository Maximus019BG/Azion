package com.azion.Azion.Meetings.Controller;


import com.azion.Azion.Meetings.Model.MeetingDTO;
import com.azion.Azion.Meetings.Service.MeetingService;
import com.azion.Azion.Token.TokenService;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Service.UserService;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/schedule")
public class MeetingController {
    
    private final MeetingService meetingService;
    private final UserService userService;
    private final TokenService tokenService;
    
    @Autowired
    public MeetingController(MeetingService meetingService, UserService userService, TokenService tokenService) {
        this.meetingService = meetingService;
        this.userService = userService;
        this.tokenService = tokenService;
    }
    
    @Transactional
    @PostMapping("/create/meeting")
    public ResponseEntity<?> createMeeting(@RequestHeader("authorization") String token, @RequestBody Map<Object, Object> request) {
        userService.userValid(token);
        
        User user = tokenService.getUserFromToken(token);
        if (!userService.userAdmin(user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not admin or owner");
        }
        
        String topic = (String) request.get("topic");
        String description = (String) request.get("description");
        String dayOfWeek = (String) request.get("dayOfWeek");
        String startHour = (String) request.get("startHour");
        String endHour = (String) request.get("endHour");
        String link = (String) request.get("link");
        List<String> userEmails = (List<String>) request.get("userEmails");
        
        meetingService.createMeeting(topic, description, dayOfWeek, startHour, endHour, userEmails, link);
        
        return ResponseEntity.ok().body(String.format("New meeting about %s created!", topic));
    }
    
    @Transactional
    @GetMapping("/show/meetings")
    public ResponseEntity<?> showMeetings(@RequestHeader("authorization") String token) {
        userService.userValid(token);
        
        User user = tokenService.getUserFromToken(token);
        if (!userService.userAdmin(user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not admin or owner");
        }
        
        List<MeetingDTO> meetings = meetingService.getMeetingsThisWeek(user);
        return ResponseEntity.ok().body(meetings);
    }
}
