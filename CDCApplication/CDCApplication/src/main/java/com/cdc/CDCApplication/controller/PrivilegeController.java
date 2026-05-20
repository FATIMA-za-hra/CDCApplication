package com.cdc.CDCApplication.controller;

import com.cdc.CDCApplication.service.PrivilegeService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/privileges")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
                RequestMethod.DELETE, RequestMethod.OPTIONS})
public class PrivilegeController {

    private final PrivilegeService privilegeService;
    public PrivilegeController(PrivilegeService privilegeService) {
        this.privilegeService = privilegeService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> findAll() {
        return ResponseEntity.ok(privilegeService.findAll());
    }

    @GetMapping("/grouped")
    public ResponseEntity<Map<String, List<Map<String, Object>>>> findGrouped() {
        return ResponseEntity.ok(privilegeService.findGrouped());
    }

    // Créer 4 privilèges d'un coup pour un modèle (CREATE, READ, UPDATE, DELETE)
    @PostMapping("/modele")
    public ResponseEntity<List<Map<String, Object>>> creerParModele(@RequestBody Map<String, Object> dto) {
        String modele = (String) dto.get("modele");
        @SuppressWarnings("unchecked")
        List<String> actions = (List<String>) dto.get("actions");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(privilegeService.creerParModele(modele, actions));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> creer(@RequestBody Map<String, Object> dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(privilegeService.creer(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> modifier(@PathVariable Long id,
                                                         @RequestBody Map<String, Object> dto) {
        return ResponseEntity.ok(privilegeService.modifier(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        privilegeService.supprimer(id); return ResponseEntity.noContent().build();
    }
}