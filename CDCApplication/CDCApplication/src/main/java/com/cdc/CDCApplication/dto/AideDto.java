package com.cdc.CDCApplication.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class AideDto {

    public static class Request {
        private Long adherentId;
        private Long typeAideId;
        private BigDecimal montantDemande;
        private String motif;

        public Long getAdherentId() { return adherentId; }
        public void setAdherentId(Long a) { this.adherentId = a; }
        public Long getTypeAideId() { return typeAideId; }
        public void setTypeAideId(Long t) { this.typeAideId = t; }
        public BigDecimal getMontantDemande() { return montantDemande; }
        public void setMontantDemande(BigDecimal m) { this.montantDemande = m; }
        public String getMotif() { return motif; }
        public void setMotif(String m) { this.motif = m; }
    }

    public static class Response {
        private Long id;
        private String numeroDemande;
        private AdherentInfo adherent;
        private TypeAideInfo typeAide;
        private BigDecimal montantDemande;
        private BigDecimal montantAccorde;
        private String motif;
        private String etat;
        private LocalDate dateDemande;
        private LocalDate dateTraitement;
        private String saisiPar;
        private List<WorkflowInfo> workflows;
        private VirementInfo virement;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getNumeroDemande() { return numeroDemande; }
        public void setNumeroDemande(String n) { this.numeroDemande = n; }
        public AdherentInfo getAdherent() { return adherent; }
        public void setAdherent(AdherentInfo a) { this.adherent = a; }
        public TypeAideInfo getTypeAide() { return typeAide; }
        public void setTypeAide(TypeAideInfo t) { this.typeAide = t; }
        public BigDecimal getMontantDemande() { return montantDemande; }
        public void setMontantDemande(BigDecimal m) { this.montantDemande = m; }
        public BigDecimal getMontantAccorde() { return montantAccorde; }
        public void setMontantAccorde(BigDecimal m) { this.montantAccorde = m; }
        public String getMotif() { return motif; }
        public void setMotif(String m) { this.motif = m; }
        public String getEtat() { return etat; }
        public void setEtat(String e) { this.etat = e; }
        public LocalDate getDateDemande() { return dateDemande; }
        public void setDateDemande(LocalDate d) { this.dateDemande = d; }
        public LocalDate getDateTraitement() { return dateTraitement; }
        public void setDateTraitement(LocalDate d) { this.dateTraitement = d; }
        public String getSaisiPar() { return saisiPar; }
        public void setSaisiPar(String s) { this.saisiPar = s; }
        public List<WorkflowInfo> getWorkflows() { return workflows; }
        public void setWorkflows(List<WorkflowInfo> w) { this.workflows = w; }
        public VirementInfo getVirement() { return virement; }
        public void setVirement(VirementInfo v) { this.virement = v; }
    }

    public static class AdherentInfo {
        private Long id;
        private String nom;
        private String prenom;
        private String numeroAdherent;
        private String cin;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getNom() { return nom; }
        public void setNom(String n) { this.nom = n; }
        public String getPrenom() { return prenom; }
        public void setPrenom(String p) { this.prenom = p; }
        public String getNumeroAdherent() { return numeroAdherent; }
        public void setNumeroAdherent(String n) { this.numeroAdherent = n; }
        public String getCin() { return cin; }
        public void setCin(String c) { this.cin = c; }
    }

    public static class TypeAideInfo {
        private Long id;
        private String nom;
        private BigDecimal montantMax;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getNom() { return nom; }
        public void setNom(String n) { this.nom = n; }
        public BigDecimal getMontantMax() { return montantMax; }
        public void setMontantMax(BigDecimal m) { this.montantMax = m; }
    }

    public static class WorkflowInfo {
        // TOUS les champs déclarés en premier
        private Long id;
        private String etape;
        private String decision;
        private LocalDateTime dateDecision;
        private String commentaire;
        private String validePar;
        private Integer ordre;
        private BigDecimal montantPropose; // champ pour le montant proposé par l'agent bureau

        // Getters / Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getEtape() { return etape; }
        public void setEtape(String e) { this.etape = e; }
        public String getDecision() { return decision; }
        public void setDecision(String d) { this.decision = d; }
        public LocalDateTime getDateDecision() { return dateDecision; }
        public void setDateDecision(LocalDateTime d) { this.dateDecision = d; }
        public String getCommentaire() { return commentaire; }
        public void setCommentaire(String c) { this.commentaire = c; }
        public String getValidePar() { return validePar; }
        public void setValidePar(String v) { this.validePar = v; }
        public Integer getOrdre() { return ordre; }
        public void setOrdre(Integer o) { this.ordre = o; }
        public BigDecimal getMontantPropose() { return montantPropose; }
        public void setMontantPropose(BigDecimal m) { this.montantPropose = m; }
    }

    public static class VirementInfo {
        private Long id;
        private String beneficiaire;
        private BigDecimal montant;
        private String motif;
        private String referenceVirement;
        private LocalDate dateVirement;
        private String ribBeneficiaire;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getBeneficiaire() { return beneficiaire; }
        public void setBeneficiaire(String b) { this.beneficiaire = b; }
        public BigDecimal getMontant() { return montant; }
        public void setMontant(BigDecimal m) { this.montant = m; }
        public String getMotif() { return motif; }
        public void setMotif(String m) { this.motif = m; }
        public String getReferenceVirement() { return referenceVirement; }
        public void setReferenceVirement(String r) { this.referenceVirement = r; }
        public LocalDate getDateVirement() { return dateVirement; }
        public void setDateVirement(LocalDate d) { this.dateVirement = d; }
        public String getRibBeneficiaire() { return ribBeneficiaire; }
        public void setRibBeneficiaire(String r) { this.ribBeneficiaire = r; }
    }

    public static class DecisionRequest {
        private String decision;
        private String commentaire;
        private BigDecimal montantAccorde;

        public String getDecision() { return decision; }
        public void setDecision(String d) { this.decision = d; }
        public String getCommentaire() { return commentaire; }
        public void setCommentaire(String c) { this.commentaire = c; }
        public BigDecimal getMontantAccorde() { return montantAccorde; }
        public void setMontantAccorde(BigDecimal m) { this.montantAccorde = m; }
    }

    public static class VirementRequest {
        private String beneficiaire;
        private BigDecimal montant;
        private String motif;
        private String referenceVirement;
        private LocalDate dateVirement;
        private String ribBeneficiaire;

        public String getBeneficiaire() { return beneficiaire; }
        public void setBeneficiaire(String b) { this.beneficiaire = b; }
        public BigDecimal getMontant() { return montant; }
        public void setMontant(BigDecimal m) { this.montant = m; }
        public String getMotif() { return motif; }
        public void setMotif(String m) { this.motif = m; }
        public String getReferenceVirement() { return referenceVirement; }
        public void setReferenceVirement(String r) { this.referenceVirement = r; }
        public LocalDate getDateVirement() { return dateVirement; }
        public void setDateVirement(LocalDate d) { this.dateVirement = d; }
        public String getRibBeneficiaire() { return ribBeneficiaire; }
        public void setRibBeneficiaire(String r) { this.ribBeneficiaire = r; }
    }
}