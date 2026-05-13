package com.cdc.CDCApplication.repository;

import com.cdc.CDCApplication.entity.WorkflowValidation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowValidationRepository extends JpaRepository<WorkflowValidation, Long> {
    List<WorkflowValidation> findByAideIdOrderByOrdre(Long aideId);
    Optional<WorkflowValidation> findByAideIdAndEtape(Long aideId, WorkflowValidation.Etape etape);
}