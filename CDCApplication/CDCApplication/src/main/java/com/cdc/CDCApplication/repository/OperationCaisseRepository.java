package com.cdc.CDCApplication.repository;

import com.cdc.CDCApplication.entity.OperationCaisse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface OperationCaisseRepository extends JpaRepository<OperationCaisse, Long> {

    List<OperationCaisse> findByCaisseIdOrderByDateDescIdDesc(Long caisseId);

    List<OperationCaisse> findByCaisseIdAndDateBetweenOrderByDateDescIdDesc(
        Long caisseId, LocalDate debut, LocalDate fin);

    @Query("SELECT COALESCE(SUM(o.montant),0) FROM OperationCaisse o " +
           "WHERE o.caisse.id = :caisseId AND o.type = 'ENTREE'")
    BigDecimal sumEntreesByCaisse(Long caisseId);

    @Query("SELECT COALESCE(SUM(o.montant),0) FROM OperationCaisse o " +
           "WHERE o.caisse.id = :caisseId AND o.type = 'SORTIE'")
    BigDecimal sumSortiesByCaisse(Long caisseId);
    long countByCaisseId(Long caisseId);
}