package com.cdc.CDCApplication.controller;

import com.cdc.CDCApplication.entity.Privilege;
import com.cdc.CDCApplication.entity.Role;
import com.cdc.CDCApplication.entity.Utilisateur;
import com.cdc.CDCApplication.repository.UtilisateurRepository;
import com.cdc.CDCApplication.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UtilisateurRepository utilisateurRepository;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil,
                          UtilisateurRepository utilisateurRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.utilisateurRepository = utilisateurRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        try {
            // Authentifier avec email + mot de passe
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail().trim(),
                    request.getPassword().trim()
                )
            );

            // Charger l'utilisateur pour récupérer ses infos
            Utilisateur utilisateur = utilisateurRepository
                    .findByEmail(request.getEmail().trim())
                    .orElseThrow();

            // Collecter les roles
            List<String> roles = utilisateur.getRoles().stream()
                    .map(r -> r.getNom().toUpperCase())
                    .collect(Collectors.toList());

            // Collecter tous les privileges
            List<String> privileges = utilisateur.getRoles().stream()
                    .flatMap(r -> r.getPrivileges().stream())
                    .map(p -> p.getNom().toUpperCase())
                    .distinct()
                    .collect(Collectors.toList());

            // Verifier si admin (role ADMIN ou aucun role = acces complet)
            boolean isAdmin = roles.stream()
                    .anyMatch(r -> r.equals("ADMIN") || r.equals("ADMINISTRATEUR"));

            // Generer le token JWT
            String token = jwtUtil.generateToken(utilisateur.getEmail(), roles, privileges);

            Map<String, Object> resp = new HashMap<>();
            resp.put("token", token);
            resp.put("email", utilisateur.getEmail());
            resp.put("nom", utilisateur.getNom());
            resp.put("prenom", utilisateur.getPrenom());
            resp.put("roles", roles);
            resp.put("privileges", privileges);
            resp.put("isAdmin", isAdmin);

            return ResponseEntity.ok(resp);

        } catch (BadCredentialsException e) {
            Map<String, Object> err = new HashMap<>();
            err.put("message", "Email ou mot de passe incorrect");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        } catch (DisabledException e) {
            Map<String, Object> err = new HashMap<>();
            err.put("message", "Compte inactif ou expiré");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("message", "Erreur d'authentification: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }
    }

    public static class LoginRequest {
        private String email;
        private String password;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}