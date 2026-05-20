package com.cdc.CDCApplication.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "aides")
public class Aide {

    
    public enum EtatAide {
        DEPOSEE,       // Demande déposée par l'agent de gestion
        EN_ETUDE,      // En cours d'étude par l'agent de bureau
        VALIDEE,       // Validée définitivement par le Président
        REJETEE,       // Rejetée (par agent bureau ou président)
        ANNULEE        // Annulée avant traitement
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_demande", unique = true)
    private String numeroDemande;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adherent_id", nullable = false)
    private Adherent adherent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_aide_id", nullable = false)
    private TypeAide typeAide;

    @Column(name = "montant_demande", nullable = false)
    private BigDecimal montantDemande;

    @Column(name = "montant_accorde")
    private BigDecimal montantAccorde; // défini par l'agent de bureau

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EtatAide etat = EtatAide.DEPOSEE;

    @Column(name = "date_demande", nullable = false)
    private LocalDate dateDemande = LocalDate.now();

    @Column(name = "date_traitement")
    private LocalDate dateTraitement;

    @Column(name = "pieces_jointes_dir")
    private String piecesJointesDir;

    @Column(name = "saisi_par")
    private String saisiPar; // Nom Prénom de l'agent qui a saisi (ex: Ali BENMOUSSA)

    @OneToMany(mappedBy = "aide", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("ordre ASC")
    private List<WorkflowValidation> workflows = new ArrayList<>();

    @OneToOne(mappedBy = "aide", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Virement virement;

    public Aide() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNumeroDemande() { return numeroDemande; }
    public void setNumeroDemande(String n) { this.numeroDemande = n; }
    public Adherent getAdherent() { return adherent; }
    public void setAdherent(Adherent a) { this.adherent = a; }
    public TypeAide getTypeAide() { return typeAide; }
    public void setTypeAide(TypeAide t) { this.typeAide = t; }
    public BigDecimal getMontantDemande() { return montantDemande; }
    public void setMontantDemande(BigDecimal m) { this.montantDemande = m; }
    public BigDecimal getMontantAccorde() { return montantAccorde; }
    public void setMontantAccorde(BigDecimal m) { this.montantAccorde = m; }
    public EtatAide getEtat() { return etat; }
    public void setEtat(EtatAide e) { this.etat = e; }
    public LocalDate getDateDemande() { return dateDemande; }
    public void setDateDemande(LocalDate d) { this.dateDemande = d; }
    public LocalDate getDateTraitement() { return dateTraitement; }
    public void setDateTraitement(LocalDate d) { this.dateTraitement = d; }
    public String getPiecesJointesDir() { return piecesJointesDir; }
    public void setPiecesJointesDir(String p) { this.piecesJointesDir = p; }
    public String getSaisiPar() { return saisiPar; }
    public void setSaisiPar(String s) { this.saisiPar = s; }
    public List<WorkflowValidation> getWorkflows() { return workflows; }
    public void setWorkflows(List<WorkflowValidation> w) { this.workflows = w; }
    public Virement getVirement() { return virement; }
    public void setVirement(Virement v) { this.virement = v; }
}