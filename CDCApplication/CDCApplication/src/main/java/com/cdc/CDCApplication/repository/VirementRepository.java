package com.cdc.CDCApplication.repository;

import com.cdc.CDCApplication.entity.Virement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface VirementRepository extends JpaRepository<Virement, Long> {
    Optional<Virement> findByAideId(Long aideId);
}