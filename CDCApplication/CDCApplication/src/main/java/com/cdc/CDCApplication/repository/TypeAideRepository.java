package com.cdc.CDCApplication.repository;

import com.cdc.CDCApplication.entity.TypeAide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TypeAideRepository extends JpaRepository<TypeAide, Long> {
    List<TypeAide> findByActifTrue();
    boolean existsByNomIgnoreCase(String nom);
}