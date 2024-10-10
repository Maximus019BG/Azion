package com.azion.Azion.Invoice.Repository;

import com.azion.Azion.Invoice.Model.Docs;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocsRepo extends JpaRepository<Docs, String> {
}
