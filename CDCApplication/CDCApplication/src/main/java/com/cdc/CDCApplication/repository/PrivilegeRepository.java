package com.cdc.CDCApplication.repository;

import com.cdc.CDCApplication.entity.Privilege;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PrivilegeRepository extends JpaRepository<Privilege, Long> {
    Optional<Privilege> findByNom(String nom);
    boolean existsByNom(String nom);
}