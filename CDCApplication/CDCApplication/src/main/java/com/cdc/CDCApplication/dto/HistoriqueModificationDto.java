package com.cdc.CDCApplication.dto;

import java.time.LocalDateTime;

public class HistoriqueModificationDto {

    public static class Response {
        private Long id;
        private Long adherentId;
        private String action;        
        private String champModifie;
        private String ancienneValeur;
        private String nouvelleValeur;
        private String commentaire;
        private LocalDateTime dateModification;
        private String modifiePar;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getAdherentId() { return adherentId; }
        public void setAdherentId(Long a) { this.adherentId = a; }
        public String getAction() { return action; }
        public void setAction(String a) { this.action = a; }
        public String getChampModifie() { return champModifie; }
        public void setChampModifie(String c) { this.champModifie = c; }
        public String getAncienneValeur() { return ancienneValeur; }
        public void setAncienneValeur(String a) { this.ancienneValeur = a; }
        public String getNouvelleValeur() { return nouvelleValeur; }
        public void setNouvelleValeur(String n) { this.nouvelleValeur = n; }
        public String getCommentaire() { return commentaire; }
        public void setCommentaire(String c) { this.commentaire = c; }
        public LocalDateTime getDateModification() { return dateModification; }
        public void setDateModification(LocalDateTime d) { this.dateModification = d; }
        public String getModifiePar() { return modifiePar; }
        public void setModifiePar(String m) { this.modifiePar = m; }
    }
}