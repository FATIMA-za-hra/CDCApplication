package com.cdc.CDCApplication.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "operations_caisse")
public class OperationCaisse {

    public enum TypeOperation {
        ENTREE,  
        SORTIE   
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "caisse_id", nullable = false)
    private Caisse caisse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeOperation type;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal montant;

    @Column(nullable = false)
    private LocalDate date = LocalDate.now();

    // Catégorie : Cotisation, Aide, Achat, Divers...
    private String categorie;

    @Column(length = 1000)
    private String justificatif; // description / référence

    @Column(name = "effectue_par")
    private String effectuePar; // nom prénom du trésorier

    @Column(name = "solde_avant", precision = 15, scale = 2)
    private BigDecimal soldeAvant; // solde avant cette opération

    @Column(name = "solde_apres", precision = 15, scale = 2)
    private BigDecimal soldeApres; // solde après

    // Lien optionnel vers un virement aide (si la sortie correspond à une aide validée)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aide_id")
    private Aide aide;

    public OperationCaisse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Caisse getCaisse() { return caisse; }
    public void setCaisse(Caisse c) { this.caisse = c; }
    public TypeOperation getType() { return type; }
    public void setType(TypeOperation t) { this.type = t; }
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
    public Aide getAide() { return aide; }
    public void setAide(Aide a) { this.aide = a; }
}