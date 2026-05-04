package com.cdc.CDCApplication.repository;

import com.cdc.CDCApplication.entity.CategorieAdhesion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategorieAdhesionRepository extends JpaRepository<CategorieAdhesion, Long> {
    Optional<CategorieAdhesion> findByLibelle(String libelle);
    boolean existsByLibelle(String libelle);
    List<CategorieAdhesion> findByActifTrue();
}