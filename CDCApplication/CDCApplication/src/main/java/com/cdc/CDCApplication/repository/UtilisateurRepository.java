package com.cdc.CDCApplication.repository;

import com.cdc.CDCApplication.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
    Optional<Utilisateur> findByEmail(String email);
    Optional<Utilisateur> findByTokenResetMdp(String token);
    boolean existsByEmail(String email);
}