package com.cdc.CDCApplication.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

public class UtilisateurDto {

    public static class Request {
        private String nom;
        private String prenom;
        private String email;
        private Boolean actif;
        private LocalDateTime dateExpiration;
        private Set<Long> roleIds;

        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }
        public String getPrenom() { return prenom; }
        public void setPrenom(String prenom) { this.prenom = prenom; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public Boolean getActif() { return actif; }
        public void setActif(Boolean actif) { this.actif = actif; }
        public LocalDateTime getDateExpiration() { return dateExpiration; }
        public void setDateExpiration(LocalDateTime dateExpiration) { this.dateExpiration = dateExpiration; }
        public Set<Long> getRoleIds() { return roleIds; }
        public void setRoleIds(Set<Long> roleIds) { this.roleIds = roleIds; }
    }

    public static class Response {
        private Long id;
        private String nom;
        private String prenom;
        private String email;
        private Boolean actif;
        private LocalDateTime dateExpiration;
        private Boolean compteConfigure;
        private List<RoleDto.Response> roles;

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
        public LocalDateTime getDateExpiration() { return dateExpiration; }
        public void setDateExpiration(LocalDateTime dateExpiration) { this.dateExpiration = dateExpiration; }
        public Boolean getCompteConfigure() { return compteConfigure; }
        public void setCompteConfigure(Boolean compteConfigure) { this.compteConfigure = compteConfigure; }
        public List<RoleDto.Response> getRoles() { return roles; }
        public void setRoles(List<RoleDto.Response> roles) { this.roles = roles; }
    }

    public static class PasswordSetRequest {
        private String token;
        private String motDePasse;
        private String confirmerMotDePasse;

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getMotDePasse() { return motDePasse; }
        public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }
        public String getConfirmerMotDePasse() { return confirmerMotDePasse; }
        public void setConfirmerMotDePasse(String confirmerMotDePasse) { this.confirmerMotDePasse = confirmerMotDePasse; }
    }
}