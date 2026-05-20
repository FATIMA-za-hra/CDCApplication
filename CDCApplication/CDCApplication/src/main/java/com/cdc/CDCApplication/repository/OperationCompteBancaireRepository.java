package com.cdc.CDCApplication.repository;

import com.cdc.CDCApplication.entity.OperationCompteBancaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OperationCompteBancaireRepository extends JpaRepository<OperationCompteBancaire, Long> {
    List<OperationCompteBancaire> findByCompteIdOrderByDateOperationDescIdDesc(Long compteId);

    @Query("SELECT COALESCE(SUM(o.montant),0) FROM OperationCompteBancaire o WHERE o.compte.id = :compteId AND o.typeOperation = 'CREDIT'")
    BigDecimal sumCreditsByCompte(Long compteId);

    @Query("SELECT COALESCE(SUM(o.montant),0) FROM OperationCompteBancaire o WHERE o.compte.id = :compteId AND o.typeOperation = 'DEBIT'")
    BigDecimal sumDebitsByCompte(Long compteId);
}