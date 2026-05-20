package com.cdc.CDCApplication.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "operations_compte_bancaire")
public class OperationCompteBancaire {

    public enum TypeOperation { CREDIT, DEBIT }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "compte_id", nullable = false)
    private CompteBancaire compte;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_operation", nullable = false)
    private TypeOperation typeOperation;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal montant;

    @Column(name = "date_operation", nullable = false)
    private LocalDate dateOperation = LocalDate.now();

    private String reference;

    @Column(length = 1000)
    private String description;

    @Column(name = "solde_avant", precision = 15, scale = 2)
    private BigDecimal soldeAvant;

    @Column(name = "solde_apres", precision = 15, scale = 2)
    private BigDecimal soldeApres;

    // Lien optionnel vers un virement
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "virement_id")
    private Virement virement;

    public OperationCompteBancaire() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public CompteBancaire getCompte() { return compte; }
    public void setCompte(CompteBancaire c) { this.compte = c; }
    public TypeOperation getTypeOperation() { return typeOperation; }
    public void setTypeOperation(TypeOperation t) { this.typeOperation = t; }
    public BigDecimal getMontant() { return montant; }
    public void setMontant(BigDecimal m) { this.montant = m; }
    public LocalDate getDateOperation() { return dateOperation; }
    public void setDateOperation(LocalDate d) { this.dateOperation = d; }
    public String getReference() { return reference; }
    public void setReference(String r) { this.reference = r; }
    public String getDescription() { return description; }
    public void setDescription(String d) { this.description = d; }
    public BigDecimal getSoldeAvant() { return soldeAvant; }
    public void setSoldeAvant(BigDecimal s) { this.soldeAvant = s; }
    public BigDecimal getSoldeApres() { return soldeApres; }
    public void setSoldeApres(BigDecimal s) { this.soldeApres = s; }
    public Virement getVirement() { return virement; }
    public void setVirement(Virement v) { this.virement = v; }
}