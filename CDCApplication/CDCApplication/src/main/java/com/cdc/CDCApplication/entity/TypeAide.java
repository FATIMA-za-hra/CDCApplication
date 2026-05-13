package com.cdc.CDCApplication.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "types_aide")
public class TypeAide {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nom;

    @Column(name = "montant_max")
    private BigDecimal montantMax;

    @Column(length = 1000)
    private String conditions;

    @Column(name = "actif", nullable = false)
    private Boolean actif = true;

    @Column(name = "delai_mois")
    private Integer delaiMois; 

    public TypeAide() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public BigDecimal getMontantMax() { return montantMax; }
    public void setMontantMax(BigDecimal m) { this.montantMax = m; }
    public String getConditions() { return conditions; }
    public void setConditions(String c) { this.conditions = c; }
    public Boolean getActif() { return actif; }
    public void setActif(Boolean actif) { this.actif = actif; }
    public Integer getDelaiMois() { return delaiMois; }
    public void setDelaiMois(Integer d) { this.delaiMois = d; }
}