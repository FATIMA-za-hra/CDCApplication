package com.cdc.CDCApplication.repository;

import com.cdc.CDCApplication.entity.Privilege;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrivilegeRepository extends JpaRepository<Privilege, Long> {
    boolean existsByNom(String nom);
}