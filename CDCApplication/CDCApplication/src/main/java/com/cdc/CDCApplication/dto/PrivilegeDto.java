package com.cdc.CDCApplication.dto;

import java.util.List;

public class PrivilegeDto {

    public static class Request {
        private String modele;
        private List<String> actions;

        public String getModele() { return modele; }
        public void setModele(String modele) { this.modele = modele; }
        public List<String> getActions() { return actions; }
        public void setActions(List<String> actions) { this.actions = actions; }
    }

    public static class Single {
        private String nom;
        private String description;

        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class Response {
        private Long id;
        private String nom;
        private String description;
        private String modele;
        private String action;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getModele() { return modele; }
        public void setModele(String modele) { this.modele = modele; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
    }
}