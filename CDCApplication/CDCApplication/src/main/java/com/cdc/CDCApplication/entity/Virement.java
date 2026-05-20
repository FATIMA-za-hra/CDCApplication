package com.cdc.CDCApplication.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "virements")
public class Virement {

    public enum StatutVirement {
        EN_ATTENTE,  
        EXECUTE,     
        ANNULE       
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Lien aide sociale (optionnel — virement peut être indépendant d'une aide)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aide_id")
    private Aide aide;

    // Lien caisse (optionnel — sortie depuis la caisse)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "caisse_id")
    private Caisse caisse;

    @Column(nullable = false)
    private String beneficiaire;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal montant;

    private String motif;

    @Column(name = "reference_virement")
    private String referenceVirement;

    @Column(name = "date_virement")
    private LocalDate dateVirement;

    @Column(name = "rib_beneficiaire")
    private String ribBeneficiaire;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutVirement statut = StatutVirement.EN_ATTENTE;

    @Column(name = "execute_par")
    private String executePar;

    @Column(name = "date_execution")
    private LocalDate dateExecution;

    public Virement() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Aide getAide() { return aide; }
    public void setAide(Aide a) { this.aide = a; }
    public Caisse getCaisse() { return caisse; }
    public void setCaisse(Caisse c) { this.caisse = c; }
    public String getBeneficiaire() { return beneficiaire; }
    public void setBeneficiaire(String b) { this.beneficiaire = b; }
    public BigDecimal getMontant() { return montant; }
    public void setMontant(BigDecimal m) { this.montant = m; }
    public String getMotif() { return motif; }
    public void setMotif(String m) { this.motif = m; }
    public String getReferenceVirement() { return referenceVirement; }
    public void setReferenceVirement(String r) { this.referenceVirement = r; }
    public LocalDate getDateVirement() { return dateVirement; }
    public void setDateVirement(LocalDate d) { this.dateVirement = d; }
    public String getRibBeneficiaire() { return ribBeneficiaire; }
    public void setRibBeneficiaire(String r) { this.ribBeneficiaire = r; }
    public StatutVirement getStatut() { return statut; }
    public void setStatut(StatutVirement s) { this.statut = s; }
    public String getExecutePar() { return executePar; }
    public void setExecutePar(String e) { this.executePar = e; }
    public LocalDate getDateExecution() { return dateExecution; }
    public void setDateExecution(LocalDate d) { this.dateExecution = d; }
}