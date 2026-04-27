package com.cdc.CDCApplication.controller;

import com.cdc.CDCApplication.dto.PrivilegeDto;
import com.cdc.CDCApplication.service.PrivilegeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/privileges")
@CrossOrigin(origins = "http://localhost:5173", methods = {
    RequestMethod.GET, RequestMethod.POST,
    RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS
})
public class PrivilegeController {

    private final PrivilegeService privilegeService;

    public PrivilegeController(PrivilegeService privilegeService) {
        this.privilegeService = privilegeService;
    }

    @GetMapping
    public ResponseEntity<List<PrivilegeDto.Response>> findAll() {
        return ResponseEntity.ok(privilegeService.findAll());
    }

    @GetMapping("/grouped")
    public ResponseEntity<Map<String, List<PrivilegeDto.Response>>> findGrouped() {
        return ResponseEntity.ok(privilegeService.findGroupedByModele());
    }

    @PostMapping("/modele")
    public ResponseEntity<List<PrivilegeDto.Response>> ajouterParModele(@RequestBody PrivilegeDto.Request dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(privilegeService.ajouterParModele(dto));
    }

    @PostMapping
    public ResponseEntity<PrivilegeDto.Response> ajouterSingle(@RequestBody PrivilegeDto.Single dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(privilegeService.ajouterSingle(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PrivilegeDto.Response> modifier(
            @PathVariable Long id,
            @RequestBody PrivilegeDto.Single dto) {
        return ResponseEntity.ok(privilegeService.modifier(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        privilegeService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}