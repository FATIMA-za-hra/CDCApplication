package com.cdc.CDCApplication.service;

import com.cdc.CDCApplication.dto.ProfilDto;
import com.cdc.CDCApplication.entity.Utilisateur;
import com.cdc.CDCApplication.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
@Transactional
public class ProfilService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.photos.utilisateurs.dir:./uploads/photos-utilisateurs}")
    private String photosDir;

    public ProfilService(UtilisateurRepository utilisateurRepository,
                          PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public ProfilDto.Response getProfil(String email) {
        Utilisateur u = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        return toResponse(u);
    }

    public ProfilDto.Response changerEmail(String emailActuel, String nouvelEmail) {
        if (nouvelEmail == null || nouvelEmail.isBlank())
            throw new RuntimeException("Le nouvel email est obligatoire.");
        if (utilisateurRepository.existsByEmail(nouvelEmail))
            throw new RuntimeException("Cet email est deja utilise.");
        Utilisateur u = utilisateurRepository.findByEmail(emailActuel)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        u.setEmail(nouvelEmail);
        return toResponse(utilisateurRepository.save(u));
    }

    public void changerMotDePasse(String email, ProfilDto.ChangerMdpRequest req) {
        Utilisateur u = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        if (!passwordEncoder.matches(req.getAncienMotDePasse(), u.getMotDePasse()))
            throw new RuntimeException("Mot de passe actuel incorrect.");
        if (!req.getNouveauMotDePasse().equals(req.getConfirmerMotDePasse()))
            throw new RuntimeException("Les nouveaux mots de passe ne correspondent pas.");
        if (req.getNouveauMotDePasse().length() < 8)
            throw new RuntimeException("Le mot de passe doit contenir au moins 8 caracteres.");
        u.setMotDePasse(passwordEncoder.encode(req.getNouveauMotDePasse()));
        utilisateurRepository.save(u);
    }

    public String uploadPhoto(String email, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty())
            throw new RuntimeException("Fichier vide.");
        if (!file.getContentType().startsWith("image/"))
            throw new RuntimeException("Le fichier doit etre une image.");

        Utilisateur u = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Path dir = Paths.get(photosDir);
        Files.createDirectories(dir);

        // Supprimer l'ancienne photo
        if (u.getPhotoChemin() != null) {
            try { Files.deleteIfExists(Paths.get(u.getPhotoChemin())); }
            catch (Exception ignored) {}
        }

        String ext = ".jpg";
        String orig = file.getOriginalFilename();
        if (orig != null && orig.contains("."))
            ext = orig.substring(orig.lastIndexOf(".")).toLowerCase();

        String nom = "user-" + u.getId() + "-" + UUID.randomUUID().toString().substring(0, 8) + ext;
        Path chemin = dir.resolve(nom);
        Files.copy(file.getInputStream(), chemin, StandardCopyOption.REPLACE_EXISTING);

        // Sauvegarder le chemin ABSOLU en base
        u.setPhotoChemin(chemin.toAbsolutePath().toString());
        utilisateurRepository.saveAndFlush(u);

        return "/api/profil/photo";
    }

    public byte[] getPhoto(String email) throws IOException {
        Utilisateur u = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        if (u.getPhotoChemin() == null || u.getPhotoChemin().isBlank())
            throw new RuntimeException("Aucune photo.");
        Path p = Paths.get(u.getPhotoChemin());
        if (!Files.exists(p))
            throw new RuntimeException("Fichier photo introuvable.");
        return Files.readAllBytes(p);
    }

    public String getPhotoContentType(String email) {
        Utilisateur u = utilisateurRepository.findByEmail(email).orElse(null);
        if (u == null || u.getPhotoChemin() == null) return "image/jpeg";
        String p = u.getPhotoChemin().toLowerCase();
        if (p.endsWith(".png")) return "image/png";
        if (p.endsWith(".gif")) return "image/gif";
        if (p.endsWith(".webp")) return "image/webp";
        return "image/jpeg";
    }

    private ProfilDto.Response toResponse(Utilisateur u) {
        ProfilDto.Response r = new ProfilDto.Response();
        r.setId(u.getId()); r.setNom(u.getNom()); r.setPrenom(u.getPrenom());
        r.setEmail(u.getEmail()); r.setActif(u.getActif());
        r.setCompteConfigure(u.getCompteConfigure());
        r.setDateExpiration(u.getDateExpiration());
        if (u.getPhotoChemin() != null) r.setPhotoUrl("/api/profil/photo");
        return r;
    }
}