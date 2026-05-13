package com.cdc.CDCApplication.repository;

import com.cdc.CDCApplication.entity.CategorieAdhesion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CategorieAdhesionRepository extends JpaRepository<CategorieAdhesion, Long> {
    List<CategorieAdhesion> findByActifTrue();
    boolean existsByLibelleIgnoreCase(String libelle);
}