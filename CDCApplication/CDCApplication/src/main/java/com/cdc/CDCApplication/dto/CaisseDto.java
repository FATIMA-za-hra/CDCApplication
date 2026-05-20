package com.cdc.CDCApplication.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class CaisseDto {

    public static class Response {
        private Long id;
        private String nom;
        private BigDecimal solde;
        private String responsable;
        private LocalDate dateCreation;
        private String statut;
        // Stats
        private BigDecimal totalEntrees;
        private BigDecimal totalSorties;
        private Long nbOperations;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }
        public BigDecimal getSolde() { return solde; }
        public void setSolde(BigDecimal s) { this.solde = s; }
        public String getResponsable() { return responsable; }
        public void setResponsable(String r) { this.responsable = r; }
        public LocalDate getDateCreation() { return dateCreation; }
        public void setDateCreation(LocalDate d) { this.dateCreation = d; }
        public String getStatut() { return statut; }
        public void setStatut(String s) { this.statut = s; }
        public BigDecimal getTotalEntrees() { return totalEntrees; }
        public void setTotalEntrees(BigDecimal t) { this.totalEntrees = t; }
        public BigDecimal getTotalSorties() { return totalSorties; }
        public void setTotalSorties(BigDecimal t) { this.totalSorties = t; }
        public Long getNbOperations() { return nbOperations; }
        public void setNbOperations(Long n) { this.nbOperations = n; }
    }

    public static class Request {
        private String nom;
        private String responsable;
        public String getNom() { return nom; }
        public void setNom(String n) { this.nom = n; }
        public String getResponsable() { return responsable; }
        public void setResponsable(String r) { this.responsable = r; }
    }

    public static class OperationResponse {
        private Long id;
        private Long caisseId;
        private String type;       // ENTREE ou SORTIE
        private BigDecimal montant;
        private LocalDate date;
        private String categorie;
        private String justificatif;
        private String effectuePar;
        private BigDecimal soldeAvant;
        private BigDecimal soldeApres;
        private Long aideId;
        private String aideNumero;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getCaisseId() { return caisseId; }
        public void setCaisseId(Long c) { this.caisseId = c; }
        public String getType() { return type; }
        public void setType(String t) { this.type = t; }
        public BigDecimal getMontant() { return montant; }
        public void setMontant(BigDecimal m) { this.montant = m; }
        public LocalDate getDate() { return date; }
        public void setDate(LocalDate d) { this.date = d; }
        public String getCategorie() { return categorie; }
        public void setCategorie(String c) { this.categorie = c; }
        public String getJustificatif() { return justificatif; }
        public void setJustificatif(String j) { this.justificatif = j; }
        public String getEffectuePar() { return effectuePar; }
        public void setEffectuePar(String e) { this.effectuePar = e; }
        public BigDecimal getSoldeAvant() { return soldeAvant; }
        public void setSoldeAvant(BigDecimal s) { this.soldeAvant = s; }
        public BigDecimal getSoldeApres() { return soldeApres; }
        public void setSoldeApres(BigDecimal s) { this.soldeApres = s; }
        public Long getAideId() { return aideId; }
        public void setAideId(Long a) { this.aideId = a; }
        public String getAideNumero() { return aideNumero; }
        public void setAideNumero(String a) { this.aideNumero = a; }
    }

    public static class OperationRequest {
        private Long caisseId;
        private String type;        // ENTREE ou SORTIE
        private BigDecimal montant;
        private LocalDate date;
        private String categorie;
        private String justificatif;
        private Long aideId;        // optionnel

        public Long getCaisseId() { return caisseId; }
        public void setCaisseId(Long c) { this.caisseId = c; }
        public String getType() { return type; }
        public void setType(String t) { this.type = t; }
        public BigDecimal getMontant() { return montant; }
        public void setMontant(BigDecimal m) { this.montant = m; }
        public LocalDate getDate() { return date; }
        public void setDate(LocalDate d) { this.date = d; }
        public String getCategorie() { return categorie; }
        public void setCategorie(String c) { this.categorie = c; }
        public String getJustificatif() { return justificatif; }
        public void setJustificatif(String j) { this.justificatif = j; }
        public Long getAideId() { return aideId; }
        public void setAideId(Long a) { this.aideId = a; }
    }
}