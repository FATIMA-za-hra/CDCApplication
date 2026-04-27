package com.cdc.CDCApplication.service;

import com.cdc.CDCApplication.config.PasswordEncoder;
import com.cdc.CDCApplication.dto.PrivilegeDto;
import com.cdc.CDCApplication.dto.RoleDto;
import com.cdc.CDCApplication.dto.UtilisateurDto;
import com.cdc.CDCApplication.entity.Role;
import com.cdc.CDCApplication.entity.Utilisateur;
import com.cdc.CDCApplication.repository.RoleRepository;
import com.cdc.CDCApplication.repository.UtilisateurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;
    private final EmailService emailService;

    public UtilisateurService(UtilisateurRepository utilisateurRepository,
                               RoleRepository roleRepository,
                               EmailService emailService) {
        this.utilisateurRepository = utilisateurRepository;
        this.roleRepository = roleRepository;
        this.emailService = emailService;
    }

    public UtilisateurDto.Response creer(UtilisateurDto.Request dto) {
        if (utilisateurRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Un utilisateur avec cet email existe deja.");
        }
        Utilisateur u = new Utilisateur();
        u.setNom(dto.getNom());
        u.setPrenom(dto.getPrenom());
        u.setEmail(dto.getEmail());
        u.setActif(dto.getActif() != null ? dto.getActif() : true);
        u.setDateExpiration(dto.getDateExpiration());
        u.setCompteConfigure(false);
        if (dto.getRoleIds() != null && !dto.getRoleIds().isEmpty()) {
            Set<Role> roles = new HashSet<>();
            for (Long rid : dto.getRoleIds()) {
                Role r = roleRepository.findById(rid)
                        .orElseThrow(() -> new RuntimeException("Role introuvable: " + rid));
                roles.add(r);
            }
            u.setRoles(roles);
        }
        return toResponse(utilisateurRepository.save(u));
    }

    public UtilisateurDto.Response modifier(Long id, UtilisateurDto.Request dto) {
        Utilisateur u = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable: " + id));
        if (!u.getEmail().equals(dto.getEmail()) && utilisateurRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Un utilisateur avec cet email existe deja.");
        }
        u.setNom(dto.getNom());
        u.setPrenom(dto.getPrenom());
        u.setEmail(dto.getEmail());
        if (dto.getActif() != null) u.setActif(dto.getActif());
        u.setDateExpiration(dto.getDateExpiration());
        if (dto.getRoleIds() != null) {
            Set<Role> roles = new HashSet<>();
            for (Long rid : dto.getRoleIds()) {
                Role r = roleRepository.findById(rid)
                        .orElseThrow(() -> new RuntimeException("Role introuvable: " + rid));
                roles.add(r);
            }
            u.setRoles(roles);
        }
        return toResponse(utilisateurRepository.save(u));
    }

    public void supprimer(Long id) {
        Utilisateur u = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable: " + id));
        utilisateurRepository.delete(u);
    }

    @Transactional(readOnly = true)
    public UtilisateurDto.Response findById(Long id) {
        return toResponse(utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable: " + id)));
    }

    @Transactional(readOnly = true)
    public List<UtilisateurDto.Response> findAll() {
        List<UtilisateurDto.Response> list = new ArrayList<>();
        for (Utilisateur u : utilisateurRepository.findAll()) {
            list.add(toResponse(u));
        }
        return list;
    }

    public void notifierUtilisateur(Long id) {
        Utilisateur u = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable: " + id));
        String token = UUID.randomUUID().toString();
        u.setTokenResetMdp(token);
        u.setTokenExpiry(LocalDateTime.now().plusHours(24));
        utilisateurRepository.save(u);
        emailService.envoyerEmailCreationCompte(u.getEmail(), u.getNom(), u.getPrenom(), token);
    }

    public void configurerMotDePasse(UtilisateurDto.PasswordSetRequest dto) {
        if (!dto.getMotDePasse().equals(dto.getConfirmerMotDePasse())) {
            throw new RuntimeException("Les mots de passe ne correspondent pas.");
        }
        Utilisateur u = utilisateurRepository.findByTokenResetMdp(dto.getToken())
                .orElseThrow(() -> new RuntimeException("Token invalide ou expire."));
        if (u.getTokenExpiry() == null || u.getTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Ce lien a expire. Contactez votre administrateur.");
        }
        u.setMotDePasse(PasswordEncoder.encode(dto.getMotDePasse()));
        u.setTokenResetMdp(null);
        u.setTokenExpiry(null);
        u.setCompteConfigure(true);
        utilisateurRepository.save(u);
    }

    @Transactional(readOnly = true)
    public boolean validerToken(String token) {
        Optional<Utilisateur> opt = utilisateurRepository.findByTokenResetMdp(token);
        if (opt.isEmpty()) return false;
        Utilisateur u = opt.get();
        return u.getTokenExpiry() != null && u.getTokenExpiry().isAfter(LocalDateTime.now());
    }

    private UtilisateurDto.Response toResponse(Utilisateur u) {
        UtilisateurDto.Response resp = new UtilisateurDto.Response();
        resp.setId(u.getId());
        resp.setNom(u.getNom());
        resp.setPrenom(u.getPrenom());
        resp.setEmail(u.getEmail());
        resp.setActif(u.getActif());
        resp.setDateExpiration(u.getDateExpiration());
        resp.setCompteConfigure(u.getCompteConfigure());
        List<RoleDto.Response> roleList = new ArrayList<>();
        for (Role r : u.getRoles()) {
            roleList.add(toRoleResponse(r));
        }
        resp.setRoles(roleList);
        return resp;
    }

    private RoleDto.Response toRoleResponse(Role r) {
        RoleDto.Response resp = new RoleDto.Response();
        resp.setId(r.getId());
        resp.setNom(r.getNom());
        resp.setDescription(r.getDescription());
        List<PrivilegeDto.Response> privList = new ArrayList<>();
        for (com.cdc.CDCApplication.entity.Privilege p : r.getPrivileges()) {
            privList.add(toPrivResponse(p));
        }
        resp.setPrivileges(privList);
        return resp;
    }

    private PrivilegeDto.Response toPrivResponse(com.cdc.CDCApplication.entity.Privilege p) {
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