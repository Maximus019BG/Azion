package com.azion.Azion.Cam;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CamService {
    
    private final CamRepository camRepository;
    
    @Autowired
    public CamService(CamRepository camRepository) {
        this.camRepository = camRepository;
    }
    
    //Check if the camera is registered in the database
    public boolean camValid(String camName) {
        return camRepository.findByCamName(camName).isPresent();
    }
    
    public void addLog(String camName, String logEntry) {
        Cam cam = camRepository.findByCamName(camName).get();
        CamLog log = cam.getLog();
        log.addLog(logEntry);
    }
}