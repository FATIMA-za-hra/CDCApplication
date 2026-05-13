package com.cdc.CDCApplication.service;

import com.cdc.CDCApplication.dto.PieceJustificativeDto;
import com.cdc.CDCApplication.entity.Adherent;
import com.cdc.CDCApplication.entity.PieceJustificative;
import com.cdc.CDCApplication.repository.AdherentRepository;
import com.cdc.CDCApplication.repository.PieceJustificativeRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PieceJustificativeService {

    private final PieceJustificativeRepository pieceRepository;
    private final AdherentRepository adherentRepository;

    @Value("${app.upload.dir:./uploads/pieces-justificatives}")
    private String uploadDir;

    public PieceJustificativeService(PieceJustificativeRepository pieceRepository,
                                      AdherentRepository adherentRepository) {
        this.pieceRepository = pieceRepository;
        this.adherentRepository = adherentRepository;
    }

    public PieceJustificativeDto.Response upload(Long adherentId, MultipartFile file, String typePiece) throws IOException {
        Adherent adherent = adherentRepository.findById(adherentId)
                .orElseThrow(() -> new RuntimeException("Adhérent introuvable: " + adherentId));

        // Créer le dossier si inexistant
        Path dir = Paths.get(uploadDir, String.valueOf(adherentId));
        Files.createDirectories(dir);

        // Nom unique pour éviter les collisions
        String extension = "";
        String originalName = file.getOriginalFilename();
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }
        String nomFichier = UUID.randomUUID().toString() + extension;
        Path chemin = dir.resolve(nomFichier);
        Files.copy(file.getInputStream(), chemin, StandardCopyOption.REPLACE_EXISTING);

        // Récupérer l'utilisateur connecté
        String utilisateurConnecte = "";
        try {
            utilisateurConnecte = SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception ignored) {}

        PieceJustificative piece = new PieceJustificative();
        piece.setAdherent(adherent);
        piece.setNom(originalName);
        piece.setTypePiece(typePiece != null ? typePiece : "Autre");
        piece.setCheminFichier(chemin.toString());
        piece.setTypeContenu(file.getContentType());
        piece.setTailleOctets(file.getSize());
        piece.setDateAjout(LocalDateTime.now());
        piece.setAjoutePar(utilisateurConnecte);

        return toResponse(pieceRepository.save(piece));
    }

    public byte[] telecharger(Long pieceId) throws IOException {
        PieceJustificative piece = pieceRepository.findById(pieceId)
                .orElseThrow(() -> new RuntimeException("Pièce introuvable: " + pieceId));
        return Files.readAllBytes(Paths.get(piece.getCheminFichier()));
    }

    public String getTypeContenu(Long pieceId) {
        PieceJustificative piece = pieceRepository.findById(pieceId)
                .orElseThrow(() -> new RuntimeException("Pièce introuvable: " + pieceId));
        return piece.getTypeContenu();
    }

    public String getNomFichier(Long pieceId) {
        PieceJustificative piece = pieceRepository.findById(pieceId)
                .orElseThrow(() -> new RuntimeException("Pièce introuvable: " + pieceId));
        return piece.getNom();
    }

    public void supprimer(Long pieceId) throws IOException {
        PieceJustificative piece = pieceRepository.findById(pieceId)
                .orElseThrow(() -> new RuntimeException("Pièce introuvable: " + pieceId));
        Files.deleteIfExists(Paths.get(piece.getCheminFichier()));
        pieceRepository.delete(piece);
    }

    @Transactional(readOnly = true)
    public List<PieceJustificativeDto.Response> findByAdherent(Long adherentId) {
        List<PieceJustificativeDto.Response> list = new ArrayList<>();
        for (PieceJustificative p : pieceRepository.findByAdherentIdOrderByDateAjoutDesc(adherentId)) {
            list.add(toResponse(p));
        }
        return list;
    }

    private PieceJustificativeDto.Response toResponse(PieceJustificative p) {
        PieceJustificativeDto.Response r = new PieceJustificativeDto.Response();
        r.setId(p.getId());
        r.setNom(p.getNom());
        r.setTypePiece(p.getTypePiece());
        r.setTypeContenu(p.getTypeContenu());
        r.setTailleOctets(p.getTailleOctets());
        r.setDateAjout(p.getDateAjout());
        r.setAjoutePar(p.getAjoutePar());
        return r;
    }
}