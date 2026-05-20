package com.cdc.CDCApplication.controller;

import com.cdc.CDCApplication.dto.ProfilDto;
import com.cdc.CDCApplication.service.MotDePasseOublieService;
import com.cdc.CDCApplication.service.ProfilService;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*",
    methods = { RequestMethod.GET, RequestMethod.POST,
                RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS })
public class ProfilController {

    private final ProfilService          profilService;
    private final MotDePasseOublieService mdpOublieService;

    public ProfilController(ProfilService profilService,
                             MotDePasseOublieService mdpOublieService) {
        this.profilService    = profilService;
        this.mdpOublieService = mdpOublieService;
    }

    // ── Mot de passe oublié (route publique) ──
    @PostMapping("/api/auth/mot-de-passe-oublie")
    public ResponseEntity<Map<String, String>> motDePasseOublie(
            @RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Email obligatoire."));
        try { mdpOublieService.demanderReinit(email.trim()); }
        catch (Exception ignored) {} // ne pas révéler si l'email existe
        return ResponseEntity.ok(Map.of("message",
            "Si cet email est associe a un compte, vous recevrez un lien de reinitialisation."));
    }

    // ── GET profil ──
    @GetMapping("/api/profil")
    public ResponseEntity<ProfilDto.Response> getProfil(Authentication auth) {
        return ResponseEntity.ok(profilService.getProfil(auth.getName()));
    }

    // ── Changer email ──
    @PutMapping("/api/profil/email")
    public ResponseEntity<ProfilDto.Response> changerEmail(
            Authentication auth, @RequestBody ProfilDto.ChangerEmailRequest req) {
        return ResponseEntity.ok(profilService.changerEmail(auth.getName(), req.getNouvelEmail()));
    }

    // ── Changer mot de passe ──
    @PutMapping("/api/profil/mot-de-passe")
    public ResponseEntity<Map<String, String>> changerMotDePasse(
            Authentication auth, @RequestBody ProfilDto.ChangerMdpRequest req) {
        profilService.changerMotDePasse(auth.getName(), req);
        return ResponseEntity.ok(Map.of("message", "Mot de passe modifie avec succes."));
    }

    // ── Upload photo ──
    @PostMapping(value = "/api/profil/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadPhoto(
            Authentication auth, @RequestParam("file") MultipartFile file) {
        try {
            String url = profilService.uploadPhoto(auth.getName(), file);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (Exception e) {
            throw new RuntimeException("Erreur upload: " + e.getMessage(), e);
        }
    }

    // ── GET photo — retourne 404 si pas de photo (jamais 500) ──
    @GetMapping("/api/profil/photo")
    public ResponseEntity<byte[]> getPhoto(Authentication auth) {
        try {
            byte[] data = profilService.getPhoto(auth.getName());
            String ct   = profilService.getPhotoContentType(auth.getName());
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(ct))
                    .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                    .header(HttpHeaders.PRAGMA, "no-cache")
                    .header(HttpHeaders.EXPIRES, "0")
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ── Supprimer photo ──
    @DeleteMapping("/api/profil/photo")
    public ResponseEntity<Void> supprimerPhoto(Authentication auth) {
        try {
            profilService.supprimerPhoto(auth.getName());
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}