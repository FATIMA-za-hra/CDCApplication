package com.cdc.CDCApplication.dto;

import java.time.LocalDateTime;

public class PieceJustificativeDto {

    public static class Response {
        private Long id;
        private String nom;
        private String typePiece;
        private String typeContenu;
        private Long tailleOctets;
        private LocalDateTime dateAjout;
        private String ajoutePar;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getNom() { return nom; }
        public void setNom(String n) { this.nom = n; }
        public String getTypePiece() { return typePiece; }
        public void setTypePiece(String t) { this.typePiece = t; }
        public String getTypeContenu() { return typeContenu; }
        public void setTypeContenu(String t) { this.typeContenu = t; }
        public Long getTailleOctets() { return tailleOctets; }
        public void setTailleOctets(Long t) { this.tailleOctets = t; }
        public LocalDateTime getDateAjout() { return dateAjout; }
        public void setDateAjout(LocalDateTime d) { this.dateAjout = d; }
        public String getAjoutePar() { return ajoutePar; }
        public void setAjoutePar(String a) { this.ajoutePar = a; }
    }
}