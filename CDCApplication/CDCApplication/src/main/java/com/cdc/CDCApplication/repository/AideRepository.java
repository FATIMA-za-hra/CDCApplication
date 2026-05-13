package com.cdc.CDCApplication.repository;

import com.cdc.CDCApplication.entity.Aide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AideRepository extends JpaRepository<Aide, Long> {
    List<Aide> findByAdherentIdOrderByDateDemandeDesc(Long adherentId);
    List<Aide> findByEtatOrderByDateDemandeDesc(Aide.EtatAide etat);
    List<Aide> findAllByOrderByDateDemandeDesc();
    Optional<Aide> findByNumeroDemande(String numeroDemande);

    @Query("SELECT MAX(a.numeroDemande) FROM Aide a WHERE a.numeroDemande LIKE 'AIDE-%'")
    String findMaxNumeroDemande();
}