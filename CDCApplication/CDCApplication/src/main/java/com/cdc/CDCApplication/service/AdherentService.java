package com.cdc.CDCApplication.service;

import com.cdc.CDCApplication.dto.AdherentDto;
import com.cdc.CDCApplication.dto.CategorieAdhesionDto;
import com.cdc.CDCApplication.entity.Adherent;
import com.cdc.CDCApplication.entity.CategorieAdhesion;
import com.cdc.CDCApplication.entity.Utilisateur;
import com.cdc.CDCApplication.repository.AdherentRepository;
import com.cdc.CDCApplication.repository.CategorieAdhesionRepository;
import com.cdc.CDCApplication.repository.UtilisateurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@Transactional
public class AdherentService {

    private final AdherentRepository adherentRepository;
    private final CategorieAdhesionRepository categorieRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final EmailService emailService;

    public AdherentService(AdherentRepository adherentRepository,
                            CategorieAdhesionRepository categorieRepository,
                            UtilisateurRepository utilisateurRepository,
                            EmailService emailService) {
        this.adherentRepository = adherentRepository;
        this.categorieRepository = categorieRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.emailService = emailService;
    }

    public AdherentDto.Response creer(AdherentDto.Request dto) {
        if (dto.getCin() != null && adherentRepository.existsByCin(dto.getCin())) {
            throw new RuntimeException("Un adhérent avec ce CIN existe déjà.");
        }
        if (dto.getEmail() != null && adherentRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Un adhérent avec cet email existe déjà.");
        }

        Adherent adherent = new Adherent();
        adherent.setNumeroAdherent(genererNumeroAdherent());
        mapRequestToAdherent(dto, adherent);
        adherent.setDateCreation(LocalDate.now());

        // Créer automatiquement le compte utilisateur
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            Utilisateur utilisateur = creerCompteUtilisateur(adherent);
            adherent.setUtilisateur(utilisateur);
        }

        Adherent saved = adherentRepository.save(adherent);

        // Envoyer l'email de configuration si compte créé
        if (saved.getUtilisateur() != null) {
            try {
                String token = UUID.randomUUID().toString();
                Utilisateur u = saved.getUtilisateur();
                u.setTokenResetMdp(token);
                u.setTokenExpiry(java.time.LocalDateTime.now().plusHours(72));
                utilisateurRepository.save(u);
                emailService.envoyerEmailCreationCompte(u.getEmail(), u.getNom(), u.getPrenom(), token);
            } catch (Exception e) {
                // Ne pas bloquer la création si l'email échoue
                System.err.println("Erreur envoi email: " + e.getMessage());
            }
        }

