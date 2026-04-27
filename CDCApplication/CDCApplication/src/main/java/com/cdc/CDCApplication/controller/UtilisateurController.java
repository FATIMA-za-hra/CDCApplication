package com.cdc.CDCApplication.controller;

import com.cdc.CDCApplication.dto.UtilisateurDto;
import com.cdc.CDCApplication.service.UtilisateurService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/utilisateurs")
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    public UtilisateurController(UtilisateurService utilisateurService) {
        this.utilisateurService = utilisateurService;
    }

    @GetMapping
    public ResponseEntity<List<UtilisateurDto.Response>> findAll() {
        return ResponseEntity.ok(utilisateurService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UtilisateurDto.Response> findById(@PathVariable Long id) {
        return ResponseEntity.ok(utilisateurService.findById(id));
    }

    @PostMapping
    public ResponseEntity<UtilisateurDto.Response> creer(@RequestBody UtilisateurDto.Request dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(utilisateurService.creer(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UtilisateurDto.Response> modifier(@PathVariable Long id,
                                                             @RequestBody UtilisateurDto.Request dto) {
        return ResponseEntity.ok(utilisateurService.modifier(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        utilisateurService.supprimer(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/notifier")
    public ResponseEntity<Map<String, String>> notifier(@PathVariable Long id) {
        utilisateurService.notifierUtilisateur(id);
        Map<String, String> resp = new HashMap<>();
        resp.put("message", "Email de notification envoye avec succes.");
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/configurer-mdp")
    public ResponseEntity<Map<String, String>> configurerMotDePasse(@RequestBody UtilisateurDto.PasswordSetRequest dto) {
        utilisateurService.configurerMotDePasse(dto);
        Map<String, String> resp = new HashMap<>();
        resp.put("message", "Mot de passe configure avec succes.");
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/valider-token")
    public ResponseEntity<Map<String, Boolean>> validerToken(@RequestParam String token) {
        Map<String, Boolean> resp = new HashMap<>();
        resp.put("valide", utilisateurService.validerToken(token));
        return ResponseEntity.ok(resp);
    }
}