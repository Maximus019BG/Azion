package com.azion.Azion.Controllers;

import com.azion.Azion.Enums.OrgType;
import com.azion.Azion.Models.Org;
import com.azion.Azion.Models.Role;
import com.azion.Azion.Models.User;
import com.azion.Azion.Repositories.OrgRepository;
import com.azion.Azion.Repositories.UserRepository;
import com.azion.Azion.Services.TokenService;
import com.azion.Azion.Services.UserService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.model.checkout.Session;
import com.stripe.param.SubscriptionCancelParams;
import com.stripe.param.checkout.SessionListLineItemsParams;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
public class StripeConfirmController {
    
    private final UserService userService;
    private final TokenService tokenService;
    private final OrgRepository orgRepository;
    private final UserRepository userRepository;
    @Value("${stripe.secret.key}")
    private String stripeSecretKey;
    
    public StripeConfirmController(UserService userService, TokenService tokenService, OrgRepository orgRepository, UserRepository userRepository) {
        this.userService = userService;
        this.tokenService = tokenService;
        this.orgRepository = orgRepository;
        this.userRepository = userRepository;
    }
    
    @Transactional
    @PostMapping("/verify-checkout")
    public ResponseEntity<?> verifyCheckout(@RequestBody Map<String, String> requestBody, @RequestHeader("authorization") String token) {
        Map<String, Object> response = new HashMap<>();
        String sessionId = requestBody.get("sessionId");
        
        Stripe.apiKey = stripeSecretKey;
        
        try {
            Session session = Session.retrieve(sessionId);
            
            if ("paid".equals(session.getPaymentStatus())) {
                SessionListLineItemsParams params = SessionListLineItemsParams.builder().build();
                LineItemCollection lineItems = session.listLineItems(params);
                
                List<Map<String, Object>> purchasedItems = new ArrayList<>();
                
                for (LineItem item : lineItems.getData()) {
                    Map<String, Object> itemData = new HashMap<>();
                    itemData.put("name", item.getDescription());
                    itemData.put("quantity", item.getQuantity());
                    itemData.put("amount", item.getAmountTotal());
                    purchasedItems.add(itemData);
                }
                
                response.put("success", true);
                response.put("items", purchasedItems);
                response.put("message", "Payment confirmed.");
                
                //Get product name
                Price price = Price.retrieve(lineItems.getData().get(0).getPrice().getId());
                Product product = Product.retrieve(price.getProduct());
                String productName = product.getName();
                
                User user = tokenService.getUserFromToken(token);
                if (!userService.isUserOwner(user)) {
                    return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
                }
                
                Org org = orgRepository.findById(user.getOrgid()).orElse(null);
                if (org == null) {
                    response.put("success", false);
                    response.put("message", "Organization not found.");
                    return ResponseEntity.status(404).body(response);
                }
                if (productName.contains("Pro")) {
                    org.setPlan(OrgType.PRO);
                } else if (productName.contains("Standard")) {
                    org.setPlan(OrgType.STANDARD);
                } else {
                    response.put("success", false);
                    response.put("message", "Invalid product name.");
                    return ResponseEntity.status(400).body(response);
                }
                org.setSubscriptionID(session.getSubscription());
                org.setMaxEmployeeCount(session.getAmountTotal() / 1000L);
                orgRepository.save(org);
                response.put("success", true);
                response.put("message", "Subscription updated successfully.");
                
            } else {
                response.put("success", false);
                response.put("message", "Payment not confirmed.");
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
        
        return ResponseEntity.ok(response);
    }
    
    
    @Transactional
    @PostMapping("/cancel")
    public ResponseEntity<?> cancelSubscription(@RequestBody Map<String, String> body, @RequestHeader("authorization") String token) {
        User user = tokenService.getUserFromToken(token);
        String subscriptionId = body.get("subscriptionId");
        
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        Role role = user.getRole();
        
        if (role == null || !userService.isUserOwner(user)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        
        Org org = orgRepository.findById(user.getOrgid()).orElse(null);
        if (org == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Organization not found"));
        }
        
        //Database update
        try {
            org.setSubscriptionID(null);
            org.setMaxEmployeeCount(5L);
            org.setEmployeeCount(1L);
            Set<User> users = org.getUsers();
            
            for (User u : users) {
                if (u.getRole().getName().equals("owner")) {
                    continue;
                }
                u.setRole(null);
                u.setOrgid(null);
                userRepository.save(u);
            }
            Set<User> newUsers = new HashSet<>();
            newUsers.add(user);
            org.setUsers(newUsers);
            orgRepository.save(org);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error: " + e.getMessage()));
        }
        
        //Stripe update
        try {
            SubscriptionCancelParams params = SubscriptionCancelParams.builder()
                    .setInvoiceNow(true)
                    .setProrate(true)
                    .build();
            
            Subscription subscription = Subscription.retrieve(subscriptionId);
            subscription.cancel(params);
            
            return ResponseEntity.ok(Map.of(
                    "message", "Subscription cancelled",
                    "status", subscription.getStatus()
            ));
        } catch (StripeException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to cancel subscription", "details", e.getMessage()));
        }
    }
}
