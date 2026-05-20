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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil               jwtUtil;
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder       passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager,
                           JwtUtil jwtUtil,
                           UtilisateurRepository utilisateurRepository,
                           PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil               = jwtUtil;
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder       = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email    = body.get("email");
        String password = body.get("password");

        if (email == null || password == null)
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Email et mot de passe requis."));

        try {
            Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));

            Utilisateur u = utilisateurRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

            List<String> roles      = new ArrayList<>();
            List<String> privileges = new ArrayList<>();
            boolean isAdmin = false;

            for (Role r : u.getRoles()) {
                roles.add(r.getNom());
                String rNom = r.getNom().toUpperCase();
                if (rNom.equals("ADMIN") || rNom.equals("ADMINISTRATEUR")) isAdmin = true;
                for (Privilege p : r.getPrivileges())
                    privileges.add(p.getNom());
            }

            // ← genererToken (méthode française, cohérente avec votre JwtUtil)
            String token = jwtUtil.genererToken(email);

            Map<String, Object> response = new HashMap<>();
            response.put("token",      token);
            response.put("email",      u.getEmail());
            response.put("nom",        u.getNom());
            response.put("prenom",     u.getPrenom());
            response.put("roles",      roles);
            response.put("privileges", privileges);
            response.put("isAdmin",    isAdmin);

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Email ou mot de passe incorrect."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/reinitialiser-mot-de-passe")
    public ResponseEntity<?> reinitialiserMotDePasse(@RequestBody Map<String, String> body) {
        String token      = body.get("token");
        String nouveauMdp = body.get("nouveauMotDePasse");

        if (token == null || nouveauMdp == null)
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Token et mot de passe requis."));
        if (nouveauMdp.length() < 8)
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Le mot de passe doit contenir au moins 8 caractères."));

        Utilisateur u = utilisateurRepository.findByTokenResetMdp(token).orElse(null);

        if (u == null)
            return ResponseEntity.badRequest().body(Map.of("message", "Token invalide."));
        if (u.getTokenExpiry() != null && u.getTokenExpiry().isBefore(LocalDateTime.now()))
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Ce lien a expiré. Faites une nouvelle demande."));

        u.setMotDePasse(passwordEncoder.encode(nouveauMdp));
        u.setTokenResetMdp(null);
        u.setTokenExpiry(null);
        u.setCompteConfigure(true);
        utilisateurRepository.save(u);

        return ResponseEntity.ok(Map.of("message", "Mot de passe modifié avec succès."));
    }
}