package com.cdc.CDCApplication.service;

import com.cdc.CDCApplication.dto.CaisseDto;
import com.cdc.CDCApplication.entity.*;
import com.cdc.CDCApplication.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@Transactional
public class CaisseService {

    private final CaisseRepository          caisseRepository;
    private final OperationCaisseRepository  operationRepository;
    private final UtilisateurRepository      utilisateurRepository;
    private final AideRepository             aideRepository;

    public CaisseService(CaisseRepository caisseRepository,
                          OperationCaisseRepository operationRepository,
                          UtilisateurRepository utilisateurRepository,
                          AideRepository aideRepository) {
        this.caisseRepository    = caisseRepository;
        this.operationRepository = operationRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.aideRepository      = aideRepository;
    }

    //CAISSES 

    @Transactional(readOnly = true)
    public List<CaisseDto.Response> findAll() {
        List<CaisseDto.Response> list = new ArrayList<>();
        for (Caisse c : caisseRepository.findAll()) list.add(toResponse(c));
        return list;
    }

    @Transactional(readOnly = true)
    public CaisseDto.Response findById(Long id) {
        return toResponse(caisseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Caisse introuvable")));
    }

    public CaisseDto.Response creer(CaisseDto.Request dto) {
        Caisse c = new Caisse();
        c.setNom(dto.getNom());
        c.setResponsable(dto.getResponsable() != null
            ? dto.getResponsable() : getCurrentUserNomPrenom());
        c.setSolde(BigDecimal.ZERO);
        c.setStatut(Caisse.StatutCaisse.FERMEE);
        c.setDateCreation(LocalDate.now());
        return toResponse(caisseRepository.save(c));
    }

    public CaisseDto.Response ouvrir(Long id) {
        Caisse c = getCaisse(id);
        if (c.getStatut() == Caisse.StatutCaisse.OUVERTE)
            throw new RuntimeException("La caisse est deja ouverte.");
        c.setStatut(Caisse.StatutCaisse.OUVERTE);
        return toResponse(caisseRepository.save(c));
    }

    public CaisseDto.Response fermer(Long id) {
        Caisse c = getCaisse(id);
        if (c.getStatut() != Caisse.StatutCaisse.OUVERTE)
            throw new RuntimeException("La caisse n est pas ouverte.");
        c.setStatut(Caisse.StatutCaisse.FERMEE);
        return toResponse(caisseRepository.save(c));
    }

    // OPÉRATIONS

    @Transactional(readOnly = true)
    public List<CaisseDto.OperationResponse> findOperations(Long caisseId,
                                                              LocalDate debut,
                                                              LocalDate fin) {
        List<OperationCaisse> ops;
        if (debut != null && fin != null)
            ops = operationRepository.findByCaisseIdAndDateBetweenOrderByDateDescIdDesc(
                    caisseId, debut, fin);
        else
            ops = operationRepository.findByCaisseIdOrderByDateDescIdDesc(caisseId);
        List<CaisseDto.OperationResponse> list = new ArrayList<>();
        for (OperationCaisse op : ops) list.add(toOpResponse(op));
        return list;
    }

    public CaisseDto.OperationResponse enregistrerOperation(CaisseDto.OperationRequest dto) {
        Caisse c = getCaisse(dto.getCaisseId());
        if (c.getStatut() != Caisse.StatutCaisse.OUVERTE)
            throw new RuntimeException("La caisse doit etre ouverte pour enregistrer une operation.");

        if (dto.getMontant() == null || dto.getMontant().compareTo(BigDecimal.ZERO) <= 0)
            throw new RuntimeException("Le montant doit etre positif.");

        OperationCaisse.TypeOperation type =
                OperationCaisse.TypeOperation.valueOf(dto.getType().toUpperCase());

        // Vérifier solvabilité pour une sortie
        if (type == OperationCaisse.TypeOperation.SORTIE
                && c.getSolde().compareTo(dto.getMontant()) < 0)
            throw new RuntimeException("Solde insuffisant. Solde actuel: " + c.getSolde() + " MAD");

        BigDecimal soldeAvant = c.getSolde();
        BigDecimal soldeApres;

        if (type == OperationCaisse.TypeOperation.ENTREE)
            soldeApres = soldeAvant.add(dto.getMontant());
        else
            soldeApres = soldeAvant.subtract(dto.getMontant());

        // Créer l'opération
        OperationCaisse op = new OperationCaisse();
        op.setCaisse(c);
        op.setType(type);
        op.setMontant(dto.getMontant());
        op.setDate(dto.getDate() != null ? dto.getDate() : LocalDate.now());
        op.setCategorie(dto.getCategorie());
        op.setJustificatif(dto.getJustificatif());
        op.setEffectuePar(getCurrentUserNomPrenom());
        op.setSoldeAvant(soldeAvant);
        op.setSoldeApres(soldeApres);

        // Lien vers aide si fourni
        if (dto.getAideId() != null) {
            aideRepository.findById(dto.getAideId()).ifPresent(op::setAide);
        }

        // Mettre à jour le solde de la caisse
        c.setSolde(soldeApres);
        caisseRepository.save(c);

        return toOpResponse(operationRepository.save(op));
    }

    public void supprimerOperation(Long operationId) {
        OperationCaisse op = operationRepository.findById(operationId)
                .orElseThrow(() -> new RuntimeException("Operation introuvable"));
        Caisse c = op.getCaisse();

        // Reverser l'impact sur le solde
        if (op.getType() == OperationCaisse.TypeOperation.ENTREE)
            c.setSolde(c.getSolde().subtract(op.getMontant()));
        else
            c.setSolde(c.getSolde().add(op.getMontant()));

        caisseRepository.save(c);
        operationRepository.deleteById(operationId);
    }

    // ═══ HELPERS ═══

    private Caisse getCaisse(Long id) {
        return caisseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Caisse introuvable"));
    }

    private String getCurrentUserNomPrenom() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Utilisateur u = utilisateurRepository.findByEmail(email).orElse(null);
            if (u != null) return u.getPrenom() + " " + u.getNom();
            return email;
        } catch (Exception e) { return "Système"; }
    }

    public CaisseDto.Response toResponse(Caisse c) {
        CaisseDto.Response r = new CaisseDto.Response();
        r.setId(c.getId()); r.setNom(c.getNom());
        r.setSolde(c.getSolde()); r.setResponsable(c.getResponsable());
        r.setDateCreation(c.getDateCreation());
        r.setStatut(c.getStatut() != null ? c.getStatut().name() : null);

        // Stats
        r.setTotalEntrees(operationRepository.sumEntreesByCaisse(c.getId()));
        r.setTotalSorties(operationRepository.sumSortiesByCaisse(c.getId()));
        r.setNbOperations(operationRepository.countByCaisseId(c.getId()));
        return r;
    }

    public CaisseDto.OperationResponse toOpResponse(OperationCaisse op) {
        CaisseDto.OperationResponse r = new CaisseDto.OperationResponse();
        r.setId(op.getId());
        r.setCaisseId(op.getCaisse() != null ? op.getCaisse().getId() : null);
        r.setType(op.getType() != null ? op.getType().name() : null);
        r.setMontant(op.getMontant()); r.setDate(op.getDate());
        r.setCategorie(op.getCategorie()); r.setJustificatif(op.getJustificatif());
        r.setEffectuePar(op.getEffectuePar());
        r.setSoldeAvant(op.getSoldeAvant()); r.setSoldeApres(op.getSoldeApres());
        if (op.getAide() != null) {
            r.setAideId(op.getAide().getId());
            r.setAideNumero(op.getAide().getNumeroDemande());
        }
        return r;
    }
}