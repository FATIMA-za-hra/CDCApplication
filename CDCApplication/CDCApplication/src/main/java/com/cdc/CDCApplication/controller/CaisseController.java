package com.cdc.CDCApplication.controller;

import com.cdc.CDCApplication.dto.CaisseDto;
import com.cdc.CDCApplication.service.CaisseService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/caisse")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
                RequestMethod.DELETE, RequestMethod.OPTIONS, RequestMethod.PATCH})
public class CaisseController {

    private final CaisseService caisseService;

    public CaisseController(CaisseService caisseService) {
        this.caisseService = caisseService;
    }

    // ── CAISSES ──

    /**
     * Retourne la caisse unique de l'association.
     * Il existe UNE SEULE caisse — le frontend l'utilise directement.
     */
    @GetMapping
    public ResponseEntity<List<CaisseDto.Response>> findAll() {
        return ResponseEntity.ok(caisseService.findAll()); // retourne liste de 1 élément max
    }

    @GetMapping("/{id}")
    public ResponseEntity<CaisseDto.Response> findById(@PathVariable Long id) {
        return ResponseEntity.ok(caisseService.findById(id));
    }

    // POST /caisse : initialise la caisse si elle n'existe pas encore
    @PostMapping
    public ResponseEntity<CaisseDto.Response> creer(@RequestBody CaisseDto.Request dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(caisseService.creer(dto));
    }

    @PatchMapping("/{id}/ouvrir")
    public ResponseEntity<CaisseDto.Response> ouvrir(@PathVariable Long id) {
        return ResponseEntity.ok(caisseService.ouvrir(id));
    }

    @PatchMapping("/{id}/fermer")
    public ResponseEntity<CaisseDto.Response> fermer(@PathVariable Long id) {
        return ResponseEntity.ok(caisseService.fermer(id));
    }

    // ── OPÉRATIONS ──

    @GetMapping("/{id}/operations")
    public ResponseEntity<List<CaisseDto.OperationResponse>> findOperations(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate debut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(caisseService.findOperations(id, debut, fin));
    }

    @PostMapping("/operations")
    public ResponseEntity<CaisseDto.OperationResponse> enregistrerOperation(
            @RequestBody CaisseDto.OperationRequest dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(caisseService.enregistrerOperation(dto));
    }

    @DeleteMapping("/operations/{operationId}")
    public ResponseEntity<Void> supprimerOperation(@PathVariable Long operationId) {
        caisseService.supprimerOperation(operationId);
        return ResponseEntity.noContent().build();
    }
}