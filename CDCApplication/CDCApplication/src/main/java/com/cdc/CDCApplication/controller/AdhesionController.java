package com.cdc.CDCApplication.controller;

import com.cdc.CDCApplication.dto.AdhesionDto;
import com.cdc.CDCApplication.service.AdhesionService;
import com.cdc.CDCApplication.service.ListeCotisationService;
import com.cdc.CDCApplication.service.RecuPaiementService;
import com.cdc.CDCApplication.service.RelanceService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/adhesions")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
                RequestMethod.DELETE, RequestMethod.OPTIONS})
public class AdhesionController {

    private final AdhesionService       adhesionService;
    private final RecuPaiementService   recuService;
    private final ListeCotisationService listeService;
    private final RelanceService        relanceService;

    public AdhesionController(AdhesionService adhesionService,
                               RecuPaiementService recuService,
                               ListeCotisationService listeService,
                               RelanceService relanceService) {
        this.adhesionService = adhesionService;
        this.recuService     = recuService;
        this.listeService    = listeService;
        this.relanceService  = relanceService;
    }

    @GetMapping
    public ResponseEntity<List<AdhesionDto.Response>> findAll() {
        return ResponseEntity.ok(adhesionService.findAll());
    }

    // Route self-service adhérent — /adherent/moi évite le conflit Spring avec /{id}
    @GetMapping("/adherent/moi")
    public ResponseEntity<List<AdhesionDto.Response>> mesAdhesions() {
        return ResponseEntity.ok(adhesionService.findMesAdhesions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdhesionDto.Response> findById(@PathVariable Long id) {
        return ResponseEntity.ok(adhesionService.findById(id));
    }

    @GetMapping("/adherent/{adherentId}")
    public ResponseEntity<List<AdhesionDto.Response>> findByAdherent(@PathVariable Long adherentId) {
        return ResponseEntity.ok(adhesionService.findByAdherent(adherentId));
    }

    @GetMapping("/annee/{annee}")
    public ResponseEntity<List<AdhesionDto.Response>> findByAnnee(@PathVariable Integer annee) {
        return ResponseEntity.ok(adhesionService.findByAnnee(annee));
    }

    @PostMapping
    public ResponseEntity<AdhesionDto.Response> creer(@RequestBody AdhesionDto.Request dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adhesionService.creer(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdhesionDto.Response> modifier(@PathVariable Long id,
                                                          @RequestBody AdhesionDto.Request dto) {
        return ResponseEntity.ok(adhesionService.modifier(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        adhesionService.supprimer(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/recu")
    public ResponseEntity<byte[]> genererRecu(@PathVariable Long id) {
        try {
            byte[] pdf = recuService.genererRecu(id);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"recu-" + id + ".pdf\"")
                    .contentType(MediaType.APPLICATION_PDF).body(pdf);
        } catch (Exception e) { throw new RuntimeException("Erreur recu: " + e.getMessage(), e); }
    }

    @GetMapping("/liste-pdf")
    public ResponseEntity<byte[]> genererListe(
            @RequestParam(required = false) Integer annee,
            @RequestParam(required = false) Long categorieId,
            @RequestParam(required = false) String statut) {
        try {
            byte[] pdf = listeService.genererListe(annee, categorieId, statut);
            String fn = "cotisations-" + (annee != null ? annee : "toutes") + ".pdf";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fn + "\"")
                    .contentType(MediaType.APPLICATION_PDF).body(pdf);
        } catch (Exception e) { throw new RuntimeException("Erreur liste: " + e.getMessage(), e); }
    }

    @GetMapping("/non-regularises")
    public ResponseEntity<List<Map<String, Object>>> getNonRegularises(
            @RequestParam(required = false) Integer annee) {
        return ResponseEntity.ok(relanceService.getAdherentsNonRegularises(annee));
    }

    @PostMapping("/relance/{adherentId}")
    public ResponseEntity<Map<String, String>> envoyerRelance(
            @PathVariable Long adherentId,
            @RequestParam(required = false) Integer annee) {
        relanceService.envoyerRelance(adherentId, annee);
        return ResponseEntity.ok(Map.of("message", "Email de relance envoye."));
    }

    @PostMapping("/relance-masse")
    public ResponseEntity<Map<String, Object>> envoyerRelanceMasse(
            @RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<Integer> ids = (List<Integer>) body.get("adherentIds");
        Integer annee = body.get("annee") != null ? (Integer) body.get("annee") : null;
        return ResponseEntity.ok(relanceService.envoyerRelanceMasse(
            ids.stream().map(Integer::longValue).toList(), annee));
    }
}