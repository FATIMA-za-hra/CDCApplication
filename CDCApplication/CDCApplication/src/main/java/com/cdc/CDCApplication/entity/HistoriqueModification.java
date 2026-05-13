package com.cdc.CDCApplication.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "historique_modifications")
public class HistoriqueModification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    
    @Column(name = "adherent_id", nullable = false)
    private Long adherentId;

    @Column(nullable = false)
    private String action;

    @Column(name = "champ_modifie")
    private String champModifie;

    @Column(name = "ancienne_valeur", length = 1000)
    private String ancienneValeur;

    @Column(name = "nouvelle_valeur", length = 1000)
    private String nouvelleValeur;

    @Column(name = "date_modification", nullable = false)
    private LocalDateTime dateModification = LocalDateTime.now();

    @Column(name = "modifie_par")
    private String modifiePar;

    @Column(length = 500)
    private String commentaire;

    public HistoriqueModification() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAdherentId() { return adherentId; }
    public void setAdherentId(Long adherentId) { this.adherentId = adherentId; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getChampModifie() { return champModifie; }
    public void setChampModifie(String c) { this.champModifie = c; }
    public String getAncienneValeur() { return ancienneValeur; }
    public void setAncienneValeur(String a) { this.ancienneValeur = a; }
    public String getNouvelleValeur() { return nouvelleValeur; }
    public void setNouvelleValeur(String n) { this.nouvelleValeur = n; }
    public LocalDateTime getDateModification() { return dateModification; }
    public void setDateModification(LocalDateTime d) { this.dateModification = d; }
    public String getModifiePar() { return modifiePar; }
    public void setModifiePar(String m) { this.modifiePar = m; }
    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String c) { this.commentaire = c; }
}