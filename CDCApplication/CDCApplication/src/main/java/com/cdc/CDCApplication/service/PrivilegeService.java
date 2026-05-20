package com.cdc.CDCApplication.service;

import com.cdc.CDCApplication.entity.Privilege;
import com.cdc.CDCApplication.repository.PrivilegeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class PrivilegeService {

    private final PrivilegeRepository privilegeRepository;

    public PrivilegeService(PrivilegeRepository privilegeRepository) {
        this.privilegeRepository = privilegeRepository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> findAll() {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Privilege p : privilegeRepository.findAll()) list.add(toMap(p));
        return list;
    }

    /**
     * Groupé par module (déduit du nom : ADHERENT_READ → module=ADHERENT).
     */
    @Transactional(readOnly = true)
    public Map<String, List<Map<String, Object>>> findGrouped() {
        Map<String, List<Map<String, Object>>> grouped = new LinkedHashMap<>();
        for (Privilege p : privilegeRepository.findAll()) {
            String module = extraireModule(p.getNom());
            grouped.computeIfAbsent(module, k -> new ArrayList<>()).add(toMap(p));
        }
        // Trier par module
        Map<String, List<Map<String, Object>>> sorted = new TreeMap<>(grouped);
        return sorted;
    }

    /**
     * Crée 4 privilèges (CREATE, READ, UPDATE, DELETE) pour un modèle donné.
     * Ex: modele="FOURNISSEUR" → FOURNISSEUR_CREATE, FOURNISSEUR_READ...
     */
    public List<Map<String, Object>> creerParModele(String modele, List<String> actions) {
        List<Map<String, Object>> created = new ArrayList<>();
        String m = modele.toUpperCase().trim().replace(" ", "_");
        List<String> acts = (actions != null && !actions.isEmpty())
            ? actions : List.of("CREATE", "READ", "UPDATE", "DELETE");
        for (String action : acts) {
            String nom = m + "_" + action.toUpperCase();
            if (privilegeRepository.existsByNom(nom)) continue;
            Privilege p = new Privilege();
            p.setNom(nom);
            p.setDescription(action + " sur " + m);
            created.add(toMap(privilegeRepository.save(p)));
        }
        return created;
    }

    public Map<String, Object> creer(Map<String, Object> dto) {
        String nom = ((String) dto.get("nom")).toUpperCase().trim();
        if (privilegeRepository.existsByNom(nom))
            throw new RuntimeException("Ce privilege existe deja : " + nom);
        Privilege p = new Privilege();
        p.setNom(nom);
        p.setDescription((String) dto.get("description"));
        return toMap(privilegeRepository.save(p));
    }

    public Map<String, Object> modifier(Long id, Map<String, Object> dto) {
        Privilege p = privilegeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Privilege introuvable"));
        if (dto.get("nom")         != null) p.setNom(((String) dto.get("nom")).toUpperCase().trim());
        if (dto.get("description") != null) p.setDescription((String) dto.get("description"));
        return toMap(privilegeRepository.save(p));
    }

    public void supprimer(Long id) {
        privilegeRepository.deleteById(id);
    }

    /** Extrait le module depuis le nom : ADHERENT_READ → ADHERENT */
    private String extraireModule(String nom) {
        if (nom == null) return "AUTRE";
        int idx = nom.lastIndexOf('_');
        return idx > 0 ? nom.substring(0, idx) : nom;
    }

    /** Extrait l'action depuis le nom : ADHERENT_READ → read */
    private String extraireAction(String nom) {
        if (nom == null) return "";
        int idx = nom.lastIndexOf('_');
        return idx >= 0 ? nom.substring(idx + 1).toLowerCase() : nom.toLowerCase();
    }

    public Map<String, Object> toMap(Privilege p) {
        Map<String, Object> m = new HashMap<>();
        m.put("id",          p.getId());
        m.put("nom",         p.getNom());
        m.put("description", p.getDescription() != null ? p.getDescription() : "");
        // module et action déduits du nom — pas de colonne en base
        m.put("module",      extraireModule(p.getNom()));
        m.put("action",      extraireAction(p.getNom()));
        return m;
    }
}