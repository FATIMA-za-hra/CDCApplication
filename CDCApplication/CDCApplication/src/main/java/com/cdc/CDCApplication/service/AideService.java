package com.cdc.CDCApplication.service;

import com.cdc.CDCApplication.dto.AideDto;
import com.cdc.CDCApplication.entity.*;
import com.cdc.CDCApplication.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class AideService {

    private final AideRepository aideRepository;
    private final AdherentRepository adherentRepository;
    private final TypeAideRepository typeAideRepository;
    private final WorkflowValidationRepository workflowRepository;
    private final VirementRepository virementRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Value("${app.aides.dir:./uploads/aides}")
    private String aidesDir;

    public AideService(AideRepository aideRepository,
                        AdherentRepository adherentRepository,
                        TypeAideRepository typeAideRepository,
                        WorkflowValidationRepository workflowRepository,
                        VirementRepository virementRepository,
                        UtilisateurRepository utilisateurRepository) {
        this.aideRepository       = aideRepository;
        this.adherentRepository   = adherentRepository;
        this.typeAideRepository   = typeAideRepository;
        this.workflowRepository   = workflowRepository;
        this.virementRepository   = virementRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    // ═══════════════════════════════
    // LECTURE
    // ═══════════════════════════════

    @Transactional(readOnly = true)
    public List<AideDto.Response> findAll() {
        List<AideDto.Response> list = new ArrayList<>();
        for (Aide a : aideRepository.findAllByOrderByDateDemandeDesc()) list.add(toResponse(a));
        return list;
    }

    @Transactional(readOnly = true)
    public List<AideDto.Response> findByAdherent(Long adherentId) {
        List<AideDto.Response> list = new ArrayList<>();
        for (Aide a : aideRepository.findByAdherentIdOrderByDateDemandeDesc(adherentId)) list.add(toResponse(a));
        return list;
    }

    /**
     * Retourne les demandes du compte connecté (adhérent qui consulte ses propres demandes)
     */
    @Transactional(readOnly = true)
    public List<AideDto.Response> findMesDemandes() {
        String email = getCurrentUser();
        // Trouver l'adhérent lié à cet utilisateur
        Utilisateur u = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        Adherent adherent = adherentRepository.findByUtilisateurId(u.getId())
                .orElseThrow(() -> new RuntimeException("Aucun profil adherent lie a ce compte."));
        List<AideDto.Response> list = new ArrayList<>();
        for (Aide a : aideRepository.findByAdherentIdOrderByDateDemandeDesc(adherent.getId()))
            list.add(toResponse(a));
        return list;
    }

    @Transactional(readOnly = true)
    public AideDto.Response findById(Long id) {
        return toResponse(aideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Aide introuvable")));
    }

    // ═══════════════════════════════
    // DÉPOSER — deux modes :
    //   1. Admin/Agent : fournit adherentId dans le body
    //   2. Adhérent connecté : adherentId = null → déduit depuis le compte
    // ═══════════════════════════════

    public AideDto.Response deposer(AideDto.Request dto) {
        Adherent adherent;

        if (dto.getAdherentId() != null) {
            // Mode admin / agent de gestion
            adherent = adherentRepository.findById(dto.getAdherentId())
                    .orElseThrow(() -> new RuntimeException("Adherent introuvable"));
        } else {
            // Mode adhérent connecté → retrouver via le compte utilisateur
            String email = getCurrentUser();
            Utilisateur u = utilisateurRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Compte utilisateur introuvable"));
            adherent = adherentRepository.findByUtilisateurId(u.getId())
                    .orElseThrow(() -> new RuntimeException(
                        "Aucun profil adherent lie a votre compte. Contactez l'administration."));

            if (adherent.getStatut() != Adherent.StatutAdherent.ACTIF)
                throw new RuntimeException("Votre compte adherent n'est pas actif.");
        }

        TypeAide typeAide = typeAideRepository.findById(dto.getTypeAideId())
                .orElseThrow(() -> new RuntimeException("Type d'aide introuvable"));

        if (!typeAide.getActif())
            throw new RuntimeException("Ce type d'aide n'est plus actif.");

        if (typeAide.getMontantMax() != null
                && dto.getMontantDemande().compareTo(typeAide.getMontantMax()) > 0)
            throw new RuntimeException("Le montant depasse le plafond autorise de "
                + typeAide.getMontantMax() + " MAD.");

        Aide aide = new Aide();
        aide.setNumeroDemande(genererNumeroDemande());
        aide.setAdherent(adherent);
        aide.setTypeAide(typeAide);
        aide.setMontantDemande(dto.getMontantDemande());
        aide.setMotif(dto.getMotif());
        aide.setEtat(Aide.EtatAide.DEPOSEE);
        aide.setDateDemande(LocalDate.now());
        aide.setSaisiPar(getCurrentUser());

        // Créer le dossier pour les pièces jointes
        String num = aide.getNumeroDemande();
        aide.setPiecesJointesDir(Paths.get(aidesDir, num).toAbsolutePath().toString());

        Aide saved = aideRepository.save(aide);
        creerWorkflow(saved);
        return toResponse(saved);
    }

    // ═══════════════════════════════
    // ANNULER
    // Un adhérent peut annuler sa propre demande si elle est encore DEPOSEE
    // ═══════════════════════════════

    public AideDto.Response annuler(Long id) {
        Aide aide = aideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Aide introuvable"));

        // Vérifier si c'est bien la demande de l'adhérent connecté ou un admin
        verifierDroitAcces(aide);

        if (aide.getEtat() != Aide.EtatAide.DEPOSEE)
            throw new RuntimeException("Seule une demande DEPOSEE peut etre annulee.");
        aide.setEtat(Aide.EtatAide.ANNULEE);
        return toResponse(aideRepository.save(aide));
    }

    // ═══════════════════════════════
    // DÉCISION AGENT DE BUREAU (étape 1)
    // ═══════════════════════════════

    public AideDto.Response decisionAgentBureau(Long aideId, AideDto.DecisionRequest req) {
        Aide aide = getAideActive(aideId);

        if (aide.getEtat() != Aide.EtatAide.DEPOSEE)
            throw new RuntimeException("La demande doit etre DEPOSEE. Etat actuel: " + aide.getEtat());

        WorkflowValidation wf = workflowRepository
                .findByAideIdAndEtape(aideId, WorkflowValidation.Etape.AGENT_BUREAU)
                .orElseThrow(() -> new RuntimeException("Etape Agent de bureau introuvable"));

        WorkflowValidation.Decision decision =
                WorkflowValidation.Decision.valueOf(req.getDecision().toUpperCase());
        wf.setDecision(decision);
        wf.setDateDecision(LocalDateTime.now());
        wf.setCommentaire(req.getCommentaire());
        wf.setValidePar(getCurrentUser());

        if (decision == WorkflowValidation.Decision.APPROUVE) {
            java.math.BigDecimal montant = req.getMontantAccorde() != null
                ? req.getMontantAccorde() : aide.getMontantDemande();
            wf.setMontantPropose(montant);
            aide.setMontantAccorde(montant);
            aide.setEtat(Aide.EtatAide.EN_ETUDE);
        } else {
            aide.setEtat(Aide.EtatAide.REJETEE);
            aide.setDateTraitement(LocalDate.now());
        }

        workflowRepository.save(wf);
        return toResponse(aideRepository.save(aide));
    }

    // ═══════════════════════════════
    // DÉCISION PRÉSIDENT (étape 2)
    // ═══════════════════════════════

    public AideDto.Response decisionPresident(Long aideId, AideDto.DecisionRequest req) {
        Aide aide = getAideActive(aideId);

        if (aide.getEtat() != Aide.EtatAide.EN_ETUDE)
            throw new RuntimeException("La demande doit etre EN_ETUDE. Etat actuel: " + aide.getEtat());

        WorkflowValidation wfBureau = workflowRepository
                .findByAideIdAndEtape(aideId, WorkflowValidation.Etape.AGENT_BUREAU)
                .orElseThrow(() -> new RuntimeException("Etape Agent de bureau introuvable"));
        if (wfBureau.getDecision() != WorkflowValidation.Decision.APPROUVE)
            throw new RuntimeException("L'agent de bureau doit approuver en premier.");

        WorkflowValidation wfPres = workflowRepository
                .findByAideIdAndEtape(aideId, WorkflowValidation.Etape.PRESIDENT)
                .orElseThrow(() -> new RuntimeException("Etape President introuvable"));

        WorkflowValidation.Decision decision =
                WorkflowValidation.Decision.valueOf(req.getDecision().toUpperCase());
        wfPres.setDecision(decision);
        wfPres.setDateDecision(LocalDateTime.now());
        wfPres.setCommentaire(req.getCommentaire());
        wfPres.setValidePar(getCurrentUser());

        if (decision == WorkflowValidation.Decision.APPROUVE) {
            if (req.getMontantAccorde() != null) aide.setMontantAccorde(req.getMontantAccorde());
            aide.setEtat(Aide.EtatAide.VALIDEE);
        } else {
            aide.setEtat(Aide.EtatAide.REJETEE);
        }
        aide.setDateTraitement(LocalDate.now());

        workflowRepository.save(wfPres);
        return toResponse(aideRepository.save(aide));
    }

    // ═══════════════════════════════
    // VIREMENT
    // ═══════════════════════════════

    public AideDto.Response enregistrerVirement(Long aideId, AideDto.VirementRequest req) {
        Aide aide = aideRepository.findById(aideId)
                .orElseThrow(() -> new RuntimeException("Aide introuvable"));
        if (aide.getEtat() != Aide.EtatAide.VALIDEE)
            throw new RuntimeException("La demande doit etre VALIDEE pour enregistrer un virement.");

        Virement v = virementRepository.findByAideId(aideId).orElse(new Virement());
        v.setAide(aide);
        v.setBeneficiaire(req.getBeneficiaire());
        v.setMontant(req.getMontant() != null ? req.getMontant() : aide.getMontantAccorde());
        v.setMotif(req.getMotif());
        v.setReferenceVirement(req.getReferenceVirement());
        v.setDateVirement(req.getDateVirement());
        v.setRibBeneficiaire(req.getRibBeneficiaire());
        virementRepository.save(v);
        return toResponse(aide);
    }

    // ═══════════════════════════════
    // PIÈCES JOINTES
    // ═══════════════════════════════

    public Map<String, String> uploadPiece(Long aideId, MultipartFile file) throws IOException {
        Aide aide = aideRepository.findById(aideId)
                .orElseThrow(() -> new RuntimeException("Aide introuvable"));
        Path dir = Paths.get(aide.getPiecesJointesDir() != null
            ? aide.getPiecesJointesDir() : aidesDir + "/" + aide.getNumeroDemande());
        Files.createDirectories(dir);
        String nom = UUID.randomUUID().toString().substring(0, 8) + "-"
            + (file.getOriginalFilename() != null ? file.getOriginalFilename() : "piece");
        Files.copy(file.getInputStream(), dir.resolve(nom), StandardCopyOption.REPLACE_EXISTING);
        if (aide.getPiecesJointesDir() == null) {
            aide.setPiecesJointesDir(dir.toAbsolutePath().toString());
            aideRepository.save(aide);
        }
        Map<String, String> r = new HashMap<>();
        r.put("nom", nom); r.put("taille", String.valueOf(file.getSize()));
        return r;
    }

    public List<Map<String, String>> listPieces(Long aideId) throws IOException {
        Aide aide = aideRepository.findById(aideId)
                .orElseThrow(() -> new RuntimeException("Aide introuvable"));
        List<Map<String, String>> list = new ArrayList<>();
        if (aide.getPiecesJointesDir() == null) return list;
        Path dir = Paths.get(aide.getPiecesJointesDir());
        if (!Files.exists(dir)) return list;
        Files.list(dir).forEach(p -> {
            Map<String, String> f = new HashMap<>();
            f.put("nom", p.getFileName().toString());
            f.put("taille", String.valueOf(p.toFile().length()));
            list.add(f);
        });
        return list;
    }

    public byte[] telechargerPiece(Long aideId, String nomFichier) throws IOException {
        Aide aide = aideRepository.findById(aideId)
                .orElseThrow(() -> new RuntimeException("Aide introuvable"));
        Path chemin = Paths.get(aide.getPiecesJointesDir(), nomFichier);
        if (!Files.exists(chemin)) throw new RuntimeException("Fichier introuvable");
        return Files.readAllBytes(chemin);
    }

    public void supprimerPiece(Long aideId, String nomFichier) throws IOException {
        Aide aide = aideRepository.findById(aideId)
                .orElseThrow(() -> new RuntimeException("Aide introuvable"));
        Files.deleteIfExists(Paths.get(aide.getPiecesJointesDir(), nomFichier));
    }

    // ═══════════════════════════════
    // HELPERS
    // ═══════════════════════════════

    /**
     * Vérifie que l'utilisateur connecté a le droit d'accéder à cette aide.
     * Admin/agent → accès libre. Adhérent → uniquement ses propres demandes.
     */
    private void verifierDroitAcces(Aide aide) {
        String email = getCurrentUser();
        try {
            Utilisateur u = utilisateurRepository.findByEmail(email).orElse(null);
            if (u == null) return; // pas trouvé → laisser passer (admin)
            Adherent adherent = adherentRepository.findByUtilisateurId(u.getId()).orElse(null);
            if (adherent == null) return; // c'est un admin/agent, pas un adhérent
            // C'est un adhérent → vérifier que la demande lui appartient
            if (!aide.getAdherent().getId().equals(adherent.getId()))
                throw new RuntimeException("Vous n'avez pas le droit d'acceder a cette demande.");
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception ignored) {}
    }

    private Aide getAideActive(Long id) {
        Aide aide = aideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Aide introuvable"));
        if (aide.getEtat() == Aide.EtatAide.ANNULEE)
            throw new RuntimeException("Cette demande est annulee.");
        return aide;
    }

    private void creerWorkflow(Aide aide) {
        WorkflowValidation wf1 = new WorkflowValidation();
        wf1.setAide(aide); wf1.setEtape(WorkflowValidation.Etape.AGENT_BUREAU);
        wf1.setDecision(WorkflowValidation.Decision.EN_ATTENTE); wf1.setOrdre(1);
        workflowRepository.save(wf1);

        WorkflowValidation wf2 = new WorkflowValidation();
        wf2.setAide(aide); wf2.setEtape(WorkflowValidation.Etape.PRESIDENT);
        wf2.setDecision(WorkflowValidation.Decision.EN_ATTENTE); wf2.setOrdre(2);
        workflowRepository.save(wf2);
    }

    private String getCurrentUser() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && !auth.getName().equals("anonymousUser")) return auth.getName();
        } catch (Exception ignored) {}
        return "systeme";
    }

    private String genererNumeroDemande() {
        String max = aideRepository.findMaxNumeroDemande();
        if (max == null) return "AIDE-00001";
        try {
            int num = Integer.parseInt(max.replace("AIDE-", "")) + 1;
            return String.format("AIDE-%05d", num);
        } catch (Exception e) {
            return String.format("AIDE-%05d", aideRepository.count() + 1);
        }
    }

    public AideDto.Response toResponse(Aide a) {
        AideDto.Response r = new AideDto.Response();
        r.setId(a.getId()); r.setNumeroDemande(a.getNumeroDemande());
        r.setMontantDemande(a.getMontantDemande()); r.setMontantAccorde(a.getMontantAccorde());
        r.setMotif(a.getMotif()); r.setEtat(a.getEtat() != null ? a.getEtat().name() : null);
        r.setDateDemande(a.getDateDemande()); r.setDateTraitement(a.getDateTraitement());
        r.setSaisiPar(a.getSaisiPar());

        if (a.getAdherent() != null) {
            AideDto.AdherentInfo ai = new AideDto.AdherentInfo();
            ai.setId(a.getAdherent().getId());
            ai.setNom(a.getAdherent().getNom());
            ai.setPrenom(a.getAdherent().getPrenom());
            ai.setNumeroAdherent(a.getAdherent().getNumeroAdherent());
            ai.setCin(a.getAdherent().getCin());
            r.setAdherent(ai);
        }
        if (a.getTypeAide() != null) {
            AideDto.TypeAideInfo ti = new AideDto.TypeAideInfo();
            ti.setId(a.getTypeAide().getId());
            ti.setNom(a.getTypeAide().getNom());
            ti.setMontantMax(a.getTypeAide().getMontantMax());
            r.setTypeAide(ti);
        }

        List<AideDto.WorkflowInfo> wfs = new ArrayList<>();
        for (WorkflowValidation wf : workflowRepository.findByAideIdOrderByOrdre(a.getId())) {
            AideDto.WorkflowInfo wi = new AideDto.WorkflowInfo();
            wi.setId(wf.getId()); wi.setEtape(wf.getEtape().name());
            wi.setDecision(wf.getDecision().name()); wi.setDateDecision(wf.getDateDecision());
            wi.setCommentaire(wf.getCommentaire()); wi.setValidePar(wf.getValidePar());
            wi.setOrdre(wf.getOrdre()); wi.setMontantPropose(wf.getMontantPropose());
            wfs.add(wi);
        }
        r.setWorkflows(wfs);

        virementRepository.findByAideId(a.getId()).ifPresent(v -> {
            AideDto.VirementInfo vi = new AideDto.VirementInfo();
            vi.setId(v.getId()); vi.setBeneficiaire(v.getBeneficiaire());
            vi.setMontant(v.getMontant()); vi.setMotif(v.getMotif());
            vi.setReferenceVirement(v.getReferenceVirement());
            vi.setDateVirement(v.getDateVirement()); vi.setRibBeneficiaire(v.getRibBeneficiaire());
            r.setVirement(vi);
        });
        return r;
    }
}