package com.azion.Azion.Org.Repository;

import com.azion.Azion.Org.Model.OrgModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrgRepository extends JpaRepository<OrgModel, String> {
    Optional<OrgModel> findByOrgConnectString(String orgConnectString);
}