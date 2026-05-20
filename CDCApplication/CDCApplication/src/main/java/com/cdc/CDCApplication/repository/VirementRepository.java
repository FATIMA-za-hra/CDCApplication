package com.cdc.CDCApplication.repository;

import com.cdc.CDCApplication.entity.Virement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VirementRepository extends JpaRepository<Virement, Long> {
    Optional<Virement> findByAideId(Long aideId);
    List<Virement> findAllByOrderByDateVirementDesc();
    List<Virement> findByStatutOrderByDateVirementDesc(Virement.StatutVirement statut);
    List<Virement> findByCaisseIdOrderByDateVirementDesc(Long caisseId);
}