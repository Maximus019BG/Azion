package com.azion.Azion.Meetings.Controller;


import com.azion.Azion.Meetings.Model.MeetingDTO;
import com.azion.Azion.Meetings.Service.MeetingService;
import com.azion.Azion.Org.Model.DTO.OrgDTO;
import com.azion.Azion.Org.Model.Org;
import com.azion.Azion.Org.Repository.OrgRepository;
import com.azion.Azion.Org.Service.OrgService;
import com.azion.Azion.Token.TokenService;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Service.UserService;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/schedule")
public class MeetingController {
    
    private final MeetingService meetingService;
    private final UserService userService;
    private final TokenService tokenService;
    private final OrgRepository orgRepository;
    private final OrgService orgService;
    
    @Autowired
    public MeetingController(MeetingService meetingService, UserService userService, TokenService tokenService, OrgRepository orgRepository, OrgService orgService) {
        this.meetingService = meetingService;
        this.userService = userService;
        this.tokenService = tokenService;
        this.orgRepository = orgRepository;
        this.orgService = orgService;
    }
    
    @Transactional
    @PostMapping("/create/meeting")
    public ResponseEntity<?> createMeeting(@RequestHeader("authorization") String token, @RequestBody Map<Object, Object> request) {
        if (token == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing authorization header");
        }
        userService.userValid(token);   //Token validation
        User user = tokenService.getUserFromToken(token);
        if (!userService.UserHasRight(user,"calendar:write")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not admin or owner");
        }
        //Get the meeting details
        String title = (String) request.get("title");
        boolean allDay = (Boolean) request.get("allDay");
        String startStr = (String) request.get("start");
        String endStr = (String) request.get("end");
        String link = (String) request.get("link");
        List<String> roles = (List<String>) request.get("roles");
        
        Date start = Date.from(Instant.parse(startStr));
        Date end = Date.from(Instant.parse(endStr));
        
        String id = meetingService.createMeeting(title, allDay, start, end, roles, link, user); //Return id so it can del
        
        return ResponseEntity.ok().body(id);
    }
    
    @Transactional
    @GetMapping("/show/meetings")
    public ResponseEntity<?> showMeetings(@RequestHeader("authorization") String token) {
        if (token == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing authorization header");
        }
        userService.userValid(token); //Token validation
        User user = tokenService.getUserFromToken(token);
        List<MeetingDTO> meetings = meetingService.getMeetings(user);
        log.debug("Meetings: {}", meetings.toString());
        return ResponseEntity.ok().body(meetings);
    }
    
    @Transactional
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteMeeting(@RequestHeader("authorization") String token, @PathVariable String id) {
        if (token == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing authorization header");
        }
        userService.userValid(token);//Token validation
        User user = tokenService.getUserFromToken(token);
        //Check if user is super admin
        if(!userService.UserHasRight(user,"calendar:write")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not super admin");
        }
        List<MeetingDTO> meetings = meetingService.getMeetings(user);
        meetingService.deleteMeeting(id);
        return ResponseEntity.ok().body(meetings);
    }
    
    @Transactional
    @GetMapping("/list/roles")
    public ResponseEntity<?> listRoles(@RequestHeader("authorization") String token) {
        if (token == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing authorization header");
        }
        userService.userValid(token);//Token validation
        User user = tokenService.getUserFromToken(token);
        Org org = orgRepository.findById(user.getOrgid()).orElse(null);
        if (org == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No organization found");
        }
        //Role list
        List<String> roles = orgService.listRoles(org);
        return ResponseEntity.ok(roles);
    }
}
