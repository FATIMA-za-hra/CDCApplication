package com.cdc.CDCApplication.controller;

import com.cdc.CDCApplication.dto.VirementDto;
import com.cdc.CDCApplication.service.VirementService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/virements")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
                RequestMethod.DELETE, RequestMethod.OPTIONS, RequestMethod.PATCH})
public class VirementController {

    private final VirementService virementService;
    public VirementController(VirementService virementService) { this.virementService = virementService; }

    // ── VIREMENTS ──

    @GetMapping
    public ResponseEntity<List<VirementDto.Response>> findAll(
            @RequestParam(required = false) String statut) {
        return ResponseEntity.ok(statut != null
            ? virementService.findByStatut(statut)
            : virementService.findAll());
    }

    @PostMapping
    public ResponseEntity<VirementDto.Response> creer(@RequestBody VirementDto.Request dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(virementService.creer(dto));
    }

    @PatchMapping("/{id}/executer")
    public ResponseEntity<VirementDto.Response> executer(@PathVariable Long id) {
        return ResponseEntity.ok(virementService.executer(id));
    }

    @PatchMapping("/{id}/annuler")
    public ResponseEntity<VirementDto.Response> annuler(@PathVariable Long id) {
        return ResponseEntity.ok(virementService.annuler(id));
    }

    // ── COMPTES BANCAIRES ──

    @GetMapping("/comptes")
    public ResponseEntity<List<VirementDto.CompteBancaireResponse>> findComptes() {
        return ResponseEntity.ok(virementService.findComptes());
    }

    @PostMapping("/comptes")
    public ResponseEntity<VirementDto.CompteBancaireResponse> creerCompte(
            @RequestBody VirementDto.CompteBancaireRequest dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(virementService.creerCompte(dto));
    }

    @PatchMapping("/comptes/{id}/fermer")
    public ResponseEntity<VirementDto.CompteBancaireResponse> fermerCompte(@PathVariable Long id) {
        return ResponseEntity.ok(virementService.fermerCompte(id));
    }

    @GetMapping("/comptes/{id}/operations")
    public ResponseEntity<List<VirementDto.OperationCompteResponse>> findOpsCompte(
            @PathVariable Long id) {
        return ResponseEntity.ok(virementService.findOperationsCompte(id));
    }

    @PostMapping("/comptes/{id}/operations")
    public ResponseEntity<VirementDto.OperationCompteResponse> creerOpCompte(
            @PathVariable Long id, @RequestBody Map<String, Object> body) {
        String type        = (String) body.get("type");
        BigDecimal montant = new BigDecimal(body.get("montant").toString());
        String reference   = (String) body.get("reference");
        String description = (String) body.get("description");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(virementService.enregistrerOperationCompte(id, type, montant, reference, description));
    }
}