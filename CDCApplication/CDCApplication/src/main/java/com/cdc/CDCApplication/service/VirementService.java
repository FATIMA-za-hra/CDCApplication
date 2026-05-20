package com.cdc.CDCApplication.service;

import com.cdc.CDCApplication.dto.VirementDto;
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
public class VirementService {

    private final VirementRepository               virementRepository;
    private final AideRepository                   aideRepository;
    private final CaisseRepository                 caisseRepository;
    private final OperationCaisseRepository        operationCaisseRepository;
    private final CompteBancaireRepository         compteRepository;
    private final OperationCompteBancaireRepository operationCompteRepository;
    private final UtilisateurRepository            utilisateurRepository;

    public VirementService(VirementRepository virementRepository,
                            AideRepository aideRepository,
                            CaisseRepository caisseRepository,
                            OperationCaisseRepository operationCaisseRepository,
                            CompteBancaireRepository compteRepository,
                            OperationCompteBancaireRepository operationCompteRepository,
                            UtilisateurRepository utilisateurRepository) {
        this.virementRepository      = virementRepository;
        this.aideRepository          = aideRepository;
        this.caisseRepository        = caisseRepository;
        this.operationCaisseRepository = operationCaisseRepository;
        this.compteRepository        = compteRepository;
        this.operationCompteRepository = operationCompteRepository;
        this.utilisateurRepository   = utilisateurRepository;
    }

    // ════════════════════════════════════
    // VIREMENTS
    // ════════════════════════════════════

    @Transactional(readOnly = true)
    public List<VirementDto.Response> findAll() {
        List<VirementDto.Response> list = new ArrayList<>();
        for (Virement v : virementRepository.findAllByOrderByDateVirementDesc())
            list.add(toVirementResponse(v));
        return list;
    }

    @Transactional(readOnly = true)
    public List<VirementDto.Response> findByStatut(String statut) {
        List<VirementDto.Response> list = new ArrayList<>();
        Virement.StatutVirement s = Virement.StatutVirement.valueOf(statut.toUpperCase());
        for (Virement v : virementRepository.findByStatutOrderByDateVirementDesc(s))
            list.add(toVirementResponse(v));
        return list;
    }

    /**
     * Créer un virement.
     * Si caisseId fourni → génère automatiquement une sortie de caisse.
     * Si aideId fourni → lie le virement à l'aide.
     */
    public VirementDto.Response creer(VirementDto.Request dto) {
        Virement v = new Virement();
        v.setBeneficiaire(dto.getBeneficiaire());
        v.setMontant(dto.getMontant());
        v.setMotif(dto.getMotif());
        v.setReferenceVirement(dto.getReferenceVirement());
        v.setDateVirement(dto.getDateVirement() != null ? dto.getDateVirement() : LocalDate.now());
        v.setRibBeneficiaire(dto.getRibBeneficiaire());
        v.setStatut(Virement.StatutVirement.EN_ATTENTE);

        if (dto.getAideId() != null)
            aideRepository.findById(dto.getAideId()).ifPresent(v::setAide);

        if (dto.getCaisseId() != null)
            caisseRepository.findById(dto.getCaisseId()).ifPresent(v::setCaisse);

        return toVirementResponse(virementRepository.save(v));
    }

