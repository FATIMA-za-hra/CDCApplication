package com.cdc.CDCApplication.service;

import com.cdc.CDCApplication.dto.PrivilegeDto;
import com.cdc.CDCApplication.dto.RoleDto;
import com.cdc.CDCApplication.entity.Privilege;
import com.cdc.CDCApplication.entity.Role;
import com.cdc.CDCApplication.repository.PrivilegeRepository;
import com.cdc.CDCApplication.repository.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class RoleService {

    private final RoleRepository roleRepository;
    private final PrivilegeRepository privilegeRepository;

    public RoleService(RoleRepository roleRepository, PrivilegeRepository privilegeRepository) {
        this.roleRepository = roleRepository;
        this.privilegeRepository = privilegeRepository;
    }

    public RoleDto.Response creer(RoleDto.Request dto) {
        if (roleRepository.existsByNom(dto.getNom())) {
            throw new RuntimeException("Un role avec ce nom existe deja.");
        }
        Role role = new Role();
        role.setNom(dto.getNom());
        role.setDescription(dto.getDescription());
        if (dto.getPrivilegeIds() != null && !dto.getPrivilegeIds().isEmpty()) {
            Set<Privilege> privileges = new HashSet<>();
            for (Long pid : dto.getPrivilegeIds()) {
                Privilege p = privilegeRepository.findById(pid)
                        .orElseThrow(() -> new RuntimeException("Privilege introuvable: " + pid));
                privileges.add(p);
            }
            role.setPrivileges(privileges);
        }
        return toResponse(roleRepository.save(role));
    }

    public RoleDto.Response modifier(Long id, RoleDto.Request dto) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role introuvable: " + id));
        if (!role.getNom().equals(dto.getNom()) && roleRepository.existsByNom(dto.getNom())) {
            throw new RuntimeException("Un role avec ce nom existe deja.");
        }
        role.setNom(dto.getNom());
        role.setDescription(dto.getDescription());
        if (dto.getPrivilegeIds() != null) {
            Set<Privilege> privileges = new HashSet<>();
            for (Long pid : dto.getPrivilegeIds()) {
                Privilege p = privilegeRepository.findById(pid)
                        .orElseThrow(() -> new RuntimeException("Privilege introuvable: " + pid));
                privileges.add(p);
            }
            role.setPrivileges(privileges);
        }
        return toResponse(roleRepository.save(role));
    }

    public void supprimer(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role introuvable: " + id));
        roleRepository.delete(role);
    }

    @Transactional(readOnly = true)
    public RoleDto.Response findById(Long id) {
        return toResponse(roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role introuvable: " + id)));
    }

    @Transactional(readOnly = true)
    public List<RoleDto.Response> findAll() {
        List<RoleDto.Response> list = new ArrayList<>();
        for (Role r : roleRepository.findAll()) {
            list.add(toResponse(r));
        }
        return list;
    }

    private RoleDto.Response toResponse(Role r) {
        RoleDto.Response resp = new RoleDto.Response();
        resp.setId(r.getId());
        resp.setNom(r.getNom());
        resp.setDescription(r.getDescription());
        List<PrivilegeDto.Response> privList = new ArrayList<>();
        for (Privilege p : r.getPrivileges()) {
            PrivilegeDto.Response pr = new PrivilegeDto.Response();
            pr.setId(p.getId());
            pr.setNom(p.getNom());
            pr.setDescription(p.getDescription());
            String[] parts = p.getNom().split("_", 2);
            pr.setModele(parts.length > 0 ? parts[0] : p.getNom());
            pr.setAction(parts.length > 1 ? parts[1] : "");
            privList.add(pr);
        }
        resp.setPrivileges(privList);
        return resp;
    }
}