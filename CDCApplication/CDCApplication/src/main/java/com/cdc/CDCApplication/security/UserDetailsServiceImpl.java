package com.cdc.CDCApplication.security;

import com.cdc.CDCApplication.entity.Privilege;
import com.cdc.CDCApplication.entity.Role;
import com.cdc.CDCApplication.entity.Utilisateur;
import com.cdc.CDCApplication.repository.UtilisateurRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UtilisateurRepository utilisateurRepository;

    public UserDetailsServiceImpl(UtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Email introuvable: " + email));

        if (!utilisateur.getActif()) {
            throw new UsernameNotFoundException("Compte inactif: " + email);
        }

        if (utilisateur.getDateExpiration() != null &&
            utilisateur.getDateExpiration().isBefore(LocalDateTime.now())) {
            throw new UsernameNotFoundException("Compte expire: " + email);
        }

        if (utilisateur.getMotDePasse() == null || utilisateur.getMotDePasse().isEmpty()) {
            throw new UsernameNotFoundException("Mot de passe non configure pour: " + email);
        }

        List<GrantedAuthority> authorities = new ArrayList<>();
        for (Role role : utilisateur.getRoles()) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getNom().toUpperCase()));
            for (Privilege privilege : role.getPrivileges()) {
                authorities.add(new SimpleGrantedAuthority(privilege.getNom().toUpperCase()));
            }
        }

        return User.builder()
                .username(email)
                .password(utilisateur.getMotDePasse())
                .authorities(authorities)
                .build();
    }
}