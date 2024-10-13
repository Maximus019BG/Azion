package com.azion.Azion.Invoice.Repository;

import com.azion.Azion.Invoice.Model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceRepo extends JpaRepository<Invoice, String> {
}
