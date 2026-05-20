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
    private final AdherentRepository           adherentRepository;

    @Value("${app.upload.dir:./uploads/pieces-justificatives}")
    private String uploadDir;

    public PieceJustificativeService(PieceJustificativeRepository pieceRepository,
                                      AdherentRepository adherentRepository) {
        this.pieceRepository    = pieceRepository;
        this.adherentRepository = adherentRepository;
    }

    @Transactional(readOnly = true)
    public List<PieceJustificativeDto.Response> findByAdherent(Long adherentId) {
        List<PieceJustificativeDto.Response> list = new ArrayList<>();
        for (PieceJustificative p : pieceRepository.findByAdherentId(adherentId))
            list.add(toDto(p));
        return list;
    }

    public PieceJustificativeDto.Response upload(Long adherentId, MultipartFile file,
                                                   String typePiece) throws IOException {
        if (file == null || file.isEmpty())
            throw new RuntimeException("Fichier vide.");

        Adherent adherent = adherentRepository.findById(adherentId)
                .orElseThrow(() -> new RuntimeException("Adherent introuvable: " + adherentId));

        // Créer le dossier par adhérent
        Path dir = Paths.get(uploadDir, String.valueOf(adherentId));
        Files.createDirectories(dir);

        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains("."))
            extension = originalName.substring(originalName.lastIndexOf("."));
        String nomFichier = UUID.randomUUID() + extension;
        Path chemin = dir.resolve(nomFichier);
        Files.copy(file.getInputStream(), chemin, StandardCopyOption.REPLACE_EXISTING);

        String utilisateur = "";
        try { utilisateur = SecurityContextHolder.getContext().getAuthentication().getName(); }
        catch (Exception ignored) {}

        PieceJustificative piece = new PieceJustificative();
        piece.setAdherent(adherent);
        piece.setNom(originalName != null ? originalName : nomFichier);
        piece.setTypePiece(typePiece != null ? typePiece : "Autre");
        piece.setCheminFichier(chemin.toAbsolutePath().toString());
        piece.setTypeContenu(file.getContentType() != null ? file.getContentType() : "application/octet-stream");
        piece.setTailleOctets(file.getSize());
        piece.setDateAjout(LocalDateTime.now());
        piece.setAjoutePar(utilisateur);

        return toDto(pieceRepository.save(piece));
    }

    @Transactional(readOnly = true)
    public byte[] telecharger(Long pieceId) throws IOException {
        PieceJustificative p = pieceRepository.findById(pieceId)
                .orElseThrow(() -> new RuntimeException("Piece introuvable"));
        Path chemin = Paths.get(p.getCheminFichier());
        if (!Files.exists(chemin))
            throw new RuntimeException("Fichier introuvable sur le serveur.");
        return Files.readAllBytes(chemin);
    }

    @Transactional(readOnly = true)
    public String getTypeContenu(Long pieceId) {
        return pieceRepository.findById(pieceId)
                .map(PieceJustificative::getTypeContenu)
                .orElse("application/octet-stream");
    }

    @Transactional(readOnly = true)
    public String getNomFichier(Long pieceId) {
        return pieceRepository.findById(pieceId)
                .map(PieceJustificative::getNom)
                .orElse("piece");
    }

    public void supprimer(Long pieceId) throws IOException {
        PieceJustificative p = pieceRepository.findById(pieceId)
                .orElseThrow(() -> new RuntimeException("Piece introuvable"));
        // Supprimer le fichier physique
        try { Files.deleteIfExists(Paths.get(p.getCheminFichier())); }
        catch (Exception ignored) {}
        pieceRepository.deleteById(pieceId);
    }

    private PieceJustificativeDto.Response toDto(PieceJustificative p) {
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