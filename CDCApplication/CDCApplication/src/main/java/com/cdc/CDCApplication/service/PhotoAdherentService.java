package com.cdc.CDCApplication.service;

import com.cdc.CDCApplication.entity.Adherent;
import com.cdc.CDCApplication.repository.AdherentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
@Transactional
public class PhotoAdherentService {

    private final AdherentRepository adherentRepository;

    @Value("${app.photos.dir:./uploads/photos-adherents}")
    private String photosDir;

    public PhotoAdherentService(AdherentRepository adherentRepository) {
        this.adherentRepository = adherentRepository;
    }

    public String uploadPhoto(Long adherentId, MultipartFile file) throws IOException {
        // Vérification type MIME
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Le fichier doit être une image (JPEG, PNG, GIF).");
        }

        Adherent a = adherentRepository.findById(adherentId)
                .orElseThrow(() -> new RuntimeException("Adherent introuvable: " + adherentId));

        // Créer le dossier si nécessaire
        Path dir = Paths.get(photosDir);
        Files.createDirectories(dir);

        // Supprimer l'ancienne photo
        if (a.getPhotoChemin() != null) {
            try { Files.deleteIfExists(Paths.get(a.getPhotoChemin())); }
            catch (Exception ignored) {}
        }

        // Déterminer l'extension
        String ext = ".jpg";
        String orig = file.getOriginalFilename();
        if (orig != null && orig.contains(".")) {
            ext = orig.substring(orig.lastIndexOf(".")).toLowerCase();
        }

        // Nom unique
        String nom = "adh-" + adherentId + "-" + UUID.randomUUID().toString().substring(0, 8) + ext;
        Path chemin = dir.resolve(nom);

        // Copier le fichier
        Files.copy(file.getInputStream(), chemin, StandardCopyOption.REPLACE_EXISTING);

        // Mettre à jour en base
        a.setPhotoChemin(chemin.toAbsolutePath().toString());
        adherentRepository.save(a);

        return "/api/adherents/" + adherentId + "/photo";
    }

    public byte[] getPhoto(Long adherentId) throws IOException {
        Adherent a = adherentRepository.findById(adherentId)
                .orElseThrow(() -> new RuntimeException("Adherent introuvable: " + adherentId));
        if (a.getPhotoChemin() == null || a.getPhotoChemin().isBlank()) {
            throw new RuntimeException("Aucune photo pour cet adherent.");
        }
        Path path = Paths.get(a.getPhotoChemin());
        if (!Files.exists(path)) {
            throw new RuntimeException("Fichier photo introuvable sur le disque.");
        }
        return Files.readAllBytes(path);
    }

    public String getContentType(Long adherentId) {
        Adherent a = adherentRepository.findById(adherentId).orElse(null);
        if (a == null || a.getPhotoChemin() == null) return "image/jpeg";
        String p = a.getPhotoChemin().toLowerCase();
        if (p.endsWith(".png"))  return "image/png";
        if (p.endsWith(".gif"))  return "image/gif";
        if (p.endsWith(".webp")) return "image/webp";
        return "image/jpeg";
    }

    public void supprimerPhoto(Long adherentId) throws IOException {
        Adherent a = adherentRepository.findById(adherentId)
                .orElseThrow(() -> new RuntimeException("Adherent introuvable: " + adherentId));
        if (a.getPhotoChemin() != null) {
            try { Files.deleteIfExists(Paths.get(a.getPhotoChemin())); }
            catch (Exception ignored) {}
            a.setPhotoChemin(null);
            adherentRepository.save(a);
        }
    }
}