package com.cdc.CDCApplication.service;

import com.cdc.CDCApplication.dto.CategorieAdhesionDto;
import com.cdc.CDCApplication.entity.CategorieAdhesion;
import com.cdc.CDCApplication.repository.AdherentRepository;
import com.cdc.CDCApplication.repository.CategorieAdhesionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class CategorieAdhesionService {

    private final CategorieAdhesionRepository categorieRepository;
    private final AdherentRepository adherentRepository;

    public CategorieAdhesionService(CategorieAdhesionRepository categorieRepository,
                                     AdherentRepository adherentRepository) {
        this.categorieRepository = categorieRepository;
        this.adherentRepository = adherentRepository;
    }

    public CategorieAdhesionDto.Response creer(CategorieAdhesionDto.Request dto) {
        if (categorieRepository.existsByLibelle(dto.getLibelle())) {
            throw new RuntimeException("Une catégorie avec ce libellé existe déjà.");
        }
        CategorieAdhesion cat = new CategorieAdhesion();
        cat.setLibelle(dto.getLibelle());
        cat.setMontant(dto.getMontant());
        cat.setConditions(dto.getConditions());
        cat.setActif(dto.getActif() != null ? dto.getActif() : true);
        cat.setDateDebutValidite(dto.getDateDebutValidite());
        cat.setDateFinValidite(dto.getDateFinValidite());
        cat.setDescription(dto.getDescription());
        return toResponse(categorieRepository.save(cat));
    }

    public CategorieAdhesionDto.Response modifier(Long id, CategorieAdhesionDto.Request dto) {
        CategorieAdhesion cat = categorieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie introuvable: " + id));
        if (!cat.getLibelle().equals(dto.getLibelle()) && categorieRepository.existsByLibelle(dto.getLibelle())) {
            throw new RuntimeException("Une catégorie avec ce libellé existe déjà.");
        }
        cat.setLibelle(dto.getLibelle());
        cat.setMontant(dto.getMontant());
        cat.setConditions(dto.getConditions());
        if (dto.getActif() != null) cat.setActif(dto.getActif());
        cat.setDateDebutValidite(dto.getDateDebutValidite());
        cat.setDateFinValidite(dto.getDateFinValidite());
        cat.setDescription(dto.getDescription());
        return toResponse(categorieRepository.save(cat));
    }

    public void supprimer(Long id) {
        CategorieAdhesion cat = categorieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie introuvable: " + id));
        if (!adherentRepository.findByCategorieId(id).isEmpty()) {
            throw new RuntimeException("Impossible de supprimer : des adhérents sont rattachés à cette catégorie.");
        }
        categorieRepository.delete(cat);
    }

    @Transactional(readOnly = true)
    public CategorieAdhesionDto.Response findById(Long id) {
        return toResponse(categorieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie introuvable: " + id)));
    }

    @Transactional(readOnly = true)
    public List<CategorieAdhesionDto.Response> findAll() {
        List<CategorieAdhesionDto.Response> list = new ArrayList<>();
        for (CategorieAdhesion cat : categorieRepository.findAll()) {
            list.add(toResponse(cat));
        }
        return list;
    }

    @Transactional(readOnly = true)
    public List<CategorieAdhesionDto.Response> findActives() {
        List<CategorieAdhesionDto.Response> list = new ArrayList<>();
        for (CategorieAdhesion cat : categorieRepository.findByActifTrue()) {
            list.add(toResponse(cat));
        }
        return list;
    }

    private CategorieAdhesionDto.Response toResponse(CategorieAdhesion cat) {
        CategorieAdhesionDto.Response resp = new CategorieAdhesionDto.Response();
        resp.setId(cat.getId());
        resp.setLibelle(cat.getLibelle());
        resp.setMontant(cat.getMontant());
        resp.setConditions(cat.getConditions());
        resp.setActif(cat.getActif());
        resp.setDateDebutValidite(cat.getDateDebutValidite());
        resp.setDateFinValidite(cat.getDateFinValidite());
        resp.setDescription(cat.getDescription());
        resp.setNombreAdherents(adherentRepository.findByCategorieId(cat.getId()).size());
        return resp;
    }
}