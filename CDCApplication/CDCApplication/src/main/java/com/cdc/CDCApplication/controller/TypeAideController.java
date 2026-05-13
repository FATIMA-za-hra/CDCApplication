package com.cdc.CDCApplication.controller;

import com.cdc.CDCApplication.dto.TypeAideDto;
import com.cdc.CDCApplication.service.TypeAideService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/types-aide")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
                RequestMethod.DELETE, RequestMethod.OPTIONS})
public class TypeAideController {

    private final TypeAideService typeAideService;
    public TypeAideController(TypeAideService typeAideService) { this.typeAideService = typeAideService; }

    @GetMapping
    public ResponseEntity<List<TypeAideDto.Response>> findAll() {
        return ResponseEntity.ok(typeAideService.findAll());
    }

    @GetMapping("/actifs")
    public ResponseEntity<List<TypeAideDto.Response>> findActifs() {
        return ResponseEntity.ok(typeAideService.findActifs());
    }

    @PostMapping
    public ResponseEntity<TypeAideDto.Response> creer(@RequestBody TypeAideDto.Request dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(typeAideService.creer(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TypeAideDto.Response> modifier(@PathVariable Long id, @RequestBody TypeAideDto.Request dto) {
        return ResponseEntity.ok(typeAideService.modifier(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        typeAideService.supprimer(id); return ResponseEntity.noContent().build();
    }
}