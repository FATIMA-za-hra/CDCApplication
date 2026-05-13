package com.cdc.CDCApplication.service;

import com.cdc.CDCApplication.dto.CategorieAdhesionDto;
import com.cdc.CDCApplication.entity.CategorieAdhesion;
import com.cdc.CDCApplication.repository.CategorieAdhesionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class CategorieAdhesionService {

    private final CategorieAdhesionRepository categorieRepository;

    public CategorieAdhesionService(CategorieAdhesionRepository categorieRepository) {
        this.categorieRepository = categorieRepository;
    }

    @Transactional(readOnly = true)
    public List<CategorieAdhesionDto.Response> findAll() {
        List<CategorieAdhesionDto.Response> list = new ArrayList<>();
        for (CategorieAdhesion c : categorieRepository.findAll()) list.add(toResponse(c));
        return list;
    }

    @Transactional(readOnly = true)
    public List<CategorieAdhesionDto.Response> findActives() {
        List<CategorieAdhesionDto.Response> list = new ArrayList<>();
        for (CategorieAdhesion c : categorieRepository.findByActifTrue()) list.add(toResponse(c));
        return list;
    }

    @Transactional(readOnly = true)
    public CategorieAdhesionDto.Response findById(Long id) {
        return toResponse(categorieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categorie introuvable: " + id)));
    }

    public CategorieAdhesionDto.Response creer(CategorieAdhesionDto.Request dto) {
        if (categorieRepository.existsByLibelleIgnoreCase(dto.getLibelle()))
            throw new RuntimeException("Une categorie avec ce libelle existe deja.");
        CategorieAdhesion c = new CategorieAdhesion();
        mapDto(dto, c);
        return toResponse(categorieRepository.save(c));
    }

    public CategorieAdhesionDto.Response modifier(Long id, CategorieAdhesionDto.Request dto) {
        CategorieAdhesion c = categorieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categorie introuvable: " + id));
        // Vérifier unicité du libellé (sauf si c'est le même)
        if (!dto.getLibelle().equalsIgnoreCase(c.getLibelle())
                && categorieRepository.existsByLibelleIgnoreCase(dto.getLibelle()))
            throw new RuntimeException("Une categorie avec ce libelle existe deja.");
        mapDto(dto, c);
        return toResponse(categorieRepository.save(c));
    }

    public void supprimer(Long id) {
        CategorieAdhesion c = categorieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categorie introuvable: " + id));
        // Désactivation logique au lieu de suppression physique
        c.setActif(false);
        categorieRepository.save(c);
    }

    private void mapDto(CategorieAdhesionDto.Request dto, CategorieAdhesion c) {
        c.setLibelle(dto.getLibelle());
        c.setMontant(dto.getMontant());
        c.setConditions(dto.getConditions());
        c.setActif(dto.getActif() != null ? dto.getActif() : true);
        c.setPeriodesValidite(dto.getPeriodesValidite());
    }

    public CategorieAdhesionDto.Response toResponse(CategorieAdhesion c) {
        CategorieAdhesionDto.Response r = new CategorieAdhesionDto.Response();
        r.setId(c.getId());
        r.setLibelle(c.getLibelle());
        r.setMontant(c.getMontant());
        r.setConditions(c.getConditions());
        r.setActif(c.getActif());
        r.setPeriodesValidite(c.getPeriodesValidite());
        return r;
    }
}