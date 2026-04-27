package com.cdc.CDCApplication.repository;

import com.cdc.CDCApplication.entity.Role;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByNom(String nom);
    boolean existsByNom(String nom);

    @EntityGraph(attributePaths = "privileges")
    List<Role> findAll();
}