package com.azion.Azion.Controllers;

import com.azion.Azion.Models.DTO.NetworkDTO;
import com.azion.Azion.Models.Network;
import com.azion.Azion.Models.Org;
import com.azion.Azion.Models.User;
import com.azion.Azion.Repositories.NetworkRepository;
import com.azion.Azion.Repositories.OrgRepository;
import com.azion.Azion.Services.NetworkService;
import com.azion.Azion.Services.TokenService;
import com.azion.Azion.Services.UserService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Controller
@RestController
@RequestMapping("/api/network")
public class NetworkController {
    
    private final NetworkService networkService;
    private final NetworkRepository networkRepository;
    private final TokenService tokenService;
    private final UserService userService;
    private final OrgRepository orgRepository;
    
    @Autowired
    public NetworkController(NetworkService networkService, NetworkRepository networkRepository, TokenService tokenService, UserService userService, OrgRepository orgRepository) {
        this.networkService = networkService;
        this.networkRepository = networkRepository;
        this.tokenService = tokenService;
        this.userService = userService;
        this.orgRepository = orgRepository;
    }
    
    @Transactional
    @PostMapping("/add")
    public ResponseEntity<?> addNetwork(@RequestBody Map<Object, Object> request, @RequestHeader("authorization") String token) {
        String name = (String) request.get("name");
        String description = (String) request.get("description");
        String unifyApiKey = (String) request.get("unifyApiKey");
        String siteId = (String) request.get("siteId");
        String hostId = (String) request.get("hostId");
        
        // Validate input
        if (name == null || description == null || unifyApiKey == null || siteId == null || hostId == null) {
            return ResponseEntity.badRequest().body("Invalid input");
        }
        
        User user = tokenService.getUserFromToken(token);
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        
        if (!userService.UserHasRight(user, "networks")) {
            return ResponseEntity.status(403).body("Forbidden");
        }
        
        Org org = orgRepository.findById(user.getOrgid()).orElse(null);
        if (org == null) {
            return ResponseEntity.status(404).body("Organization not found");
        }
        
        // Create and save network
        Network network = new Network();
        network.setName(name);
        network.setDescription(description);
        network.setUnifyApiKey(unifyApiKey);
        network.setSiteId(siteId);
        network.setHostId(hostId);
        network.setOrg(org);
        
        networkRepository.save(network);
        
        return ResponseEntity.ok("Network added successfully");
    }
    
    @Transactional
    @GetMapping("/get/all")
    public ResponseEntity<?> getAllNetworks(@RequestHeader("authorization") String authorization) {
        User user = tokenService.getUserFromToken(authorization);
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        if (!userService.UserHasRight(user, "networks")) {
            return ResponseEntity.status(403).body("Forbidden");
        }
        Org org = orgRepository.findById(user.getOrgid()).orElse(null);
        if (org == null) {
            return ResponseEntity.status(404).body("Organization not found");
        }
        
        try {
            List<Network> networks = networkRepository.findByOrg(org);
            List<NetworkDTO> networkDTOs = networks.stream()
                    .map(network -> {
                        try {
                            return NetworkDTO.fromNetwork(network);
                        } catch (Exception e) {
                            throw new RuntimeException("Error converting Network to NetworkDTO", e);
                        }
                    })
                    .toList();
            return ResponseEntity.ok(networkDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching networks");
        }
    }
    
    @GetMapping("/get/{id}")
    public ResponseEntity<?> getNetworkById(@PathVariable String id) {
        Network network = networkRepository.findById(id).orElse(null);
        if (network == null) {
            return ResponseEntity.status(404).body("Network not found");
        }
        
        String response = networkService.getDataForNetwork(network);
        if (response == null) {
            return ResponseEntity.status(500).body("Error fetching network data");
        }
        
        return ResponseEntity.ok(response);
    }
}
