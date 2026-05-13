package com.cdc.CDCApplication.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "virements")
public class Virement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aide_id", nullable = false)
    private Aide aide;

    @Column(nullable = false)
    private String beneficiaire;

    @Column(nullable = false)
    private BigDecimal montant;

    private String motif;

    @Column(name = "reference_virement")
    private String referenceVirement;

    @Column(name = "date_virement")
    private LocalDate dateVirement;

    @Column(name = "rib_beneficiaire")
    private String ribBeneficiaire;

    public Virement() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Aide getAide() { return aide; }
    public void setAide(Aide a) { this.aide = a; }
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
}