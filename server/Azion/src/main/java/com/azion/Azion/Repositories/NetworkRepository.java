package com.azion.Azion.Repositories;

import com.azion.Azion.Models.Network;
import com.azion.Azion.Models.Org;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NetworkRepository extends JpaRepository<Network, String> {
    
    List<Network> findByOrg(Org org);
    
}
