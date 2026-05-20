package com.cdc.CDCApplication.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "comptes_bancaires")
public class CompteBancaire {

    public enum StatutCompte { ACTIF, FERME, SUSPENDU }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_compte", nullable = false, unique = true)
    private String numeroCompte;

    @Column(nullable = false)
    private String iban;

    @Column(nullable = false)
    private String banque;

    @Column(nullable = false)
    private String titulaire;

    @Column(precision = 15, scale = 2)
    private BigDecimal solde = BigDecimal.ZERO;

    @Column(name = "date_ouverture")
    private LocalDate dateOuverture = LocalDate.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutCompte statut = StatutCompte.ACTIF;

    @OneToMany(mappedBy = "compte", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OperationCompteBancaire> operations = new ArrayList<>();

    public CompteBancaire() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNumeroCompte() { return numeroCompte; }
    public void setNumeroCompte(String n) { this.numeroCompte = n; }
    public String getIban() { return iban; }
    public void setIban(String iban) { this.iban = iban; }
    public String getBanque() { return banque; }
    public void setBanque(String b) { this.banque = b; }
    public String getTitulaire() { return titulaire; }
    public void setTitulaire(String t) { this.titulaire = t; }
    public BigDecimal getSolde() { return solde; }
    public void setSolde(BigDecimal s) { this.solde = s; }
    public LocalDate getDateOuverture() { return dateOuverture; }
    public void setDateOuverture(LocalDate d) { this.dateOuverture = d; }
    public StatutCompte getStatut() { return statut; }
    public void setStatut(StatutCompte s) { this.statut = s; }
    public List<OperationCompteBancaire> getOperations() { return operations; }
    public void setOperations(List<OperationCompteBancaire> o) { this.operations = o; }
}