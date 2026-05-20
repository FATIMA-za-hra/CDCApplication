package com.cdc.CDCApplication.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class VirementDto {

    public static class Response {
        private Long id;
        private Long aideId;
        private String aideNumero;
        private String adherentNom;
        private Long caisseId;
        private String caisseNom;
        private String beneficiaire;
        private BigDecimal montant;
        private String motif;
        private String referenceVirement;
        private LocalDate dateVirement;
        private String ribBeneficiaire;
        private String statut;
        private String executePar;
        private LocalDate dateExecution;

        public Long getId() { return id; } public void setId(Long id) { this.id = id; }
        public Long getAideId() { return aideId; } public void setAideId(Long a) { this.aideId = a; }
        public String getAideNumero() { return aideNumero; } public void setAideNumero(String a) { this.aideNumero = a; }
        public String getAdherentNom() { return adherentNom; } public void setAdherentNom(String a) { this.adherentNom = a; }
        public Long getCaisseId() { return caisseId; } public void setCaisseId(Long c) { this.caisseId = c; }
        public String getCaisseNom() { return caisseNom; } public void setCaisseNom(String c) { this.caisseNom = c; }
        public String getBeneficiaire() { return beneficiaire; } public void setBeneficiaire(String b) { this.beneficiaire = b; }
        public BigDecimal getMontant() { return montant; } public void setMontant(BigDecimal m) { this.montant = m; }
        public String getMotif() { return motif; } public void setMotif(String m) { this.motif = m; }
        public String getReferenceVirement() { return referenceVirement; } public void setReferenceVirement(String r) { this.referenceVirement = r; }
        public LocalDate getDateVirement() { return dateVirement; } public void setDateVirement(LocalDate d) { this.dateVirement = d; }
        public String getRibBeneficiaire() { return ribBeneficiaire; } public void setRibBeneficiaire(String r) { this.ribBeneficiaire = r; }
        public String getStatut() { return statut; } public void setStatut(String s) { this.statut = s; }
        public String getExecutePar() { return executePar; } public void setExecutePar(String e) { this.executePar = e; }
        public LocalDate getDateExecution() { return dateExecution; } public void setDateExecution(LocalDate d) { this.dateExecution = d; }
    }

    public static class Request {
        private Long aideId;
        private Long caisseId;
        private String beneficiaire;
        private BigDecimal montant;
        private String motif;
        private String referenceVirement;
        private LocalDate dateVirement;
        private String ribBeneficiaire;

        public Long getAideId() { return aideId; } public void setAideId(Long a) { this.aideId = a; }
        public Long getCaisseId() { return caisseId; } public void setCaisseId(Long c) { this.caisseId = c; }
        public String getBeneficiaire() { return beneficiaire; } public void setBeneficiaire(String b) { this.beneficiaire = b; }
        public BigDecimal getMontant() { return montant; } public void setMontant(BigDecimal m) { this.montant = m; }
        public String getMotif() { return motif; } public void setMotif(String m) { this.motif = m; }
        public String getReferenceVirement() { return referenceVirement; } public void setReferenceVirement(String r) { this.referenceVirement = r; }
        public LocalDate getDateVirement() { return dateVirement; } public void setDateVirement(LocalDate d) { this.dateVirement = d; }
        public String getRibBeneficiaire() { return ribBeneficiaire; } public void setRibBeneficiaire(String r) { this.ribBeneficiaire = r; }
    }

    public static class CompteBancaireResponse {
        private Long id;
        private String numeroCompte;
        private String iban;
        private String banque;
        private String titulaire;
        private java.math.BigDecimal solde;
        private java.time.LocalDate dateOuverture;
        private String statut;
        private java.math.BigDecimal totalCredits;
        private java.math.BigDecimal totalDebits;

        public Long getId() { return id; } public void setId(Long id) { this.id = id; }
        public String getNumeroCompte() { return numeroCompte; } public void setNumeroCompte(String n) { this.numeroCompte = n; }
        public String getIban() { return iban; } public void setIban(String i) { this.iban = i; }
        public String getBanque() { return banque; } public void setBanque(String b) { this.banque = b; }
        public String getTitulaire() { return titulaire; } public void setTitulaire(String t) { this.titulaire = t; }
        public java.math.BigDecimal getSolde() { return solde; } public void setSolde(java.math.BigDecimal s) { this.solde = s; }
        public java.time.LocalDate getDateOuverture() { return dateOuverture; } public void setDateOuverture(java.time.LocalDate d) { this.dateOuverture = d; }
        public String getStatut() { return statut; } public void setStatut(String s) { this.statut = s; }
        public java.math.BigDecimal getTotalCredits() { return totalCredits; } public void setTotalCredits(java.math.BigDecimal t) { this.totalCredits = t; }
        public java.math.BigDecimal getTotalDebits() { return totalDebits; } public void setTotalDebits(java.math.BigDecimal t) { this.totalDebits = t; }
    }

    public static class CompteBancaireRequest {
        private String numeroCompte;
        private String iban;
        private String banque;
        private String titulaire;
        private java.math.BigDecimal soldeInitial;

        public String getNumeroCompte() { return numeroCompte; } public void setNumeroCompte(String n) { this.numeroCompte = n; }
        public String getIban() { return iban; } public void setIban(String i) { this.iban = i; }
        public String getBanque() { return banque; } public void setBanque(String b) { this.banque = b; }
        public String getTitulaire() { return titulaire; } public void setTitulaire(String t) { this.titulaire = t; }
        public java.math.BigDecimal getSoldeInitial() { return soldeInitial; } public void setSoldeInitial(java.math.BigDecimal s) { this.soldeInitial = s; }
    }

    public static class OperationCompteResponse {
        private Long id;
        private Long compteId;
        private String typeOperation;
        private java.math.BigDecimal montant;
        private java.time.LocalDate dateOperation;
        private String reference;
        private String description;
        private java.math.BigDecimal soldeAvant;
        private java.math.BigDecimal soldeApres;
        private Long virementId;

        public Long getId() { return id; } public void setId(Long id) { this.id = id; }
        public Long getCompteId() { return compteId; } public void setCompteId(Long c) { this.compteId = c; }
        public String getTypeOperation() { return typeOperation; } public void setTypeOperation(String t) { this.typeOperation = t; }
        public java.math.BigDecimal getMontant() { return montant; } public void setMontant(java.math.BigDecimal m) { this.montant = m; }
        public java.time.LocalDate getDateOperation() { return dateOperation; } public void setDateOperation(java.time.LocalDate d) { this.dateOperation = d; }
        public String getReference() { return reference; } public void setReference(String r) { this.reference = r; }
        public String getDescription() { return description; } public void setDescription(String d) { this.description = d; }
        public java.math.BigDecimal getSoldeAvant() { return soldeAvant; } public void setSoldeAvant(java.math.BigDecimal s) { this.soldeAvant = s; }
        public java.math.BigDecimal getSoldeApres() { return soldeApres; } public void setSoldeApres(java.math.BigDecimal s) { this.soldeApres = s; }
        public Long getVirementId() { return virementId; } public void setVirementId(Long v) { this.virementId = v; }
    }
}