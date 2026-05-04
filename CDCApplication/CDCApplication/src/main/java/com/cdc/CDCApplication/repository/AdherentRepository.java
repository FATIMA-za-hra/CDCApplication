package com.cdc.CDCApplication.repository;

import com.cdc.CDCApplication.entity.Adherent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AdherentRepository extends JpaRepository<Adherent, Long> {
    Optional<Adherent> findByCin(String cin);
    Optional<Adherent> findByNumeroAdherent(String numeroAdherent);
    Optional<Adherent> findByEmail(String email);
    boolean existsByCin(String cin);
    boolean existsByEmail(String email);
    List<Adherent> findByStatut(Adherent.StatutAdherent statut);
    List<Adherent> findByCategorieId(Long categorieId);

    @Query("SELECT COUNT(a) FROM Adherent a WHERE a.statut = 'ACTIF'")
    long countActifs();

    @Query("SELECT MAX(a.numeroAdherent) FROM Adherent a WHERE a.numeroAdherent IS NOT NULL")
    String findMaxNumeroAdherent();
}