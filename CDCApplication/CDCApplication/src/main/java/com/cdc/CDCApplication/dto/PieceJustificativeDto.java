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
        public void setNom(String nom) { this.nom = nom; }
        public String getTypePiece() { return typePiece; }
        public void setTypePiece(String typePiece) { this.typePiece = typePiece; }
        public String getTypeContenu() { return typeContenu; }
        public void setTypeContenu(String typeContenu) { this.typeContenu = typeContenu; }
        public Long getTailleOctets() { return tailleOctets; }
        public void setTailleOctets(Long tailleOctets) { this.tailleOctets = tailleOctets; }
        public LocalDateTime getDateAjout() { return dateAjout; }
        public void setDateAjout(LocalDateTime dateAjout) { this.dateAjout = dateAjout; }
        public String getAjoutePar() { return ajoutePar; }
        public void setAjoutePar(String ajoutePar) { this.ajoutePar = ajoutePar; }
    }
}