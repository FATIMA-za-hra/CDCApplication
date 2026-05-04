package com.cdc.CDCApplication.controller;

import com.cdc.CDCApplication.dto.CategorieAdhesionDto;
import com.cdc.CDCApplication.service.CategorieAdhesionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories-adhesion")
@CrossOrigin(origins = "http://localhost:5173", methods = {
    RequestMethod.GET, RequestMethod.POST,
    RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS
})
public class CategorieAdhesionController {

    private final CategorieAdhesionService service;

    public CategorieAdhesionController(CategorieAdhesionService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<CategorieAdhesionDto.Response>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/actives")
    public ResponseEntity<List<CategorieAdhesionDto.Response>> findActives() {
        return ResponseEntity.ok(service.findActives());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategorieAdhesionDto.Response> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<CategorieAdhesionDto.Response> creer(@RequestBody CategorieAdhesionDto.Request dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.creer(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategorieAdhesionDto.Response> modifier(
            @PathVariable Long id, @RequestBody CategorieAdhesionDto.Request dto) {
        return ResponseEntity.ok(service.modifier(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        service.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}