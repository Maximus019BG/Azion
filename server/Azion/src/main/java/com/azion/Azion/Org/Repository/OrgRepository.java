package com.azion.Azion.Org.Repository;

import com.azion.Azion.Org.Model.Org;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrgRepository extends JpaRepository<Org, String> {
    Optional<Org> findByOrgConnectString(String orgConnectString);
    Optional<Org> findByOrgName(String orgName);
}