package com.cdc.CDCApplication.service;

import com.cdc.CDCApplication.dto.ProfilDto;
import com.cdc.CDCApplication.entity.Utilisateur;
import com.cdc.CDCApplication.repository.UtilisateurRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class ProfilService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder       passwordEncoder;

    public ProfilService(UtilisateurRepository utilisateurRepository,
                          PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder       = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public ProfilDto.Response getProfil(String email) {
        return toResponse(utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable")));
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
            throw new RuntimeException("Minimum 8 caracteres.");
        u.setMotDePasse(passwordEncoder.encode(req.getNouveauMotDePasse()));
        utilisateurRepository.save(u);
    }

    /** Stocke la photo en BLOB directement en base */
    public String uploadPhoto(String email, MultipartFile file) throws Exception {
        if (file == null || file.isEmpty())
            throw new RuntimeException("Fichier vide.");
        String ct = file.getContentType();
        if (ct == null || !ct.startsWith("image/"))
            throw new RuntimeException("Le fichier doit etre une image.");

        Utilisateur u = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        u.setPhotoData(file.getBytes());
        u.setPhotoTypeContenu(ct);
        utilisateurRepository.saveAndFlush(u);
        return "/api/profil/photo";
    }

    @Transactional(readOnly = true)
    public byte[] getPhoto(String email) {
        Utilisateur u = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        if (u.getPhotoData() == null || u.getPhotoData().length == 0)
            throw new RuntimeException("Aucune photo.");
        return u.getPhotoData();
    }

    @Transactional(readOnly = true)
    public String getPhotoContentType(String email) {
        Utilisateur u = utilisateurRepository.findByEmail(email).orElse(null);
        if (u == null || u.getPhotoTypeContenu() == null) return "image/jpeg";
        return u.getPhotoTypeContenu();
    }

    public void supprimerPhoto(String email) {
        Utilisateur u = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        u.setPhotoData(null);
        u.setPhotoTypeContenu(null);
        utilisateurRepository.saveAndFlush(u);
    }

    private ProfilDto.Response toResponse(Utilisateur u) {
        ProfilDto.Response r = new ProfilDto.Response();
        r.setId(u.getId()); r.setNom(u.getNom()); r.setPrenom(u.getPrenom());
        r.setEmail(u.getEmail()); r.setActif(u.getActif());
        r.setCompteConfigure(u.getCompteConfigure());
        r.setDateExpiration(u.getDateExpiration());
        if (u.getPhotoData() != null && u.getPhotoData().length > 0)
            r.setPhotoUrl("/api/profil/photo");
        return r;
    }
}