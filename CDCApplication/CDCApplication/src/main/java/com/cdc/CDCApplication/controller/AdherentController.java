package com.cdc.CDCApplication.controller;

import com.cdc.CDCApplication.dto.*;
import com.cdc.CDCApplication.service.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/adherents")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*",
    methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
                RequestMethod.DELETE, RequestMethod.OPTIONS, RequestMethod.PATCH })
public class AdherentController {

    private final AdherentService adherentService;
    private final EnfantService enfantService;
    private final PieceJustificativeService pieceService;
    private final HistoriqueService historiqueService;
    private final FicheAdherentPdfService pdfService;
    private final PhotoAdherentService photoService;

    public AdherentController(AdherentService adherentService,
                               EnfantService enfantService,
                               PieceJustificativeService pieceService,
                               HistoriqueService historiqueService,
                               FicheAdherentPdfService pdfService,
                               PhotoAdherentService photoService) {
        this.adherentService   = adherentService;
        this.enfantService     = enfantService;
        this.pieceService      = pieceService;
        this.historiqueService = historiqueService;
        this.pdfService        = pdfService;
        this.photoService      = photoService;
    }

    // ── CRUD ──
    @GetMapping
    public ResponseEntity<List<AdherentDto.Response>> findAll() {
        return ResponseEntity.ok(adherentService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdherentDto.Response> findById(@PathVariable Long id) {
        return ResponseEntity.ok(adherentService.findById(id));
    }

    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<AdherentDto.Response>> findByStatut(@PathVariable String statut) {
        return ResponseEntity.ok(adherentService.findByStatut(statut));
    }

    @PostMapping
    public ResponseEntity<AdherentDto.Response> creer(@RequestBody AdherentDto.Request dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adherentService.creer(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdherentDto.Response> modifier(@PathVariable Long id,
                                                          @RequestBody AdherentDto.Request dto) {
        return ResponseEntity.ok(adherentService.modifier(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        adherentService.supprimer(id);
        return ResponseEntity.noContent().build();
    }

    // ── PHOTO ──
    // Retourne 404 proprement si pas de photo — évite l'erreur console côté frontend
    @GetMapping("/{id}/photo")
    public ResponseEntity<byte[]> getPhoto(@PathVariable Long id) {
        try {
            byte[] data = photoService.getPhoto(id);
            String ct = photoService.getContentType(id);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(ct))
                    .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store")
                    .header(HttpHeaders.PRAGMA, "no-cache")
                    .body(data);
        } catch (Exception e) {
            // Aucune photo → 404 silencieux
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping(value = "/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadPhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Le fichier est vide."));
            }
            String url = photoService.uploadPhoto(id, file);
            Map<String, String> resp = new HashMap<>();
            resp.put("url", url);
            resp.put("message", "Photo mise a jour.");
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Erreur upload: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    @DeleteMapping("/{id}/photo")
    public ResponseEntity<Void> supprimerPhoto(@PathVariable Long id) {
        try { photoService.supprimerPhoto(id); return ResponseEntity.noContent().build(); }
        catch (Exception e) { return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); }
    }

    // ── ENFANTS ──
    @GetMapping("/{id}/enfants")
    public ResponseEntity<List<EnfantDto.Response>> getEnfants(@PathVariable Long id) {
        return ResponseEntity.ok(enfantService.findByAdherent(id));
    }

    @PostMapping("/{id}/enfants")
    public ResponseEntity<List<EnfantDto.Response>> sauvegarderEnfants(
            @PathVariable Long id, @RequestBody List<EnfantDto.Request> enfants) {
        return ResponseEntity.ok(enfantService.sauvegarderEnfants(id, enfants));
    }

    // ── PIÈCES JUSTIFICATIVES ──
    @GetMapping("/{id}/pieces")
    public ResponseEntity<List<PieceJustificativeDto.Response>> getPieces(@PathVariable Long id) {
        return ResponseEntity.ok(pieceService.findByAdherent(id));
    }

    @PostMapping(value = "/{id}/pieces", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PieceJustificativeDto.Response> uploadPiece(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "typePiece", defaultValue = "Autre") String typePiece) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(pieceService.upload(id, file, typePiece));
        } catch (Exception e) {
            throw new RuntimeException("Erreur upload: " + e.getMessage(), e);
        }
    }

    @GetMapping("/pieces/{pieceId}/telecharger")
    public ResponseEntity<byte[]> telechargerPiece(@PathVariable Long pieceId) {
        try {
            byte[] data = pieceService.telecharger(pieceId);
            String ct   = pieceService.getTypeContenu(pieceId);
            String nom  = pieceService.getNomFichier(pieceId);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nom + "\"")
                    .contentType(MediaType.parseMediaType(ct != null ? ct : "application/octet-stream"))
                    .body(data);
        } catch (Exception e) {
            throw new RuntimeException("Erreur telechargement: " + e.getMessage(), e);
        }
    }

    @DeleteMapping("/pieces/{pieceId}")
    public ResponseEntity<Void> supprimerPiece(@PathVariable Long pieceId) {
        try { pieceService.supprimer(pieceId); return ResponseEntity.noContent().build(); }
        catch (Exception e) { throw new RuntimeException("Erreur suppression: " + e.getMessage(), e); }
    }

    // ── HISTORIQUE ──
    @GetMapping("/{id}/historique")
    public ResponseEntity<List<HistoriqueModificationDto.Response>> getHistorique(
            @PathVariable Long id) {
        return ResponseEntity.ok(historiqueService.findByAdherent(id));
    }

    // ── EXPORT PDF ──
    @GetMapping("/{id}/export-pdf")
    public ResponseEntity<byte[]> exporterPdf(@PathVariable Long id) {
        try {
            byte[] pdf = pdfService.genererFiche(id);
            AdherentDto.Response a = adherentService.findById(id);
            String filename = "fiche-" + a.getNumeroAdherent() + ".pdf";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            throw new RuntimeException("Erreur PDF: " + e.getMessage(), e);
        }
    }
}