package com.cdc.CDCApplication.controller;

import com.cdc.CDCApplication.dto.AideDto;
import com.cdc.CDCApplication.service.AideService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

@RestController
@RequestMapping("/api/aides")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
                RequestMethod.DELETE, RequestMethod.OPTIONS, RequestMethod.PATCH})
public class AideController {

    private final AideService aideService;
    public AideController(AideService aideService) { this.aideService = aideService; }

    // Toutes les demandes (admin/agent)
    @GetMapping
    public ResponseEntity<List<AideDto.Response>> findAll() {
        return ResponseEntity.ok(aideService.findAll());
    }

    // Mes demandes — adhérent connecté (adherentId déduit depuis le compte)
    @GetMapping("/mes-demandes")
    public ResponseEntity<List<AideDto.Response>> mesDemandes() {
        return ResponseEntity.ok(aideService.findMesDemandes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AideDto.Response> findById(@PathVariable Long id) {
        return ResponseEntity.ok(aideService.findById(id));
    }

    @GetMapping("/adherent/{adherentId}")
    public ResponseEntity<List<AideDto.Response>> findByAdherent(@PathVariable Long adherentId) {
        return ResponseEntity.ok(aideService.findByAdherent(adherentId));
    }

    // Déposer une demande :
    //   - Admin/agent → body contient adherentId
    //   - Adhérent connecté → adherentId = null, déduit depuis le JWT
    @PostMapping
    public ResponseEntity<AideDto.Response> deposer(@RequestBody AideDto.Request dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(aideService.deposer(dto));
    }

    @PatchMapping("/{id}/annuler")
    public ResponseEntity<AideDto.Response> annuler(@PathVariable Long id) {
        return ResponseEntity.ok(aideService.annuler(id));
    }

    @PostMapping("/{id}/decision/agent-bureau")
    public ResponseEntity<AideDto.Response> decisionAgentBureau(
            @PathVariable Long id, @RequestBody AideDto.DecisionRequest req) {
        return ResponseEntity.ok(aideService.decisionAgentBureau(id, req));
    }

    @PostMapping("/{id}/decision/president")
    public ResponseEntity<AideDto.Response> decisionPresident(
            @PathVariable Long id, @RequestBody AideDto.DecisionRequest req) {
        return ResponseEntity.ok(aideService.decisionPresident(id, req));
    }

    @PostMapping("/{id}/virement")
    public ResponseEntity<AideDto.Response> enregistrerVirement(
            @PathVariable Long id, @RequestBody AideDto.VirementRequest req) {
        return ResponseEntity.ok(aideService.enregistrerVirement(id, req));
    }

    @PostMapping(value = "/{id}/pieces", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadPiece(
            @PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try { return ResponseEntity.ok(aideService.uploadPiece(id, file)); }
        catch (Exception e) { throw new RuntimeException("Erreur upload: " + e.getMessage(), e); }
    }

    @GetMapping("/{id}/pieces")
    public ResponseEntity<List<Map<String, String>>> listPieces(@PathVariable Long id) {
        try { return ResponseEntity.ok(aideService.listPieces(id)); }
        catch (Exception e) { return ResponseEntity.ok(new ArrayList<>()); }
    }

    @GetMapping("/{id}/pieces/{nom}/telecharger")
    public ResponseEntity<byte[]> telechargerPiece(
            @PathVariable Long id, @PathVariable String nom) {
        try {
            byte[] data = aideService.telechargerPiece(id, nom);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nom + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM).body(data);
        } catch (Exception e) { throw new RuntimeException(e); }
    }

    @DeleteMapping("/{id}/pieces/{nom}")
    public ResponseEntity<Void> supprimerPiece(
            @PathVariable Long id, @PathVariable String nom) {
        try { aideService.supprimerPiece(id, nom); return ResponseEntity.noContent().build(); }
        catch (Exception e) { throw new RuntimeException(e); }
    }
}