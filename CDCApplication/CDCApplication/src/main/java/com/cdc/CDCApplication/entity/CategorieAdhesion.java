package com.cdc.CDCApplication.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "categories_adhesion")
public class CategorieAdhesion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String libelle;

    @Column(nullable = false)
    private BigDecimal montant;

    @Column(length = 1000)
    private String conditions;

    @Column(nullable = false)
    private Boolean actif = true;

    // Périodes de validité (ex: "Janvier-Juin, Juillet-Décembre")
    @Column(name = "periodes_validite", length = 500)
    private String periodesValidite;

    public CategorieAdhesion() {}

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