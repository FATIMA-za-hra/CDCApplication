package com.cdc.CDCApplication.dto;

import java.util.List;
import java.util.Set;

public class RoleDto {

    public static class Request {
        private String nom;
        private String description;
        private Set<Long> privilegeIds;

        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Set<Long> getPrivilegeIds() { return privilegeIds; }
        public void setPrivilegeIds(Set<Long> privilegeIds) { this.privilegeIds = privilegeIds; }
    }

    public static class Response {
        private Long id;
        private String nom;
        private String description;
        private List<PrivilegeDto.Response> privileges;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public List<PrivilegeDto.Response> getPrivileges() { return privileges; }
        public void setPrivileges(List<PrivilegeDto.Response> privileges) { this.privileges = privileges; }
    }
}