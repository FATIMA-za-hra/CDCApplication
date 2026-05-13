package com.cdc.CDCApplication.repository;

import com.cdc.CDCApplication.entity.Enfant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EnfantRepository extends JpaRepository<Enfant, Long> {
    List<Enfant> findByAdherentId(Long adherentId);
    void deleteByAdherentId(Long adherentId);
}