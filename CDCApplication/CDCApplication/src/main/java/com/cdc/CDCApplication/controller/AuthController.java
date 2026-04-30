package com.cdc.CDCApplication.controller;

import com.cdc.CDCApplication.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.password}")
    private String adminPassword;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
        System.out.println("=== LOGIN ATTEMPT ===");
        System.out.println("Username recu: [" + request.getUsername() + "]");
        System.out.println("Password recu: [" + request.getPassword() + "]");
        System.out.println("Admin username config: [" + adminUsername + "]");
        System.out.println("Admin password config: [" + adminPassword + "]");
        System.out.println("Match username: " + request.getUsername().equals(adminUsername));
        System.out.println("Match password: " + request.getPassword().equals(adminPassword));

        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getUsername().trim(),
                    request.getPassword().trim()
                )
            );
            String token = jwtUtil.generateToken(request.getUsername().trim());
            Map<String, String> resp = new HashMap<>();
            resp.put("token", token);
            resp.put("username", request.getUsername().trim());
            System.out.println("=== LOGIN SUCCESS ===");
            return ResponseEntity.ok(resp);
        } catch (BadCredentialsException e) {
            System.out.println("=== LOGIN FAILED: " + e.getMessage() + " ===");
            Map<String, String> err = new HashMap<>();
            err.put("message", "Identifiants incorrects");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        } catch (Exception e) {
            System.out.println("=== LOGIN ERROR: " + e.getClass().getName() + ": " + e.getMessage() + " ===");
            Map<String, String> err = new HashMap<>();
            err.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    public static class LoginRequest {
        private String username;
        private String password;
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}