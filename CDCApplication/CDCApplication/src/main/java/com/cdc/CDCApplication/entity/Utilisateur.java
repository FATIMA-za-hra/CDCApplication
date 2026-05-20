package com.cdc.CDCApplication.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "utilisateurs")
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "mot_de_passe")
    private String motDePasse;

    @Column(nullable = false)
    private Boolean actif = true;

    @Column(name = "date_expiration")
    private LocalDateTime dateExpiration;

    @Column(name = "token_reset_mdp")
    private String tokenResetMdp;

    @Column(name = "token_expiry")
    private LocalDateTime tokenExpiry;

    @Column(name = "compte_configure")
    private Boolean compteConfigure = false;

    @Lob
    @Column(name = "photo_data", columnDefinition = "LONGBLOB")
    private byte[] photoData;

    @Column(name = "photo_type_contenu", length = 50)
    private String photoTypeContenu;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "utilisateur_roles",
        joinColumns = @JoinColumn(name = "utilisateur_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    public Utilisateur() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getMotDePasse() { return motDePasse; }
    public void setMotDePasse(String m) { this.motDePasse = m; }
    public Boolean getActif() { return actif; }
    public void setActif(Boolean actif) { this.actif = actif; }
    public LocalDateTime getDateExpiration() { return dateExpiration; }
    public void setDateExpiration(LocalDateTime d) { this.dateExpiration = d; }
    public String getTokenResetMdp() { return tokenResetMdp; }
    public void setTokenResetMdp(String t) { this.tokenResetMdp = t; }
    public LocalDateTime getTokenExpiry() { return tokenExpiry; }
    public void setTokenExpiry(LocalDateTime t) { this.tokenExpiry = t; }
    public Boolean getCompteConfigure() { return compteConfigure; }
    public void setCompteConfigure(Boolean c) { this.compteConfigure = c; }
    public byte[] getPhotoData() { return photoData; }
    public void setPhotoData(byte[] p) { this.photoData = p; }
    public String getPhotoTypeContenu() { return photoTypeContenu; }
    public void setPhotoTypeContenu(String t) { this.photoTypeContenu = t; }
    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }
}