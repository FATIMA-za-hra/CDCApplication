package com.cdc.CDCApplication.service;

import com.cdc.CDCApplication.dto.PrivilegeDto;
import com.cdc.CDCApplication.entity.Privilege;
import com.cdc.CDCApplication.entity.Role;
import com.cdc.CDCApplication.repository.PrivilegeRepository;
import com.cdc.CDCApplication.repository.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class PrivilegeService {

    private final PrivilegeRepository privilegeRepository;
    private final RoleRepository roleRepository;

    private static final List<String> ACTIONS_DEFAUT = List.of("create", "read", "update", "delete");

    public PrivilegeService(PrivilegeRepository privilegeRepository, RoleRepository roleRepository) {
        this.privilegeRepository = privilegeRepository;
        this.roleRepository = roleRepository;
    }

    public List<PrivilegeDto.Response> ajouterParModele(PrivilegeDto.Request dto) {
        List<String> actions = (dto.getActions() != null && !dto.getActions().isEmpty())
                ? dto.getActions() : ACTIONS_DEFAUT;
        List<PrivilegeDto.Response> created = new ArrayList<>();
        for (String action : actions) {
            String nomPrivilege = dto.getModele().toLowerCase() + "_" + action.toLowerCase();
            if (!privilegeRepository.existsByNom(nomPrivilege)) {
                Privilege p = new Privilege();
                p.setNom(nomPrivilege);
                p.setDescription("Privilege " + action + " pour " + dto.getModele());
                created.add(toResponse(privilegeRepository.save(p)));
            }
        }
        return created;
    }

    public PrivilegeDto.Response ajouterSingle(PrivilegeDto.Single dto) {
        if (privilegeRepository.existsByNom(dto.getNom())) {
            throw new RuntimeException("Ce privilege existe deja: " + dto.getNom());
        }
        Privilege p = new Privilege();
        p.setNom(dto.getNom().toLowerCase());
        p.setDescription(dto.getDescription());
        return toResponse(privilegeRepository.save(p));
    }

    public PrivilegeDto.Response modifier(Long id, PrivilegeDto.Single dto) {
        Privilege p = privilegeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Privilege introuvable: " + id));
        if (!p.getNom().equals(dto.getNom().toLowerCase()) && privilegeRepository.existsByNom(dto.getNom().toLowerCase())) {
            throw new RuntimeException("Un privilege avec ce nom existe deja: " + dto.getNom());
        }
        p.setNom(dto.getNom().toLowerCase().trim());
        if (dto.getDescription() != null) p.setDescription(dto.getDescription());
        return toResponse(privilegeRepository.save(p));
    }

    public void supprimer(Long id) {
        Privilege privilege = privilegeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Privilege introuvable: " + id));

        // Retirer ce privilege de tous les roles qui l'utilisent avant suppression
        List<Role> tousLesRoles = roleRepository.findAll();
        for (Role role : tousLesRoles) {
            boolean retire = role.getPrivileges().removeIf(p -> p.getId().equals(id));
            if (retire) {
                roleRepository.save(role);
            }
        }

        privilegeRepository.delete(privilege);
    }

    @Transactional(readOnly = true)
    public List<PrivilegeDto.Response> findAll() {
        List<PrivilegeDto.Response> list = new ArrayList<>();
        for (Privilege p : privilegeRepository.findAll()) {
            list.add(toResponse(p));
        }
        return list;
    }

    @Transactional(readOnly = true)
    public Map<String, List<PrivilegeDto.Response>> findGroupedByModele() {
        Map<String, List<PrivilegeDto.Response>> grouped = new LinkedHashMap<>();
        for (Privilege p : privilegeRepository.findAll()) {
            PrivilegeDto.Response resp = toResponse(p);
            grouped.computeIfAbsent(resp.getModele(), k -> new ArrayList<>()).add(resp);
        }
        return grouped;
    }

    private PrivilegeDto.Response toResponse(Privilege p) {
        PrivilegeDto.Response resp = new PrivilegeDto.Response();
        resp.setId(p.getId());
        resp.setNom(p.getNom());
        resp.setDescription(p.getDescription());
        String[] parts = p.getNom().split("_", 2);
        resp.setModele(parts.length > 0 ? parts[0] : p.getNom());
        resp.setAction(parts.length > 1 ? parts[1] : "");
        return resp;
    }
}