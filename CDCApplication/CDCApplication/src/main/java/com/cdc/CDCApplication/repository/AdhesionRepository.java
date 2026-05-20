package com.cdc.CDCApplication.repository;

import com.cdc.CDCApplication.entity.Adhesion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface AdhesionRepository extends JpaRepository<Adhesion, Long> {
    List<Adhesion> findByAdherentId(Long adherentId);
    List<Adhesion> findByAnnee(Integer annee);
    boolean existsByAdherentIdAndAnnee(Long adherentId, Integer annee);

    @Query("SELECT COUNT(a) FROM Adhesion a WHERE a.annee = :annee AND a.statut = 'PAYE'")
    long countPayesByAnnee(Integer annee);

    @Query("SELECT COALESCE(SUM(a.montant),0) FROM Adhesion a WHERE a.annee = :annee AND a.statut = 'PAYE'")
    BigDecimal sumMontantByAnnee(Integer annee);
}