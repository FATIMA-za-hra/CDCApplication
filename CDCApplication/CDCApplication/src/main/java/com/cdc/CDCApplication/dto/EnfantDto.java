package com.cdc.CDCApplication.dto;

import java.time.LocalDate;

public class EnfantDto {

    public static class Request {
        private String nom;
        private String prenom;
        private LocalDate dateNaissance;
        private String sexe;

        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }
        public String getPrenom() { return prenom; }
        public void setPrenom(String prenom) { this.prenom = prenom; }
        public LocalDate getDateNaissance() { return dateNaissance; }
        public void setDateNaissance(LocalDate d) { this.dateNaissance = d; }
        public String getSexe() { return sexe; }
        public void setSexe(String sexe) { this.sexe = sexe; }
    }

    public static class Response {
        private Long id;
        private String nom;
        private String prenom;
        private LocalDate dateNaissance;
        private String sexe;
        private int age;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }
        public String getPrenom() { return prenom; }
        public void setPrenom(String prenom) { this.prenom = prenom; }
        public LocalDate getDateNaissance() { return dateNaissance; }
        public void setDateNaissance(LocalDate d) { this.dateNaissance = d; }
        public String getSexe() { return sexe; }
        public void setSexe(String sexe) { this.sexe = sexe; }
        public int getAge() { return age; }
        public void setAge(int age) { this.age = age; }
    }
}