package com.cdc.CDCApplication.controller;

import com.cdc.CDCApplication.dto.AdhesionDto;
import com.cdc.CDCApplication.service.AdhesionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/adhesions")
@CrossOrigin(origins = "http://localhost:5173", methods = {
    RequestMethod.GET, RequestMethod.POST,
    RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS
})
public class AdhesionController {

    private final AdhesionService service;

    public AdhesionController(AdhesionService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<AdhesionDto.Response>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdhesionDto.Response> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping("/adherent/{adherentId}")
    public ResponseEntity<List<AdhesionDto.Response>> findByAdherent(@PathVariable Long adherentId) {
        return ResponseEntity.ok(service.findByAdherent(adherentId));
    }

    @GetMapping("/annee/{annee}")
    public ResponseEntity<List<AdhesionDto.Response>> findByAnnee(@PathVariable Integer annee) {
        return ResponseEntity.ok(service.findByAnnee(annee));
    }

    @PostMapping
    public ResponseEntity<AdhesionDto.Response> creer(@RequestBody AdhesionDto.Request dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.creer(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdhesionDto.Response> modifier(
            @PathVariable Long id, @RequestBody AdhesionDto.Request dto) {
        return ResponseEntity.ok(service.modifier(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        service.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}