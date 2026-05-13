package com.cdc.CDCApplication.dto;

import java.time.LocalDateTime;

public class ProfilDto {

    public static class Response {
        private Long id;
        private String nom;
        private String prenom;
        private String email;
        private Boolean actif;
        private Boolean compteConfigure;
        private LocalDateTime dateExpiration;
        private String photoUrl;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }
        public String getPrenom() { return prenom; }
        public void setPrenom(String prenom) { this.prenom = prenom; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public Boolean getActif() { return actif; }
        public void setActif(Boolean actif) { this.actif = actif; }
        public Boolean getCompteConfigure() { return compteConfigure; }
        public void setCompteConfigure(Boolean c) { this.compteConfigure = c; }
        public LocalDateTime getDateExpiration() { return dateExpiration; }
        public void setDateExpiration(LocalDateTime d) { this.dateExpiration = d; }
        public String getPhotoUrl() { return photoUrl; }
        public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    }

    public static class ChangerEmailRequest {
        private String nouvelEmail;
        public String getNouvelEmail() { return nouvelEmail; }
        public void setNouvelEmail(String nouvelEmail) { this.nouvelEmail = nouvelEmail; }
    }

    public static class ChangerMdpRequest {
        private String ancienMotDePasse;
        private String nouveauMotDePasse;
        private String confirmerMotDePasse;

        public String getAncienMotDePasse() { return ancienMotDePasse; }
        public void setAncienMotDePasse(String a) { this.ancienMotDePasse = a; }
        public String getNouveauMotDePasse() { return nouveauMotDePasse; }
        public void setNouveauMotDePasse(String n) { this.nouveauMotDePasse = n; }
        public String getConfirmerMotDePasse() { return confirmerMotDePasse; }
        public void setConfirmerMotDePasse(String c) { this.confirmerMotDePasse = c; }
    }
}