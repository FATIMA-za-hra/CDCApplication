package com.cdc.CDCApplication.service;

import com.cdc.CDCApplication.dto.AdherentDto;
import com.cdc.CDCApplication.dto.CategorieAdhesionDto;
import com.cdc.CDCApplication.entity.Adherent;
import com.cdc.CDCApplication.entity.Utilisateur;
import com.cdc.CDCApplication.repository.AdherentRepository;
import com.cdc.CDCApplication.repository.CategorieAdhesionRepository;
import com.cdc.CDCApplication.repository.UtilisateurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.LocalDate;
import java.util.*;

@Service
@Transactional
public class AdherentService {

    private final AdherentRepository adherentRepository;
    private final CategorieAdhesionRepository categorieRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final EmailService emailService;
    private final HistoriqueService historiqueService;

    @PersistenceContext
    private EntityManager entityManager;

    public AdherentService(AdherentRepository adherentRepository,
                            CategorieAdhesionRepository categorieRepository,
                            UtilisateurRepository utilisateurRepository,
                            EmailService emailService,
                            HistoriqueService historiqueService) {
        this.adherentRepository   = adherentRepository;
        this.categorieRepository  = categorieRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.emailService         = emailService;
        this.historiqueService    = historiqueService;
    }

    public AdherentDto.Response creer(AdherentDto.Request dto) {
        if (dto.getCin() != null && !dto.getCin().isBlank()
                && adherentRepository.existsByCin(dto.getCin()))
            throw new RuntimeException("Un adherent avec ce CIN existe deja.");
        if (dto.getEmail() != null && !dto.getEmail().isBlank()
                && adherentRepository.existsByEmail(dto.getEmail()))
            throw new RuntimeException("Un adherent avec cet email existe deja.");

        Adherent adherent = new Adherent();
        adherent.setNumeroAdherent(genererNumeroAdherent());
        adherent.setDateCreation(LocalDate.now());
        mapDtoToAdherent(dto, adherent);

        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            Utilisateur u = creerCompteUtilisateur(adherent);
            adherent.setUtilisateur(u);
        }

        Adherent saved = adherentRepository.save(adherent);

        historiqueService.enregistrer(
            saved.getId(), "CREATION", null, null,
            "Fiche creee : " + saved.getNumeroAdherent(),
            "Creation de la fiche adherent"
        );

        if (saved.getUtilisateur() != null) {
            try {
                String token = UUID.randomUUID().toString();
                Utilisateur u = saved.getUtilisateur();
                u.setTokenResetMdp(token);
                u.setTokenExpiry(java.time.LocalDateTime.now().plusHours(72));
                utilisateurRepository.save(u);
                emailService.envoyerEmailCreationCompte(u.getEmail(), u.getNom(), u.getPrenom(), token);
            } catch (Exception e) {
                System.err.println("Erreur email: " + e.getMessage());
            }
        }

