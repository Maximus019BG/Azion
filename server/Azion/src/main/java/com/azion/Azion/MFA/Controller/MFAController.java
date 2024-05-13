package com.azion.Azion.MFA.Controller;

import com.azion.Azion.MFA.Service.MFAService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MFAController {

    @GetMapping("/mfa")
    public String mfa() {

        return MFAService.mfa();
    }

}