    /**
     * Exécuter un virement EN_ATTENTE → EXECUTE.
     * Génère automatiquement une sortie de caisse si la caisse est liée.
     */
    public VirementDto.Response executer(Long virementId) {
        Virement v = getVirement(virementId);
        if (v.getStatut() != Virement.StatutVirement.EN_ATTENTE)
            throw new RuntimeException("Seul un virement EN_ATTENTE peut etre execute.");

        v.setStatut(Virement.StatutVirement.EXECUTE);
        v.setExecutePar(getCurrentUserNomPrenom());
        v.setDateExecution(LocalDate.now());

        // Si lié à une caisse → créer une sortie automatiquement
        if (v.getCaisse() != null) {
            Caisse caisse = v.getCaisse();
            if (caisse.getStatut() != Caisse.StatutCaisse.OUVERTE)
                throw new RuntimeException("La caisse doit etre ouverte pour executer ce virement.");
            if (caisse.getSolde().compareTo(v.getMontant()) < 0)
                throw new RuntimeException("Solde de caisse insuffisant: " + caisse.getSolde() + " MAD");

            BigDecimal soldeAvant = caisse.getSolde();
            BigDecimal soldeApres = soldeAvant.subtract(v.getMontant());

            OperationCaisse op = new OperationCaisse();
            op.setCaisse(caisse);
            op.setType(OperationCaisse.TypeOperation.SORTIE);
            op.setMontant(v.getMontant());
            op.setDate(LocalDate.now());
            op.setCategorie("VIREMENT_AIDE");
            op.setJustificatif("Virement à " + v.getBeneficiaire()
                + (v.getReferenceVirement() != null ? " — Ref: " + v.getReferenceVirement() : ""));
            op.setEffectuePar(getCurrentUserNomPrenom());
            op.setSoldeAvant(soldeAvant);
            op.setSoldeApres(soldeApres);
            if (v.getAide() != null) op.setAide(v.getAide());

            caisse.setSolde(soldeApres);
            caisseRepository.save(caisse);
            operationCaisseRepository.save(op);
        }

        return toVirementResponse(virementRepository.save(v));
    }

    public VirementDto.Response annuler(Long virementId) {
        Virement v = getVirement(virementId);
        if (v.getStatut() == Virement.StatutVirement.EXECUTE)
            throw new RuntimeException("Un virement execute ne peut pas etre annule.");
        v.setStatut(Virement.StatutVirement.ANNULE);
        return toVirementResponse(virementRepository.save(v));
    }

    // ════════════════════════════════════
    // COMPTES BANCAIRES
    // ════════════════════════════════════

    @Transactional(readOnly = true)
    public List<VirementDto.CompteBancaireResponse> findComptes() {
        List<VirementDto.CompteBancaireResponse> list = new ArrayList<>();
        for (CompteBancaire c : compteRepository.findAll()) list.add(toCompteResponse(c));
        return list;
    }

    public VirementDto.CompteBancaireResponse creerCompte(VirementDto.CompteBancaireRequest dto) {
        if (compteRepository.existsByNumeroCompte(dto.getNumeroCompte()))
            throw new RuntimeException("Un compte avec ce numero existe deja.");
        if (dto.getIban() != null && compteRepository.existsByIban(dto.getIban()))
            throw new RuntimeException("Un compte avec cet IBAN existe deja.");

        CompteBancaire c = new CompteBancaire();
        c.setNumeroCompte(dto.getNumeroCompte());
        c.setIban(dto.getIban());
        c.setBanque(dto.getBanque());
        c.setTitulaire(dto.getTitulaire());
        c.setSolde(dto.getSoldeInitial() != null ? dto.getSoldeInitial() : BigDecimal.ZERO);
        c.setDateOuverture(LocalDate.now());
        c.setStatut(CompteBancaire.StatutCompte.ACTIF);
        return toCompteResponse(compteRepository.save(c));
    }

    public VirementDto.CompteBancaireResponse fermerCompte(Long compteId) {
        CompteBancaire c = compteRepository.findById(compteId)
                .orElseThrow(() -> new RuntimeException("Compte introuvable"));
        c.setStatut(CompteBancaire.StatutCompte.FERME);
        return toCompteResponse(compteRepository.save(c));
    }

    @Transactional(readOnly = true)
    public List<VirementDto.OperationCompteResponse> findOperationsCompte(Long compteId) {
        List<VirementDto.OperationCompteResponse> list = new ArrayList<>();
        for (OperationCompteBancaire op :
                operationCompteRepository.findByCompteIdOrderByDateOperationDescIdDesc(compteId))
            list.add(toOpCompteResponse(op));
        return list;
    }

