package com.azion.Azion.Controllers;

import com.azion.Azion.Models.User;
import com.azion.Azion.Services.TokenService;
import com.azion.Azion.Services.UserService;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {
    
    private final UserService userService;
    private final TokenService tokenService;
    @Value("${stripe.secret.key}")
    private String stripeSecretKey;
    
    @Value("${stripe.success.url}")
    private String successUrl;
    
    @Value("${stripe.cancel.url}")
    private String cancelUrl;
    
    public CheckoutController(UserService userService, TokenService tokenService) {
        this.userService = userService;
        this.tokenService = tokenService;
    }
    
    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }
    
    @Transactional
    @PostMapping
    public ResponseEntity<?> createCheckoutSession(@RequestBody Map<String, Object> request, @RequestHeader("authorization") String token) {
        Map<String, Object> response = new HashMap<>();
        User user = tokenService.getUserFromToken(token);
        if (!userService.isUserOwner(user)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        try {
            String priceId = (String) request.get("priceId");
            Long quantity = Long.parseLong(request.get("quantity").toString());
            if (quantity == null || quantity <= 0) {
                quantity = 1L;
            }
            
            if (priceId == null || priceId.isEmpty()) {
                throw new IllegalArgumentException("Missing priceId in request");
            }
            
            SessionCreateParams params = SessionCreateParams.builder()
                    .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setPrice(priceId)
                                    .setQuantity(quantity)
                                    .build()
                    )
                    .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                    .setSuccessUrl(successUrl + "?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(cancelUrl)
                    .build();
            
            Session session = Session.create(params);
            
            response.put("id", session.getId());
        } catch (Exception e) {
            e.printStackTrace();
            response.put("message", e.getMessage());
            response.put("status", 500);
        }
        return ResponseEntity.ok(response);
    }
}
