package com.cdc.CDCApplication.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "workflow_validations")
public class WorkflowValidation {

    public enum Etape {
        AGENT_BUREAU,
        PRESIDENT
    }

    public enum Decision {
        EN_ATTENTE,
        APPROUVE,
        REJETE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aide_id", nullable = false)
    private Aide aide;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Etape etape;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Decision decision = Decision.EN_ATTENTE;

    @Column(name = "date_decision")
    private LocalDateTime dateDecision;

    @Column(length = 1000)
    private String commentaire;

    @Column(name = "valide_par")
    private String validePar;

    @Column(name = "montant_propose")
    private java.math.BigDecimal montantPropose; // montant proposé par l'agent de bureau

    @Column(name = "ordre", nullable = false)
    private Integer ordre; 

    public WorkflowValidation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Aide getAide() { return aide; }
    public void setAide(Aide a) { this.aide = a; }
    public Etape getEtape() { return etape; }
    public void setEtape(Etape e) { this.etape = e; }
    public Decision getDecision() { return decision; }
    public void setDecision(Decision d) { this.decision = d; }
    public LocalDateTime getDateDecision() { return dateDecision; }
    public void setDateDecision(LocalDateTime d) { this.dateDecision = d; }
    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String c) { this.commentaire = c; }
    public String getValidePar() { return validePar; }
    public void setValidePar(String v) { this.validePar = v; }
    public java.math.BigDecimal getMontantPropose() { return montantPropose; }
    public void setMontantPropose(java.math.BigDecimal m) { this.montantPropose = m; }
    public Integer getOrdre() { return ordre; }
    public void setOrdre(Integer o) { this.ordre = o; }
}