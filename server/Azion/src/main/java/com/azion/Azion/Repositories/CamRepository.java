package com.azion.Azion.Repositories;

import com.azion.Azion.Models.Cam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CamRepository extends JpaRepository<Cam, String> {
    Optional<Cam> findByCamName(String camName);
    
    List<Cam> findByOrgAddress(String orgAddress);
}
