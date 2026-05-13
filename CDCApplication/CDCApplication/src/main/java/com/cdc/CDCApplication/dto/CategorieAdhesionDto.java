package com.cdc.CDCApplication.dto;

import java.math.BigDecimal;

public class CategorieAdhesionDto {

    public static class Request {
        private String libelle;
        private BigDecimal montant;
        private String conditions;
        private Boolean actif;
        private String periodesValidite;

        public String getLibelle() { return libelle; }
        public void setLibelle(String libelle) { this.libelle = libelle; }
        public BigDecimal getMontant() { return montant; }
        public void setMontant(BigDecimal montant) { this.montant = montant; }
        public String getConditions() { return conditions; }
        public void setConditions(String conditions) { this.conditions = conditions; }
        public Boolean getActif() { return actif; }
        public void setActif(Boolean actif) { this.actif = actif; }
        public String getPeriodesValidite() { return periodesValidite; }
        public void setPeriodesValidite(String periodesValidite) { this.periodesValidite = periodesValidite; }
    }

    public static class Response {
        private Long id;
        private String libelle;
        private BigDecimal montant;
        private String conditions;
        private Boolean actif;
        private String periodesValidite;

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
        public String getPeriodesValidite() { return periodesValidite; }
        public void setPeriodesValidite(String periodesValidite) { this.periodesValidite = periodesValidite; }
    }
}