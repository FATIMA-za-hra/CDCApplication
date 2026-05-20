package com.cdc.CDCApplication.repository;

import com.cdc.CDCApplication.entity.CompteBancaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CompteBancaireRepository extends JpaRepository<CompteBancaire, Long> {
    List<CompteBancaire> findByStatut(CompteBancaire.StatutCompte statut);
    boolean existsByNumeroCompte(String numeroCompte);
    boolean existsByIban(String iban);
}