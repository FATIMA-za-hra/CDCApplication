package com.cdc.CDCApplication.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "adhesions")
public class Adhesion {

    public enum StatutAdhesion {
        EN_ATTENTE, PAYE, EXONERE, ANNULE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "adherent_id", nullable = false)
    private Adherent adherent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_id")
    private CategorieAdhesion categorie;

    @Column(nullable = false)
    private Integer annee;

    @Column(name = "date_paiement")
    private LocalDate datePaiement;

    @Column(name = "date_creation")
    private LocalDate dateCreation = LocalDate.now();

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal montant = BigDecimal.ZERO;

    @Column(name = "montant_exonere", precision = 15, scale = 2)
    private BigDecimal montantExonere = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutAdhesion statut = StatutAdhesion.EN_ATTENTE;

    @Column(name = "mode_paiement")
    private String modePaiement;

    @Column(name = "reference_paiement")
    private String referencePaiement;

    @Column(name = "est_exonere")
    private Boolean estExonere = false;

    @Column(name = "motif_exoneration")
    private String motifExoneration;

    @Column(length = 1000)
    private String observations;

    public Adhesion() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Adherent getAdherent() { return adherent; }
    public void setAdherent(Adherent a) { this.adherent = a; }
    public CategorieAdhesion getCategorie() { return categorie; }
    public void setCategorie(CategorieAdhesion c) { this.categorie = c; }
    public Integer getAnnee() { return annee; }
    public void setAnnee(Integer annee) { this.annee = annee; }
    public LocalDate getDatePaiement() { return datePaiement; }
    public void setDatePaiement(LocalDate d) { this.datePaiement = d; }
    public LocalDate getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDate d) { this.dateCreation = d; }
    public BigDecimal getMontant() { return montant; }
    public void setMontant(BigDecimal m) { this.montant = m; }
    public BigDecimal getMontantExonere() { return montantExonere; }
    public void setMontantExonere(BigDecimal m) { this.montantExonere = m; }
    public StatutAdhesion getStatut() { return statut; }
    public void setStatut(StatutAdhesion s) { this.statut = s; }
    public String getModePaiement() { return modePaiement; }
    public void setModePaiement(String m) { this.modePaiement = m; }
    public String getReferencePaiement() { return referencePaiement; }
    public void setReferencePaiement(String r) { this.referencePaiement = r; }
    public Boolean getEstExonere() { return estExonere; }
    public void setEstExonere(Boolean e) { this.estExonere = e; }
    public String getMotifExoneration() { return motifExoneration; }
    public void setMotifExoneration(String m) { this.motifExoneration = m; }
    public String getObservations() { return observations; }
    public void setObservations(String o) { this.observations = o; }
}