package com.cdc.CDCApplication.controller;

import com.cdc.CDCApplication.dto.RoleDto;
import com.cdc.CDCApplication.service.RoleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping
    public ResponseEntity<List<RoleDto.Response>> findAll() {
        return ResponseEntity.ok(roleService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoleDto.Response> findById(@PathVariable Long id) {
        return ResponseEntity.ok(roleService.findById(id));
    }

    @PostMapping
    public ResponseEntity<RoleDto.Response> creer(@RequestBody RoleDto.Request dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roleService.creer(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoleDto.Response> modifier(@PathVariable Long id,
                                                      @RequestBody RoleDto.Request dto) {
        return ResponseEntity.ok(roleService.modifier(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        roleService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}