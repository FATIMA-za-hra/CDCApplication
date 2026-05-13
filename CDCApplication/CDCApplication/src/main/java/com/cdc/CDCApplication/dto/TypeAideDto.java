package com.cdc.CDCApplication.dto;

import java.math.BigDecimal;

public class TypeAideDto {

    public static class Request {
        private String nom; private BigDecimal montantMax;
        private String conditions; private Boolean actif; private Integer delaiMois;
        public String getNom() { return nom; } public void setNom(String n) { this.nom = n; }
        public BigDecimal getMontantMax() { return montantMax; } public void setMontantMax(BigDecimal m) { this.montantMax = m; }
        public String getConditions() { return conditions; } public void setConditions(String c) { this.conditions = c; }
        public Boolean getActif() { return actif; } public void setActif(Boolean a) { this.actif = a; }
        public Integer getDelaiMois() { return delaiMois; } public void setDelaiMois(Integer d) { this.delaiMois = d; }
    }

    public static class Response {
        private Long id; private String nom; private BigDecimal montantMax;
        private String conditions; private Boolean actif; private Integer delaiMois;
        public Long getId() { return id; } public void setId(Long id) { this.id = id; }
        public String getNom() { return nom; } public void setNom(String n) { this.nom = n; }
        public BigDecimal getMontantMax() { return montantMax; } public void setMontantMax(BigDecimal m) { this.montantMax = m; }
        public String getConditions() { return conditions; } public void setConditions(String c) { this.conditions = c; }
        public Boolean getActif() { return actif; } public void setActif(Boolean a) { this.actif = a; }
        public Integer getDelaiMois() { return delaiMois; } public void setDelaiMois(Integer d) { this.delaiMois = d; }
    }
}