    public VirementDto.OperationCompteResponse enregistrerOperationCompte(
            Long compteId, String type, BigDecimal montant,
            String reference, String description) {

        CompteBancaire compte = compteRepository.findById(compteId)
                .orElseThrow(() -> new RuntimeException("Compte introuvable"));
        if (compte.getStatut() != CompteBancaire.StatutCompte.ACTIF)
            throw new RuntimeException("Le compte doit etre actif.");

        OperationCompteBancaire.TypeOperation typeOp =
                OperationCompteBancaire.TypeOperation.valueOf(type.toUpperCase());

        if (typeOp == OperationCompteBancaire.TypeOperation.DEBIT
                && compte.getSolde().compareTo(montant) < 0)
            throw new RuntimeException("Solde insuffisant: " + compte.getSolde() + " MAD");

        BigDecimal soldeAvant = compte.getSolde();
        BigDecimal soldeApres = typeOp == OperationCompteBancaire.TypeOperation.CREDIT
                ? soldeAvant.add(montant) : soldeAvant.subtract(montant);

        OperationCompteBancaire op = new OperationCompteBancaire();
        op.setCompte(compte);
        op.setTypeOperation(typeOp);
        op.setMontant(montant);
        op.setDateOperation(LocalDate.now());
        op.setReference(reference);
        op.setDescription(description);
        op.setSoldeAvant(soldeAvant);
        op.setSoldeApres(soldeApres);

        compte.setSolde(soldeApres);
        compteRepository.save(compte);
        return toOpCompteResponse(operationCompteRepository.save(op));
    }

    // ════════════════════════════════════
    // HELPERS
    // ════════════════════════════════════

    private Virement getVirement(Long id) {
        return virementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Virement introuvable"));
    }

    private String getCurrentUserNomPrenom() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Utilisateur u = utilisateurRepository.findByEmail(email).orElse(null);
            if (u != null) return u.getPrenom() + " " + u.getNom();
            return email;
        } catch (Exception e) { return "Systeme"; }
    }

    private VirementDto.Response toVirementResponse(Virement v) {
        VirementDto.Response r = new VirementDto.Response();
        r.setId(v.getId());
        r.setBeneficiaire(v.getBeneficiaire());
        r.setMontant(v.getMontant());
        r.setMotif(v.getMotif());
        r.setReferenceVirement(v.getReferenceVirement());
        r.setDateVirement(v.getDateVirement());
        r.setRibBeneficiaire(v.getRibBeneficiaire());
        r.setStatut(v.getStatut() != null ? v.getStatut().name() : null);
        r.setExecutePar(v.getExecutePar());
        r.setDateExecution(v.getDateExecution());
        if (v.getAide() != null) {
            r.setAideId(v.getAide().getId());
            r.setAideNumero(v.getAide().getNumeroDemande());
            if (v.getAide().getAdherent() != null)
                r.setAdherentNom(v.getAide().getAdherent().getPrenom()
                    + " " + v.getAide().getAdherent().getNom());
        }
        if (v.getCaisse() != null) {
            r.setCaisseId(v.getCaisse().getId());
            r.setCaisseNom(v.getCaisse().getNom());
        }
        return r;
    }

    private VirementDto.CompteBancaireResponse toCompteResponse(CompteBancaire c) {
        VirementDto.CompteBancaireResponse r = new VirementDto.CompteBancaireResponse();
        r.setId(c.getId()); r.setNumeroCompte(c.getNumeroCompte());
        r.setIban(c.getIban()); r.setBanque(c.getBanque());
        r.setTitulaire(c.getTitulaire()); r.setSolde(c.getSolde());
        r.setDateOuverture(c.getDateOuverture());
        r.setStatut(c.getStatut() != null ? c.getStatut().name() : null);
        r.setTotalCredits(operationCompteRepository.sumCreditsByCompte(c.getId()));
        r.setTotalDebits(operationCompteRepository.sumDebitsByCompte(c.getId()));
        return r;
    }

    private VirementDto.OperationCompteResponse toOpCompteResponse(OperationCompteBancaire op) {
        VirementDto.OperationCompteResponse r = new VirementDto.OperationCompteResponse();
        r.setId(op.getId());
        r.setCompteId(op.getCompte() != null ? op.getCompte().getId() : null);
        r.setTypeOperation(op.getTypeOperation() != null ? op.getTypeOperation().name() : null);
        r.setMontant(op.getMontant()); r.setDateOperation(op.getDateOperation());
        r.setReference(op.getReference()); r.setDescription(op.getDescription());
        r.setSoldeAvant(op.getSoldeAvant()); r.setSoldeApres(op.getSoldeApres());
        if (op.getVirement() != null) r.setVirementId(op.getVirement().getId());
        return r;
    }
}