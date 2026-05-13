package com.cdc.CDCApplication.repository;

import com.cdc.CDCApplication.entity.Adherent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AdherentRepository extends JpaRepository<Adherent, Long> {

    boolean existsByCin(String cin);
    boolean existsByEmail(String email);

    List<Adherent> findByStatut(Adherent.StatutAdherent statut);

    Optional<Adherent> findByEmail(String email);

    // Retrouver l'adhérent lié à un compte utilisateur (pour le self-service)
    Optional<Adherent> findByUtilisateurId(Long utilisateurId);

    @Query("SELECT MAX(a.numeroAdherent) FROM Adherent a WHERE a.numeroAdherent LIKE 'ADH-%'")
    String findMaxNumeroAdherent();
}