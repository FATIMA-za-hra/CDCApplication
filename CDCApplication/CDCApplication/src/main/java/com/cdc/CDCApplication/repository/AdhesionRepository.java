package com.cdc.CDCApplication.repository;

import com.cdc.CDCApplication.entity.Adhesion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AdhesionRepository extends JpaRepository<Adhesion, Long> {
    List<Adhesion> findByAdherentId(Long adherentId);
    List<Adhesion> findByAnnee(Integer annee);
    Optional<Adhesion> findByAdherentIdAndAnnee(Long adherentId, Integer annee);
    boolean existsByAdherentIdAndAnnee(Long adherentId, Integer annee);

    @Query("SELECT COUNT(a) FROM Adhesion a WHERE a.annee = :annee AND a.statut = 'PAYE'")
    long countPayesByAnnee(@Param("annee") Integer annee);

    @Query("SELECT SUM(a.montant) FROM Adhesion a WHERE a.annee = :annee AND a.statut = 'PAYE'")
    java.math.BigDecimal sumMontantByAnnee(@Param("annee") Integer annee);
}