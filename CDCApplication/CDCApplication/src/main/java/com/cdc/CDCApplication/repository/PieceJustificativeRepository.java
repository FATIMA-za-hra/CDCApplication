package com.cdc.CDCApplication.repository;

import com.cdc.CDCApplication.entity.PieceJustificative;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PieceJustificativeRepository extends JpaRepository<PieceJustificative, Long> {
    List<PieceJustificative> findByAdherentIdOrderByDateAjoutDesc(Long adherentId);
}