package com.azion.Azion.Docs.Repository;

import com.azion.Azion.Docs.Model.Docs;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocsRepo extends JpaRepository<Docs, String> {
}
