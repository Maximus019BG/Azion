package com.azion.Azion.Cam;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CamRepository extends JpaRepository<Cam, String> {
    Optional<Cam> findByCamName(String camName);
    
    Optional<Cam> findByOrgAddress(String orgAddress);
}
