package com.azion.Azion.Docs.Controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/docs")
@Slf4j
public class DocsController {
    
    //TODO: creation of invoice
    @PostMapping("/create/invoice")
    public ResponseEntity<?> createInvoice(@RequestBody Map<Object, Object> request) {
        return ResponseEntity.ok("Invoice created");
    }
}