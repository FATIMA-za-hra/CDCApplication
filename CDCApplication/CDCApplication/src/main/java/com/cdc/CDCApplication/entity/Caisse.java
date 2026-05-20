package com.cdc.CDCApplication.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "caisses")
public class Caisse {

    public enum StatutCaisse { OUVERTE, FERMEE, SUSPENDUE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(precision = 15, scale = 2)
    private BigDecimal solde = BigDecimal.ZERO;

    private String responsable; // nom du trésorier responsable

    @Column(name = "date_creation")
    private LocalDate dateCreation = LocalDate.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutCaisse statut = StatutCaisse.FERMEE;

    @OneToMany(mappedBy = "caisse", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OperationCaisse> operations = new ArrayList<>();

    public Caisse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public BigDecimal getSolde() { return solde; }
    public void setSolde(BigDecimal solde) { this.solde = solde; }
    public String getResponsable() { return responsable; }
    public void setResponsable(String r) { this.responsable = r; }
    public LocalDate getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDate d) { this.dateCreation = d; }
    public StatutCaisse getStatut() { return statut; }
    public void setStatut(StatutCaisse s) { this.statut = s; }
    public List<OperationCaisse> getOperations() { return operations; }
    public void setOperations(List<OperationCaisse> o) { this.operations = o; }
}