package com.cdc.CDCApplication.service;

import com.cdc.CDCApplication.dto.HistoriqueModificationDto;
import com.cdc.CDCApplication.entity.HistoriqueModification;
import com.cdc.CDCApplication.repository.HistoriqueModificationRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class HistoriqueService {

    private final HistoriqueModificationRepository historiqueRepository;

    public HistoriqueService(HistoriqueModificationRepository historiqueRepository) {
        this.historiqueRepository = historiqueRepository;
    }

    
    public void enregistrer(Long adherentId, String action,
                             String champModifie, String ancienneValeur,
                             String nouvelleValeur, String commentaire) {
        if (adherentId == null) return;

        String utilisateur = "systeme";
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && !auth.getName().equals("anonymousUser"))
                utilisateur = auth.getName();
        } catch (Exception ignored) {}

        HistoriqueModification h = new HistoriqueModification();
        h.setAdherentId(adherentId);      
        h.setAction(action);
        h.setChampModifie(champModifie);
        h.setAncienneValeur(ancienneValeur);
        h.setNouvelleValeur(nouvelleValeur);
        h.setCommentaire(commentaire);
        h.setModifiePar(utilisateur);
        h.setDateModification(LocalDateTime.now());

        historiqueRepository.save(h);
        
    }

    @Transactional(readOnly = true)
    public List<HistoriqueModificationDto.Response> findByAdherent(Long adherentId) {
        List<HistoriqueModificationDto.Response> list = new ArrayList<>();
        for (HistoriqueModification h :
                historiqueRepository.findByAdherentIdOrderByDateModificationDesc(adherentId))
            list.add(toResponse(h));
        return list;
    }

    private HistoriqueModificationDto.Response toResponse(HistoriqueModification h) {
        HistoriqueModificationDto.Response r = new HistoriqueModificationDto.Response();
        r.setId(h.getId());
        r.setAction(h.getAction());
        r.setChampModifie(h.getChampModifie());
        r.setAncienneValeur(h.getAncienneValeur());
        r.setNouvelleValeur(h.getNouvelleValeur());
        r.setDateModification(h.getDateModification());
        r.setModifiePar(h.getModifiePar());
        r.setCommentaire(h.getCommentaire());
        return r;
    }
}