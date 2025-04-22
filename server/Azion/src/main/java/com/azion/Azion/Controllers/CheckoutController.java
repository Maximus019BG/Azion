package com.azion.Azion.Controllers;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {
    
    public CheckoutController() {
        // Initialize Stripe with the secret key
        Stripe.apiKey = System.getenv("STRIPE_SECRET_KEY"); // Read the secret key from environment
    }
    
    @PostMapping
    public Map<String, Object> createCheckoutSession(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Get priceId from the incoming request
            String priceId = (String) request.get("priceId");
            
            // Create a new Checkout session
            SessionCreateParams params = SessionCreateParams.builder()
                    .addPaymentMethodType(SessionCreateParams.PaymentMethodType.valueOf("card"))
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setPrice(priceId)
                                    .setQuantity(1L)
                                    .build())
                    .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                    .setSuccessUrl(System.getenv("STRIPE_SUCCESS_URL") + "?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(System.getenv("STRIPE_CANCEL_URL"))
                    .build();
            
            // Create the session
            Session session = Session.create(params);
            
            // Return the session ID (which you use on the frontend to redirect the user)
            response.put("id", session.getId());
            
            // Stripe Checkout automatically handles the client_secret internally.
            // You do not need to extract the client_secret directly for your frontend use.
            // The session ID is the only thing needed for redirection.
            
        } catch (Exception e) {
            // Handle any errors
            e.printStackTrace();
            response.put("message", e.getMessage());
            response.put("status", 500);
        }
        
        return response;
    }
}
