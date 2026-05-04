package com.cdc.CDCApplication.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CategorieAdhesionDto {

    public static class Request {
        private String libelle;
        private BigDecimal montant;
        private String conditions;
        private Boolean actif;
        private LocalDate dateDebutValidite;
        private LocalDate dateFinValidite;
        private String description;

        public String getLibelle() { return libelle; }
        public void setLibelle(String libelle) { this.libelle = libelle; }
        public BigDecimal getMontant() { return montant; }
        public void setMontant(BigDecimal montant) { this.montant = montant; }
        public String getConditions() { return conditions; }
        public void setConditions(String conditions) { this.conditions = conditions; }
        public Boolean getActif() { return actif; }
        public void setActif(Boolean actif) { this.actif = actif; }
        public LocalDate getDateDebutValidite() { return dateDebutValidite; }
        public void setDateDebutValidite(LocalDate d) { this.dateDebutValidite = d; }
        public LocalDate getDateFinValidite() { return dateFinValidite; }
        public void setDateFinValidite(LocalDate d) { this.dateFinValidite = d; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class Response {
        private Long id;
        private String libelle;
        private BigDecimal montant;
        private String conditions;
        private Boolean actif;
        private LocalDate dateDebutValidite;
        private LocalDate dateFinValidite;
        private String description;
        private long nombreAdherents;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getLibelle() { return libelle; }
        public void setLibelle(String libelle) { this.libelle = libelle; }
        public BigDecimal getMontant() { return montant; }
        public void setMontant(BigDecimal montant) { this.montant = montant; }
        public String getConditions() { return conditions; }
        public void setConditions(String conditions) { this.conditions = conditions; }
        public Boolean getActif() { return actif; }
        public void setActif(Boolean actif) { this.actif = actif; }
        public LocalDate getDateDebutValidite() { return dateDebutValidite; }
        public void setDateDebutValidite(LocalDate d) { this.dateDebutValidite = d; }
        public LocalDate getDateFinValidite() { return dateFinValidite; }
        public void setDateFinValidite(LocalDate d) { this.dateFinValidite = d; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public long getNombreAdherents() { return nombreAdherents; }
        public void setNombreAdherents(long n) { this.nombreAdherents = n; }
    }
}