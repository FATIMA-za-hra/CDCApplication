package com.cdc.CDCApplication.controller;

import com.cdc.CDCApplication.dto.AdherentDto;
import com.cdc.CDCApplication.service.AdherentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/adherents")
@CrossOrigin(origins = "http://localhost:5173", methods = {
    RequestMethod.GET, RequestMethod.POST,
    RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS
})
public class AdherentController {

    private final AdherentService service;

    public AdherentController(AdherentService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<AdherentDto.Response>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdherentDto.Response> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<AdherentDto.Response>> findByStatut(@PathVariable String statut) {
        return ResponseEntity.ok(service.findByStatut(statut));
    }

    @PostMapping
    public ResponseEntity<AdherentDto.Response> creer(@RequestBody AdherentDto.Request dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.creer(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdherentDto.Response> modifier(
            @PathVariable Long id, @RequestBody AdherentDto.Request dto) {
        return ResponseEntity.ok(service.modifier(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        service.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}