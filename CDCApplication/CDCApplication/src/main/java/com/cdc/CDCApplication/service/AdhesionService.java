package com.cdc.CDCApplication.service;

import com.cdc.CDCApplication.dto.AdhesionDto;
import com.cdc.CDCApplication.dto.AdherentDto;
import com.cdc.CDCApplication.dto.CategorieAdhesionDto;
import com.cdc.CDCApplication.entity.Adhesion;
import com.cdc.CDCApplication.entity.Adherent;
import com.cdc.CDCApplication.entity.CategorieAdhesion;
import com.cdc.CDCApplication.repository.AdhesionRepository;
import com.cdc.CDCApplication.repository.AdherentRepository;
import com.cdc.CDCApplication.repository.CategorieAdhesionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class AdhesionService {

    private final AdhesionRepository adhesionRepository;
    private final AdherentRepository adherentRepository;
    private final CategorieAdhesionRepository categorieRepository;
    private final AdherentService adherentService;

    public AdhesionService(AdhesionRepository adhesionRepository,
                            AdherentRepository adherentRepository,
                            CategorieAdhesionRepository categorieRepository,
                            AdherentService adherentService) {
        this.adhesionRepository = adhesionRepository;
        this.adherentRepository = adherentRepository;
        this.categorieRepository = categorieRepository;
        this.adherentService = adherentService;
    }

    public AdhesionDto.Response creer(AdhesionDto.Request dto) {
        Adherent adherent = adherentRepository.findById(dto.getAdherentId())
                .orElseThrow(() -> new RuntimeException("Adhérent introuvable: " + dto.getAdherentId()));

        int annee = dto.getAnnee() != null ? dto.getAnnee() : LocalDate.now().getYear();

        if (adhesionRepository.existsByAdherentIdAndAnnee(dto.getAdherentId(), annee)) {
            throw new RuntimeException("Cet adhérent a déjà une adhésion pour l'année " + annee);
        }

        CategorieAdhesion categorie = categorieRepository.findById(dto.getCategorieId())
                .orElseThrow(() -> new RuntimeException("Catégorie introuvable: " + dto.getCategorieId()));

        Adhesion adhesion = new Adhesion();
        adhesion.setAdherent(adherent);
        adhesion.setCategorie(categorie);
        adhesion.setAnnee(annee);
        adhesion.setMontant(dto.getMontant() != null ? dto.getMontant() : categorie.getMontant());
        adhesion.setDateCreation(LocalDate.now());
        adhesion.setMontantExonere(dto.getMontantExonere() != null ? dto.getMontantExonere() : BigDecimal.ZERO);
        adhesion.setEstExonere(dto.getEstExonere() != null && dto.getEstExonere());
        adhesion.setMotifExoneration(dto.getMotifExoneration());
        adhesion.setModePaiement(dto.getModePaiement());
        adhesion.setReferencePaiement(dto.getReferencePaiement());
        adhesion.setObservations(dto.getObservations());

        if (dto.getStatut() != null) {
            try {
                adhesion.setStatut(Adhesion.StatutAdhesion.valueOf(dto.getStatut().toUpperCase()));
            } catch (IllegalArgumentException e) {
                adhesion.setStatut(Adhesion.StatutAdhesion.EN_ATTENTE);
            }
        }

        if (dto.getDatePaiement() != null) {
            adhesion.setDatePaiement(dto.getDatePaiement());
            if (adhesion.getStatut() == Adhesion.StatutAdhesion.EN_ATTENTE) {
                adhesion.setStatut(Adhesion.StatutAdhesion.PAYE);
            }
        }

        return toResponse(adhesionRepository.save(adhesion));
    }

    public AdhesionDto.Response modifier(Long id, AdhesionDto.Request dto) {
        Adhesion adhesion = adhesionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Adhésion introuvable: " + id));

        if (dto.getMontant() != null) adhesion.setMontant(dto.getMontant());
        if (dto.getDatePaiement() != null) adhesion.setDatePaiement(dto.getDatePaiement());
        if (dto.getModePaiement() != null) adhesion.setModePaiement(dto.getModePaiement());
        if (dto.getReferencePaiement() != null) adhesion.setReferencePaiement(dto.getReferencePaiement());
        if (dto.getObservations() != null) adhesion.setObservations(dto.getObservations());
        if (dto.getEstExonere() != null) adhesion.setEstExonere(dto.getEstExonere());
        if (dto.getMontantExonere() != null) adhesion.setMontantExonere(dto.getMontantExonere());
        if (dto.getMotifExoneration() != null) adhesion.setMotifExoneration(dto.getMotifExoneration());

        if (dto.getStatut() != null) {
            try {
                adhesion.setStatut(Adhesion.StatutAdhesion.valueOf(dto.getStatut().toUpperCase()));
            } catch (IllegalArgumentException ignored) {}
        }

        return toResponse(adhesionRepository.save(adhesion));
    }

    public void supprimer(Long id) {
        Adhesion adhesion = adhesionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Adhésion introuvable: " + id));
        adhesionRepository.delete(adhesion);
    }

    @Transactional(readOnly = true)
    public AdhesionDto.Response findById(Long id) {
        return toResponse(adhesionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Adhésion introuvable: " + id)));
    }

    @Transactional(readOnly = true)
    public List<AdhesionDto.Response> findAll() {
        List<AdhesionDto.Response> list = new ArrayList<>();
        for (Adhesion a : adhesionRepository.findAll()) list.add(toResponse(a));
        return list;
    }

    @Transactional(readOnly = true)
    public List<AdhesionDto.Response> findByAdherent(Long adherentId) {
        List<AdhesionDto.Response> list = new ArrayList<>();
        for (Adhesion a : adhesionRepository.findByAdherentId(adherentId)) list.add(toResponse(a));
        return list;
    }

    @Transactional(readOnly = true)
    public List<AdhesionDto.Response> findByAnnee(Integer annee) {
        List<AdhesionDto.Response> list = new ArrayList<>();
        for (Adhesion a : adhesionRepository.findByAnnee(annee)) list.add(toResponse(a));
        return list;
    }

    private AdhesionDto.Response toResponse(Adhesion a) {
        AdhesionDto.Response resp = new AdhesionDto.Response();
        resp.setId(a.getId());
        resp.setAnnee(a.getAnnee());
        resp.setDatePaiement(a.getDatePaiement());
        resp.setMontant(a.getMontant());
        resp.setMontantExonere(a.getMontantExonere());
        resp.setStatut(a.getStatut() != null ? a.getStatut().name() : null);
        resp.setModePaiement(a.getModePaiement());
        resp.setReferencePaiement(a.getReferencePaiement());
        resp.setEstExonere(a.getEstExonere());
        resp.setMotifExoneration(a.getMotifExoneration());
        resp.setObservations(a.getObservations());
        resp.setDateCreation(a.getDateCreation());

        if (a.getAdherent() != null) {
            resp.setAdherent(adherentService.toResponse(a.getAdherent()));
        }
        if (a.getCategorie() != null) {
            CategorieAdhesionDto.Response cat = new CategorieAdhesionDto.Response();
            cat.setId(a.getCategorie().getId());
            cat.setLibelle(a.getCategorie().getLibelle());
            cat.setMontant(a.getCategorie().getMontant());
            resp.setCategorie(cat);
        }
        return resp;
    }
}