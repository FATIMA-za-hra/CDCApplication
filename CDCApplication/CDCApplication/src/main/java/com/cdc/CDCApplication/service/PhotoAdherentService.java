package com.cdc.CDCApplication.service;

import com.cdc.CDCApplication.entity.Adherent;
import com.cdc.CDCApplication.repository.AdherentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class PhotoAdherentService {

    private final AdherentRepository adherentRepository;

    public PhotoAdherentService(AdherentRepository adherentRepository) {
        this.adherentRepository = adherentRepository;
    }

    /** Stocke la photo en BLOB directement en base — pas de fichier sur le serveur */
    public String uploadPhoto(Long adherentId, MultipartFile file) throws Exception {
        if (file == null || file.isEmpty())
            throw new RuntimeException("Fichier vide.");
        String ct = file.getContentType();
        if (ct == null || !ct.startsWith("image/"))
            throw new RuntimeException("Le fichier doit etre une image.");

        Adherent a = adherentRepository.findById(adherentId)
                .orElseThrow(() -> new RuntimeException("Adherent introuvable"));

        a.setPhotoData(file.getBytes());
        a.setPhotoTypeContenu(ct);
        adherentRepository.saveAndFlush(a);
        return "/api/adherents/" + adherentId + "/photo";
    }

    @Transactional(readOnly = true)
    public byte[] getPhoto(Long adherentId) {
        Adherent a = adherentRepository.findById(adherentId)
                .orElseThrow(() -> new RuntimeException("Adherent introuvable"));
        if (a.getPhotoData() == null || a.getPhotoData().length == 0)
            throw new RuntimeException("Aucune photo.");
        return a.getPhotoData();
    }

    @Transactional(readOnly = true)
    public String getContentType(Long adherentId) {
        Adherent a = adherentRepository.findById(adherentId).orElse(null);
        if (a == null || a.getPhotoTypeContenu() == null) return "image/jpeg";
        return a.getPhotoTypeContenu();
    }

    public void supprimerPhoto(Long adherentId) {
        Adherent a = adherentRepository.findById(adherentId)
                .orElseThrow(() -> new RuntimeException("Adherent introuvable"));
        a.setPhotoData(null);
        a.setPhotoTypeContenu(null);
        adherentRepository.saveAndFlush(a);
    }
}