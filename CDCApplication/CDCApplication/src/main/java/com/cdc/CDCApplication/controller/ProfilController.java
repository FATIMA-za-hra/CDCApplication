package com.cdc.CDCApplication.controller;

import com.cdc.CDCApplication.dto.ProfilDto;
import com.cdc.CDCApplication.service.MotDePasseOublieService;
import com.cdc.CDCApplication.service.ProfilService;
import com.cdc.CDCApplication.security.JwtUtil;
import com.cdc.CDCApplication.entity.Privilege;
import com.cdc.CDCApplication.entity.Role;
import com.cdc.CDCApplication.entity.Utilisateur;
import com.cdc.CDCApplication.repository.UtilisateurRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "http://localhost:5173", methods = {
    RequestMethod.GET, RequestMethod.POST,
    RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS
})
public class ProfilController {

    private final ProfilService profilService;
    private final MotDePasseOublieService mdpOublieService;

    public ProfilController(ProfilService profilService,
                             MotDePasseOublieService mdpOublieService) {
        this.profilService = profilService;
        this.mdpOublieService = mdpOublieService;
    }

    // ── MOT DE PASSE OUBLIÉ (public) ──
    @PostMapping("/api/auth/mot-de-passe-oublie")
    public ResponseEntity<Map<String, String>> motDePasseOublie(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email obligatoire."));
        }
        try {
            mdpOublieService.demanderReinit(email.trim());
            return ResponseEntity.ok(Map.of("message",
                "Un email de réinitialisation a été envoyé à " + email));
        } catch (Exception e) {
            
            return ResponseEntity.ok(Map.of("message",
                "Si cet email est associé à un compte, vous recevrez un lien de réinitialisation."));
        }
    }

    // ── PROFIL : Lire ──
    @GetMapping("/api/profil")
    public ResponseEntity<ProfilDto.Response> getProfil(Authentication auth) {
        return ResponseEntity.ok(profilService.getProfil(auth.getName()));
    }

    // ── PROFIL : Changer email ──
    @PutMapping("/api/profil/email")
    public ResponseEntity<ProfilDto.Response> changerEmail(
            Authentication auth,
            @RequestBody ProfilDto.ChangerEmailRequest req) {
        return ResponseEntity.ok(profilService.changerEmail(auth.getName(), req.getNouvelEmail()));
    }

    // ── PROFIL : Changer mot de passe ──
    @PutMapping("/api/profil/mot-de-passe")
    public ResponseEntity<Map<String, String>> changerMotDePasse(
            Authentication auth,
            @RequestBody ProfilDto.ChangerMdpRequest req) {
        profilService.changerMotDePasse(auth.getName(), req);
        return ResponseEntity.ok(Map.of("message", "Mot de passe modifié avec succès."));
    }

    // ── PROFIL : Upload photo ──
    @PostMapping("/api/profil/photo")
    public ResponseEntity<Map<String, String>> uploadPhoto(
            Authentication auth,
            @RequestParam("file") MultipartFile file) {
        try {
            String url = profilService.uploadPhoto(auth.getName(), file);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (Exception e) {
            throw new RuntimeException("Erreur upload photo: " + e.getMessage(), e);
        }
    }

    // ── PROFIL : Voir photo ──
    @GetMapping("/api/profil/photo")
    public ResponseEntity<byte[]> getPhoto(Authentication auth) {
        try {
            byte[] data = profilService.getPhoto(auth.getName());
            String ct = profilService.getPhotoContentType(auth.getName());
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(ct))
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}