        return toResponse(saved);
    }

    public AdherentDto.Response modifier(Long id, AdherentDto.Request dto) {
        Adherent adherent = adherentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Adhérent introuvable: " + id));

        if (dto.getCin() != null && !dto.getCin().equals(adherent.getCin())
                && adherentRepository.existsByCin(dto.getCin())) {
            throw new RuntimeException("Un adhérent avec ce CIN existe déjà.");
        }

        mapRequestToAdherent(dto, adherent);
        return toResponse(adherentRepository.save(adherent));
    }

    public void supprimer(Long id) {
        Adherent adherent = adherentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Adhérent introuvable: " + id));
        adherentRepository.delete(adherent);
    }

    @Transactional(readOnly = true)
    public AdherentDto.Response findById(Long id) {
        return toResponse(adherentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Adhérent introuvable: " + id)));
    }

    @Transactional(readOnly = true)
    public List<AdherentDto.Response> findAll() {
        List<AdherentDto.Response> list = new ArrayList<>();
        for (Adherent a : adherentRepository.findAll()) {
            list.add(toResponse(a));
        }
        return list;
    }

    @Transactional(readOnly = true)
    public List<AdherentDto.Response> findByStatut(String statut) {
        List<AdherentDto.Response> list = new ArrayList<>();
        for (Adherent a : adherentRepository.findByStatut(Adherent.StatutAdherent.valueOf(statut.toUpperCase()))) {
            list.add(toResponse(a));
        }
        return list;
    }

    // Générer numéro adhérent automatique 
    private String genererNumeroAdherent() {
        String maxNumero = adherentRepository.findMaxNumeroAdherent();
        if (maxNumero == null) return "ADH-00001";
        try {
            int num = Integer.parseInt(maxNumero.replace("ADH-", "")) + 1;
            return String.format("ADH-%05d", num);
        } catch (Exception e) {
            return "ADH-" + String.format("%05d", adherentRepository.count() + 1);
        }
    }

    // Créer le compte utilisateur automatiquement
    private Utilisateur creerCompteUtilisateur(Adherent adherent) {
        // Vérifier si l'email n'est pas déjà utilisé
        if (utilisateurRepository.existsByEmail(adherent.getEmail())) {
            return utilisateurRepository.findByEmail(adherent.getEmail()).orElse(null);
        }
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom(adherent.getNom());
        utilisateur.setPrenom(adherent.getPrenom());
        utilisateur.setEmail(adherent.getEmail());
        utilisateur.setActif(true);
        utilisateur.setCompteConfigure(false);
        return utilisateurRepository.save(utilisateur);
    }

    private void mapRequestToAdherent(AdherentDto.Request dto, Adherent adherent) {
        adherent.setNom(dto.getNom());
        adherent.setPrenom(dto.getPrenom());
        adherent.setCin(dto.getCin());
        adherent.setMatricule(dto.getMatricule());
        adherent.setDateNaissance(dto.getDateNaissance());
        adherent.setSituationFamiliale(dto.getSituationFamiliale());
        adherent.setService(dto.getService());
        adherent.setTelephone(dto.getTelephone());
        adherent.setAdresse(dto.getAdresse());
        adherent.setEmail(dto.getEmail());
        adherent.setDateAdhesion(dto.getDateAdhesion() != null ? dto.getDateAdhesion() : LocalDate.now());
        adherent.setNombreEnfants(dto.getNombreEnfants() != null ? dto.getNombreEnfants() : 0);
        adherent.setObservations(dto.getObservations());

        if (dto.getStatut() != null) {
            try {
                adherent.setStatut(Adherent.StatutAdherent.valueOf(dto.getStatut().toUpperCase()));
            } catch (IllegalArgumentException e) {
                adherent.setStatut(Adherent.StatutAdherent.ACTIF);
            }
        }

        if (dto.getCategorieId() != null) {
            CategorieAdhesion cat = categorieRepository.findById(dto.getCategorieId())
                    .orElseThrow(() -> new RuntimeException("Catégorie introuvable: " + dto.getCategorieId()));
            adherent.setCategorie(cat);
        }
    }

    AdherentDto.Response toResponse(Adherent a) {
        AdherentDto.Response resp = new AdherentDto.Response();
        resp.setId(a.getId());
        resp.setNumeroAdherent(a.getNumeroAdherent());
        resp.setNom(a.getNom());
        resp.setPrenom(a.getPrenom());
        resp.setCin(a.getCin());
        resp.setMatricule(a.getMatricule());
        resp.setDateNaissance(a.getDateNaissance());
        resp.setSituationFamiliale(a.getSituationFamiliale());
        resp.setService(a.getService());
        resp.setTelephone(a.getTelephone());
        resp.setAdresse(a.getAdresse());
        resp.setEmail(a.getEmail());
        resp.setDateAdhesion(a.getDateAdhesion());
        resp.setStatut(a.getStatut() != null ? a.getStatut().name() : null);
        resp.setNombreEnfants(a.getNombreEnfants());
        resp.setObservations(a.getObservations());
        resp.setDateCreation(a.getDateCreation());

        if (a.getCategorie() != null) {
            CategorieAdhesionDto.Response cat = new CategorieAdhesionDto.Response();
            cat.setId(a.getCategorie().getId());
            cat.setLibelle(a.getCategorie().getLibelle());
            cat.setMontant(a.getCategorie().getMontant());
            cat.setActif(a.getCategorie().getActif());
            resp.setCategorie(cat);
        }

        if (a.getUtilisateur() != null) {
            resp.setUtilisateurId(a.getUtilisateur().getId());
            resp.setCompteUtilisateurCree(true);
        }

        return resp;
    }
}