        return toResponse(saved);
    }

    public AdherentDto.Response modifier(Long id, AdherentDto.Request dto) {
        // Vider le cache Hibernate pour forcer la lecture fraîche depuis la base
        entityManager.clear();

        Adherent ancien = adherentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Adherent introuvable: " + id));

        if (dto.getCin() != null && !dto.getCin().equals(ancien.getCin())
                && adherentRepository.existsByCin(dto.getCin()))
            throw new RuntimeException("Un adherent avec ce CIN existe deja.");

        // Capturer les anciennes valeurs FRAÎCHES depuis la base
        final Long    aid      = ancien.getId();
        final String  oldNom   = ancien.getNom();
        final String  oldPren  = ancien.getPrenom();
        final String  oldStat  = ancien.getStatut() != null ? ancien.getStatut().name() : null;
        final String  oldTel   = ancien.getTelephone();
        final String  oldEmail = ancien.getEmail();
        final String  oldSvc   = ancien.getService();
        final String  oldAdr   = ancien.getAdresse();
        final String  oldSit   = ancien.getSituationFamiliale();
        final Integer oldEnf   = ancien.getNombreEnfants();
        final Long    oldCatId = ancien.getCategorie() != null ? ancien.getCategorie().getId() : null;
        final String  oldCatLb = ancien.getCategorie() != null ? ancien.getCategorie().getLibelle() : "Aucune";

        // Modifier et sauvegarder
        mapDtoToAdherent(dto, ancien);
        adherentRepository.save(ancien);

        // Enregistrer les différences dans l'historique
        if (isChanged(dto.getNom(), oldNom))
            historiqueService.enregistrer(aid, "MODIFICATION", "nom", oldNom, dto.getNom(), null);

        if (isChanged(dto.getPrenom(), oldPren))
            historiqueService.enregistrer(aid, "MODIFICATION", "prenom", oldPren, dto.getPrenom(), null);

        if (dto.getStatut() != null && !dto.getStatut().toUpperCase().equals(oldStat))
            historiqueService.enregistrer(aid, "CHANGEMENT_STATUT", "statut", oldStat, dto.getStatut().toUpperCase(), null);

        if (isChanged(dto.getTelephone(), oldTel))
            historiqueService.enregistrer(aid, "MODIFICATION", "telephone", oldTel, dto.getTelephone(), null);

        if (isChanged(dto.getEmail(), oldEmail))
            historiqueService.enregistrer(aid, "MODIFICATION", "email", oldEmail, dto.getEmail(), null);

        if (isChanged(dto.getService(), oldSvc))
            historiqueService.enregistrer(aid, "MODIFICATION", "service", oldSvc, dto.getService(), null);

        if (isChanged(dto.getAdresse(), oldAdr))
            historiqueService.enregistrer(aid, "MODIFICATION", "adresse", oldAdr, dto.getAdresse(), null);

        if (isChanged(dto.getSituationFamiliale(), oldSit))
            historiqueService.enregistrer(aid, "MODIFICATION", "situationFamiliale", oldSit, dto.getSituationFamiliale(), null);

        if (dto.getNombreEnfants() != null && !dto.getNombreEnfants().equals(oldEnf))
            historiqueService.enregistrer(aid, "MODIFICATION", "nombreEnfants",
                String.valueOf(oldEnf), String.valueOf(dto.getNombreEnfants()), null);

        if (dto.getCategorieId() != null && !dto.getCategorieId().equals(oldCatId)) {
            String newLib = ancien.getCategorie() != null ? ancien.getCategorie().getLibelle() : String.valueOf(dto.getCategorieId());
            historiqueService.enregistrer(aid, "MODIFICATION", "categorie", oldCatLb, newLib, null);
        }

        return toResponse(ancien);
    }

    /** Compare deux valeurs en considérant null et vide comme identiques */
    private boolean isChanged(String newVal, String oldVal) {
        if (newVal == null) return false;
        String n = newVal.trim();
        String o = oldVal != null ? oldVal.trim() : "";
        return !n.equals(o);
    }

    public void supprimer(Long id) {
        Adherent a = adherentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Adherent introuvable: " + id));
        adherentRepository.delete(a);
    }

    @Transactional(readOnly = true)
    public AdherentDto.Response findById(Long id) {
        return toResponse(adherentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Adherent introuvable: " + id)));
    }

    @Transactional(readOnly = true)
    public List<AdherentDto.Response> findAll() {
        List<AdherentDto.Response> list = new ArrayList<>();
        for (Adherent a : adherentRepository.findAll()) list.add(toResponse(a));
        return list;
    }

    @Transactional(readOnly = true)
    public List<AdherentDto.Response> findByStatut(String statut) {
        List<AdherentDto.Response> list = new ArrayList<>();
        for (Adherent a : adherentRepository.findByStatut(
                Adherent.StatutAdherent.valueOf(statut.toUpperCase())))
            list.add(toResponse(a));
        return list;
    }

    private String genererNumeroAdherent() {
        String max = adherentRepository.findMaxNumeroAdherent();
        if (max == null) return "ADH-00001";
        try {
            int num = Integer.parseInt(max.replace("ADH-", "")) + 1;
            return String.format("ADH-%05d", num);
        } catch (Exception e) {
            return String.format("ADH-%05d", adherentRepository.count() + 1);
        }
    }

    private Utilisateur creerCompteUtilisateur(Adherent adherent) {
        if (utilisateurRepository.existsByEmail(adherent.getEmail()))
            return utilisateurRepository.findByEmail(adherent.getEmail()).orElse(null);
        Utilisateur u = new Utilisateur();
        u.setNom(adherent.getNom()); u.setPrenom(adherent.getPrenom());
        u.setEmail(adherent.getEmail()); u.setActif(true); u.setCompteConfigure(false);
        return utilisateurRepository.save(u);
    }

    private void mapDtoToAdherent(AdherentDto.Request dto, Adherent a) {
        a.setNom(dto.getNom()); a.setPrenom(dto.getPrenom());
        a.setCin(dto.getCin()); a.setMatricule(dto.getMatricule());
        a.setDateNaissance(dto.getDateNaissance());
        a.setSituationFamiliale(dto.getSituationFamiliale());
        a.setService(dto.getService()); a.setTelephone(dto.getTelephone());
        a.setAdresse(dto.getAdresse()); a.setEmail(dto.getEmail());
        a.setDateAdhesion(dto.getDateAdhesion() != null ? dto.getDateAdhesion() : LocalDate.now());
        a.setNombreEnfants(dto.getNombreEnfants() != null ? dto.getNombreEnfants() : 0);
        a.setObservations(dto.getObservations());
        if (dto.getRib() != null) a.setRib(dto.getRib());
        if (dto.getStatut() != null) {
            try { a.setStatut(Adherent.StatutAdherent.valueOf(dto.getStatut().toUpperCase())); }
            catch (IllegalArgumentException e) { a.setStatut(Adherent.StatutAdherent.ACTIF); }
        }
        if (dto.getCategorieId() != null)
            categorieRepository.findById(dto.getCategorieId()).ifPresent(a::setCategorie);
    }

    public AdherentDto.Response toResponse(Adherent a) {
        AdherentDto.Response r = new AdherentDto.Response();
        r.setId(a.getId()); r.setNumeroAdherent(a.getNumeroAdherent());
        r.setNom(a.getNom()); r.setPrenom(a.getPrenom());
        r.setCin(a.getCin()); r.setMatricule(a.getMatricule());
        r.setDateNaissance(a.getDateNaissance());
        r.setSituationFamiliale(a.getSituationFamiliale());
        r.setService(a.getService()); r.setTelephone(a.getTelephone());
        r.setAdresse(a.getAdresse()); r.setEmail(a.getEmail());
        r.setDateAdhesion(a.getDateAdhesion());
        r.setStatut(a.getStatut() != null ? a.getStatut().name() : null);
        r.setNombreEnfants(a.getNombreEnfants());
        r.setObservations(a.getObservations());
        r.setRib(a.getRib());
        r.setDateCreation(a.getDateCreation());
        r.setPhotoChemin(a.getPhotoData() != null && a.getPhotoData().length > 0 ? "/api/adherents/" + a.getId() + "/photo" : null);
        if (a.getCategorie() != null) {
            CategorieAdhesionDto.Response cat = new CategorieAdhesionDto.Response();
            cat.setId(a.getCategorie().getId()); cat.setLibelle(a.getCategorie().getLibelle());
            cat.setMontant(a.getCategorie().getMontant()); cat.setActif(a.getCategorie().getActif());
            r.setCategorie(cat);
        }
        if (a.getUtilisateur() != null) {
            r.setUtilisateurId(a.getUtilisateur().getId());
            r.setCompteUtilisateurCree(true);
        }
        return r;
    }
}