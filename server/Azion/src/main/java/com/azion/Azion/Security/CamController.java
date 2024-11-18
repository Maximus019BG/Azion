package com.azion.Azion.Security;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "AzionCam", allowedHeaders = "*")
@RequestMapping("/api/cam")
public class CamController {
    
    //Route for the camera
    @PostMapping("/sec")
    public ResponseEntity<?> esp32Cam() {
        //TODO: Implement the camera
        return ResponseEntity.ok("Secured");
    }
}
