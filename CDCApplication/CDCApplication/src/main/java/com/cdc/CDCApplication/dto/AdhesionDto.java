package com.cdc.CDCApplication.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class AdhesionDto {

    public static class Request {
        private Long adherentId;
        private Long categorieId;
        private Integer annee;
        private LocalDate datePaiement;
        private BigDecimal montant;
        private String statut;
        private String modePaiement;
        private String referencePaiement;
        private Boolean estExonere;
        private BigDecimal montantExonere;
        private String motifExoneration;
        private String observations;

        public Long getAdherentId() { return adherentId; }
        public void setAdherentId(Long adherentId) { this.adherentId = adherentId; }
        public Long getCategorieId() { return categorieId; }
        public void setCategorieId(Long categorieId) { this.categorieId = categorieId; }
        public Integer getAnnee() { return annee; }
        public void setAnnee(Integer annee) { this.annee = annee; }
        public LocalDate getDatePaiement() { return datePaiement; }
        public void setDatePaiement(LocalDate d) { this.datePaiement = d; }
        public BigDecimal getMontant() { return montant; }
        public void setMontant(BigDecimal montant) { this.montant = montant; }
        public String getStatut() { return statut; }
        public void setStatut(String statut) { this.statut = statut; }
        public String getModePaiement() { return modePaiement; }
        public void setModePaiement(String modePaiement) { this.modePaiement = modePaiement; }
        public String getReferencePaiement() { return referencePaiement; }
        public void setReferencePaiement(String r) { this.referencePaiement = r; }
        public Boolean getEstExonere() { return estExonere; }
        public void setEstExonere(Boolean estExonere) { this.estExonere = estExonere; }
        public BigDecimal getMontantExonere() { return montantExonere; }
        public void setMontantExonere(BigDecimal m) { this.montantExonere = m; }
        public String getMotifExoneration() { return motifExoneration; }
        public void setMotifExoneration(String m) { this.motifExoneration = m; }
        public String getObservations() { return observations; }
        public void setObservations(String observations) { this.observations = observations; }
    }

    public static class Response {
        private Long id;
        private AdherentDto.Response adherent;
        private CategorieAdhesionDto.Response categorie;
        private Integer annee;
        private LocalDate datePaiement;
        private BigDecimal montant;
        private BigDecimal montantExonere;
        private String statut;
        private String modePaiement;
        private String referencePaiement;
        private Boolean estExonere;
        private String motifExoneration;
        private String observations;
        private LocalDate dateCreation;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public AdherentDto.Response getAdherent() { return adherent; }
        public void setAdherent(AdherentDto.Response a) { this.adherent = a; }
        public CategorieAdhesionDto.Response getCategorie() { return categorie; }
        public void setCategorie(CategorieAdhesionDto.Response c) { this.categorie = c; }
        public Integer getAnnee() { return annee; }
        public void setAnnee(Integer annee) { this.annee = annee; }
        public LocalDate getDatePaiement() { return datePaiement; }
        public void setDatePaiement(LocalDate d) { this.datePaiement = d; }
        public BigDecimal getMontant() { return montant; }
        public void setMontant(BigDecimal montant) { this.montant = montant; }
        public BigDecimal getMontantExonere() { return montantExonere; }
        public void setMontantExonere(BigDecimal m) { this.montantExonere = m; }
        public String getStatut() { return statut; }
        public void setStatut(String statut) { this.statut = statut; }
        public String getModePaiement() { return modePaiement; }
        public void setModePaiement(String m) { this.modePaiement = m; }
        public String getReferencePaiement() { return referencePaiement; }
        public void setReferencePaiement(String r) { this.referencePaiement = r; }
        public Boolean getEstExonere() { return estExonere; }
        public void setEstExonere(Boolean e) { this.estExonere = e; }
        public String getMotifExoneration() { return motifExoneration; }
        public void setMotifExoneration(String m) { this.motifExoneration = m; }
        public String getObservations() { return observations; }
        public void setObservations(String o) { this.observations = o; }
        public LocalDate getDateCreation() { return dateCreation; }
        public void setDateCreation(LocalDate d) { this.dateCreation = d; }
    }
}