package com.cdc.CDCApplication.service;

import com.cdc.CDCApplication.dto.TypeAideDto;
import com.cdc.CDCApplication.entity.TypeAide;
import com.cdc.CDCApplication.repository.TypeAideRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@Transactional
public class TypeAideService {

    private final TypeAideRepository typeAideRepository;

    public TypeAideService(TypeAideRepository typeAideRepository) {
        this.typeAideRepository = typeAideRepository;
    }

    @Transactional(readOnly = true)
    public List<TypeAideDto.Response> findAll() {
        List<TypeAideDto.Response> list = new ArrayList<>();
        for (TypeAide t : typeAideRepository.findAll()) list.add(toResponse(t));
        return list;
    }

    @Transactional(readOnly = true)
    public List<TypeAideDto.Response> findActifs() {
        List<TypeAideDto.Response> list = new ArrayList<>();
        for (TypeAide t : typeAideRepository.findByActifTrue()) list.add(toResponse(t));
        return list;
    }

    public TypeAideDto.Response creer(TypeAideDto.Request dto) {
        if (typeAideRepository.existsByNomIgnoreCase(dto.getNom()))
            throw new RuntimeException("Un type d'aide avec ce nom existe deja.");
        TypeAide t = new TypeAide();
        mapDto(dto, t);
        return toResponse(typeAideRepository.save(t));
    }

    public TypeAideDto.Response modifier(Long id, TypeAideDto.Request dto) {
        TypeAide t = typeAideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Type d'aide introuvable"));
        mapDto(dto, t);
        return toResponse(typeAideRepository.save(t));
    }

    public void supprimer(Long id) {
        TypeAide t = typeAideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Type d'aide introuvable"));
        t.setActif(false); // désactivation logique
        typeAideRepository.save(t);
    }

    private void mapDto(TypeAideDto.Request dto, TypeAide t) {
        t.setNom(dto.getNom()); t.setMontantMax(dto.getMontantMax());
        t.setConditions(dto.getConditions());
        t.setActif(dto.getActif() != null ? dto.getActif() : true);
        t.setDelaiMois(dto.getDelaiMois());
    }

    public TypeAideDto.Response toResponse(TypeAide t) {
        TypeAideDto.Response r = new TypeAideDto.Response();
        r.setId(t.getId()); r.setNom(t.getNom()); r.setMontantMax(t.getMontantMax());
        r.setConditions(t.getConditions()); r.setActif(t.getActif()); r.setDelaiMois(t.getDelaiMois());
        return r;
    }
}