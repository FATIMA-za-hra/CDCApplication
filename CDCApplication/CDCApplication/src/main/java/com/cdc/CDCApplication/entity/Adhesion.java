package com.cdc.CDCApplication.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "adhesions")
public class Adhesion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "adherent_id", nullable = false)
    private Adherent adherent;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categorie_id", nullable = false)
    private CategorieAdhesion categorie;

    @Column(nullable = false)
    private Integer annee;

    @Column(name = "date_paiement")
    private LocalDate datePaiement;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal montant;

    @Column(name = "montant_exonere", precision = 10, scale = 2)
    private BigDecimal montantExonere = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    private StatutAdhesion statut = StatutAdhesion.EN_ATTENTE;

    @Column(name = "mode_paiement")
    private String modePaiement; 

    @Column(name = "reference_paiement")
    private String referencePaiement;

    @Column(name = "est_exonere")
    private Boolean estExonere = false;

    @Column(name = "motif_exoneration", length = 500)
    private String motifExoneration;

    @Column(length = 500)
    private String observations;

    @Column(name = "date_creation")
    private LocalDate dateCreation = LocalDate.now();

    public enum StatutAdhesion {
        EN_ATTENTE, PAYE, EXONERE, ANNULE
    }

    public Adhesion() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Adherent getAdherent() { return adherent; }
    public void setAdherent(Adherent adherent) { this.adherent = adherent; }

    public CategorieAdhesion getCategorie() { return categorie; }
    public void setCategorie(CategorieAdhesion categorie) { this.categorie = categorie; }

    public Integer getAnnee() { return annee; }
    public void setAnnee(Integer annee) { this.annee = annee; }

    public LocalDate getDatePaiement() { return datePaiement; }
    public void setDatePaiement(LocalDate datePaiement) { this.datePaiement = datePaiement; }

    public BigDecimal getMontant() { return montant; }
    public void setMontant(BigDecimal montant) { this.montant = montant; }

    public BigDecimal getMontantExonere() { return montantExonere; }
    public void setMontantExonere(BigDecimal montantExonere) { this.montantExonere = montantExonere; }

    public StatutAdhesion getStatut() { return statut; }
    public void setStatut(StatutAdhesion statut) { this.statut = statut; }

    public String getModePaiement() { return modePaiement; }
    public void setModePaiement(String modePaiement) { this.modePaiement = modePaiement; }

    public String getReferencePaiement() { return referencePaiement; }
    public void setReferencePaiement(String referencePaiement) { this.referencePaiement = referencePaiement; }

    public Boolean getEstExonere() { return estExonere; }
    public void setEstExonere(Boolean estExonere) { this.estExonere = estExonere; }

    public String getMotifExoneration() { return motifExoneration; }
    public void setMotifExoneration(String motifExoneration) { this.motifExoneration = motifExoneration; }

    public String getObservations() { return observations; }
    public void setObservations(String observations) { this.observations = observations; }

    public LocalDate getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDate dateCreation) { this.dateCreation = dateCreation; }
}