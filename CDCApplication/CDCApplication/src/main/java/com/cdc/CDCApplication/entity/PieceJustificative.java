package com.cdc.CDCApplication.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pieces_justificatives")
public class PieceJustificative {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "adherent_id", nullable = false)
    private Adherent adherent;

    @Column(nullable = false)
    private String nom; 

    @Column(nullable = false)
    private String typePiece; 

    @Column(name = "chemin_fichier", nullable = false)
    private String cheminFichier; 

    @Column(name = "type_contenu")
    private String typeContenu; // image/jpeg, application/pdf...

    @Column(name = "taille_octets")
    private Long tailleOctets;

    @Column(name = "date_ajout")
    private LocalDateTime dateAjout = LocalDateTime.now();

    @Column(name = "ajoute_par")
    private String ajoutePar;

    public PieceJustificative() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Adherent getAdherent() { return adherent; }
    public void setAdherent(Adherent a) { this.adherent = a; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getTypePiece() { return typePiece; }
    public void setTypePiece(String t) { this.typePiece = t; }
    public String getCheminFichier() { return cheminFichier; }
    public void setCheminFichier(String c) { this.cheminFichier = c; }
    public String getTypeContenu() { return typeContenu; }
    public void setTypeContenu(String t) { this.typeContenu = t; }
    public Long getTailleOctets() { return tailleOctets; }
    public void setTailleOctets(Long t) { this.tailleOctets = t; }
    public LocalDateTime getDateAjout() { return dateAjout; }
    public void setDateAjout(LocalDateTime d) { this.dateAjout = d; }
    public String getAjoutePar() { return ajoutePar; }
    public void setAjoutePar(String a) { this.ajoutePar = a; }
}