package com.cdc.CDCApplication.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "adherents")
public class Adherent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_adherent", unique = true)
    private String numeroAdherent;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(unique = true)
    private String cin;

    private String matricule;

    @Column(name = "date_naissance")
    private LocalDate dateNaissance;

    @Column(name = "situation_familiale")
    private String situationFamiliale; 

    private String service;
    private String telephone;
    private String adresse;
    private String email;

    @Column(name = "date_adhesion")
    private LocalDate dateAdhesion;

    @Enumerated(EnumType.STRING)
    private StatutAdherent statut = StatutAdherent.ACTIF;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_id")
    private CategorieAdhesion categorie;

    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id")
    private Utilisateur utilisateur;

    @Column(name = "nombre_enfants")
    private Integer nombreEnfants = 0;

    @Column(length = 1000)
    private String observations;

    @Column(name = "date_creation")
    private LocalDate dateCreation = LocalDate.now();

    public enum StatutAdherent {
        ACTIF, SUSPENDU, RADIE, DEMISSIONNAIRE, DECEDE
    }

    public Adherent() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNumeroAdherent() { return numeroAdherent; }
    public void setNumeroAdherent(String numeroAdherent) { this.numeroAdherent = numeroAdherent; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getCin() { return cin; }
    public void setCin(String cin) { this.cin = cin; }

    public String getMatricule() { return matricule; }
    public void setMatricule(String matricule) { this.matricule = matricule; }

    public LocalDate getDateNaissance() { return dateNaissance; }
    public void setDateNaissance(LocalDate dateNaissance) { this.dateNaissance = dateNaissance; }

    public String getSituationFamiliale() { return situationFamiliale; }
    public void setSituationFamiliale(String situationFamiliale) { this.situationFamiliale = situationFamiliale; }

    public String getService() { return service; }
    public void setService(String service) { this.service = service; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public LocalDate getDateAdhesion() { return dateAdhesion; }
    public void setDateAdhesion(LocalDate dateAdhesion) { this.dateAdhesion = dateAdhesion; }

    public StatutAdherent getStatut() { return statut; }
    public void setStatut(StatutAdherent statut) { this.statut = statut; }

    public CategorieAdhesion getCategorie() { return categorie; }
    public void setCategorie(CategorieAdhesion categorie) { this.categorie = categorie; }

    public Utilisateur getUtilisateur() { return utilisateur; }
    public void setUtilisateur(Utilisateur utilisateur) { this.utilisateur = utilisateur; }

    public Integer getNombreEnfants() { return nombreEnfants; }
    public void setNombreEnfants(Integer nombreEnfants) { this.nombreEnfants = nombreEnfants; }

    public String getObservations() { return observations; }
    public void setObservations(String observations) { this.observations = observations; }

    public LocalDate getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDate dateCreation) { this.dateCreation = dateCreation; }
}