package com.cdc.CDCApplication.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class AdherentDto {

    public static class Request {
        private String nom;
        private String prenom;
        private String cin;
        private String matricule;
        private LocalDate dateNaissance;
        private String situationFamiliale;
        private String service;
        private String telephone;
        private String adresse;
        private String email;
        private LocalDate dateAdhesion;
        private String statut;
        private Long categorieId;
        private Integer nombreEnfants;
        private String observations;

        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }
        public String getPrenom() { return prenom; }
        public void setPrenom(String prenom) { this.prenom = prenom; }
        public String getCin() { return cin; }
        public void setCin(String cin) { this.cin = cin; }
        public String getMatricule() { return matricule; }
        public void setMatricule(String matricule) { this.matricule = matricule; }
        public LocalDate getDateNaissance() { return dateNaissance; }
        public void setDateNaissance(LocalDate d) { this.dateNaissance = d; }
        public String getSituationFamiliale() { return situationFamiliale; }
        public void setSituationFamiliale(String s) { this.situationFamiliale = s; }
        public String getService() { return service; }
        public void setService(String service) { this.service = service; }
        public String getTelephone() { return telephone; }
        public void setTelephone(String telephone) { this.telephone = telephone; }
        public String getAdresse() { return adresse; }
        public void setAdresse(String adresse) { this.adresse = adresse; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public LocalDate getDateAdhesion() { return dateAdhesion; }
        public void setDateAdhesion(LocalDate d) { this.dateAdhesion = d; }
        public String getStatut() { return statut; }
        public void setStatut(String statut) { this.statut = statut; }
        public Long getCategorieId() { return categorieId; }
        public void setCategorieId(Long categorieId) { this.categorieId = categorieId; }
        public Integer getNombreEnfants() { return nombreEnfants; }
        public void setNombreEnfants(Integer n) { this.nombreEnfants = n; }
        public String getObservations() { return observations; }
        public void setObservations(String observations) { this.observations = observations; }
    }

    public static class Response {
        private Long id;
        private String numeroAdherent;
        private String nom;
        private String prenom;
        private String cin;
        private String matricule;
        private LocalDate dateNaissance;
        private String situationFamiliale;
        private String service;
        private String telephone;
        private String adresse;
        private String email;
        private LocalDate dateAdhesion;
        private String statut;
        private CategorieAdhesionDto.Response categorie;
        private Integer nombreEnfants;
        private String observations;
        private LocalDate dateCreation;
        private Long utilisateurId;
        private boolean compteUtilisateurCree;
        private String photoChemin;  // URL /api/adherents/{id}/photo

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getNumeroAdherent() { return numeroAdherent; }
        public void setNumeroAdherent(String n) { this.numeroAdherent = n; }
        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }
        public String getPrenom() { return prenom; }
        public void setPrenom(String prenom) { this.prenom = prenom; }
        public String getCin() { return cin; }
        public void setCin(String cin) { this.cin = cin; }
        public String getMatricule() { return matricule; }
        public void setMatricule(String matricule) { this.matricule = matricule; }
        public LocalDate getDateNaissance() { return dateNaissance; }
        public void setDateNaissance(LocalDate d) { this.dateNaissance = d; }
        public String getSituationFamiliale() { return situationFamiliale; }
        public void setSituationFamiliale(String s) { this.situationFamiliale = s; }
        public String getService() { return service; }
        public void setService(String service) { this.service = service; }
        public String getTelephone() { return telephone; }
        public void setTelephone(String telephone) { this.telephone = telephone; }
        public String getAdresse() { return adresse; }
        public void setAdresse(String adresse) { this.adresse = adresse; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public LocalDate getDateAdhesion() { return dateAdhesion; }
        public void setDateAdhesion(LocalDate d) { this.dateAdhesion = d; }
        public String getStatut() { return statut; }
        public void setStatut(String statut) { this.statut = statut; }
        public CategorieAdhesionDto.Response getCategorie() { return categorie; }
        public void setCategorie(CategorieAdhesionDto.Response c) { this.categorie = c; }
        public Integer getNombreEnfants() { return nombreEnfants; }
        public void setNombreEnfants(Integer n) { this.nombreEnfants = n; }
        public String getObservations() { return observations; }
        public void setObservations(String observations) { this.observations = observations; }
        public LocalDate getDateCreation() { return dateCreation; }
        public void setDateCreation(LocalDate d) { this.dateCreation = d; }
        public Long getUtilisateurId() { return utilisateurId; }
        public void setUtilisateurId(Long utilisateurId) { this.utilisateurId = utilisateurId; }
        public boolean isCompteUtilisateurCree() { return compteUtilisateurCree; }
        public void setCompteUtilisateurCree(boolean b) { this.compteUtilisateurCree = b; }
        public String getPhotoChemin() { return photoChemin; }
        public void setPhotoChemin(String photoChemin) { this.photoChemin = photoChemin; }
    }
}