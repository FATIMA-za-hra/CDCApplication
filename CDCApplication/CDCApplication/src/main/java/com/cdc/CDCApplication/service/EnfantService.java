package com.cdc.CDCApplication.service;

import com.cdc.CDCApplication.dto.EnfantDto;
import com.cdc.CDCApplication.entity.Adherent;
import com.cdc.CDCApplication.entity.Enfant;
import com.cdc.CDCApplication.repository.AdherentRepository;
import com.cdc.CDCApplication.repository.EnfantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class EnfantService {

    private final EnfantRepository enfantRepository;
    private final AdherentRepository adherentRepository;

    public EnfantService(EnfantRepository enfantRepository,
                          AdherentRepository adherentRepository) {
        this.enfantRepository = enfantRepository;
        this.adherentRepository = adherentRepository;
    }

    public List<EnfantDto.Response> sauvegarderEnfants(Long adherentId, List<EnfantDto.Request> requests) {
        Adherent adherent = adherentRepository.findById(adherentId)
                .orElseThrow(() -> new RuntimeException("Adhérent introuvable: " + adherentId));

        // Supprimer les anciens et recréer
        enfantRepository.deleteByAdherentId(adherentId);

        List<EnfantDto.Response> result = new ArrayList<>();
        if (requests == null) return result;

        for (EnfantDto.Request req : requests) {
            if (req.getNom() == null || req.getNom().isBlank()) continue;
            Enfant e = new Enfant();
            e.setAdherent(adherent);
            e.setNom(req.getNom());
            e.setPrenom(req.getPrenom());
            e.setDateNaissance(req.getDateNaissance());
            e.setSexe(req.getSexe());
            result.add(toResponse(enfantRepository.save(e)));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<EnfantDto.Response> findByAdherent(Long adherentId) {
        List<EnfantDto.Response> list = new ArrayList<>();
        for (Enfant e : enfantRepository.findByAdherentId(adherentId)) {
            list.add(toResponse(e));
        }
        return list;
    }

    public EnfantDto.Response toResponse(Enfant e) {
        EnfantDto.Response r = new EnfantDto.Response();
        r.setId(e.getId());
        r.setNom(e.getNom());
        r.setPrenom(e.getPrenom());
        r.setDateNaissance(e.getDateNaissance());
        r.setSexe(e.getSexe());
        if (e.getDateNaissance() != null) {
            r.setAge(Period.between(e.getDateNaissance(), LocalDate.now()).getYears());
        }
        return r;
    }
}