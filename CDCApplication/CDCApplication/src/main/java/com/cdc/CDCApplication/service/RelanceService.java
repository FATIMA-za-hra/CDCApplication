package com.cdc.CDCApplication.service;

import com.cdc.CDCApplication.entity.Adherent;
import com.cdc.CDCApplication.entity.Adhesion;
import com.cdc.CDCApplication.repository.AdherentRepository;
import com.cdc.CDCApplication.repository.AdhesionRepository;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class RelanceService {

    private final AdhesionRepository adhesionRepository;
    private final AdherentRepository adherentRepository;
    private final JavaMailSender mailSender; // injecté directement, plus de getMailSender()

    @Value("${app.email.from}")
    private String emailFrom;

    @Value("${app.nom:AOS Social}")
    private String nomApp;

    public RelanceService(AdhesionRepository adhesionRepository,
                          AdherentRepository adherentRepository,
                          JavaMailSender mailSender) {
        this.adhesionRepository = adhesionRepository;
        this.adherentRepository = adherentRepository;
        this.mailSender         = mailSender;
    }

    public List<Map<String, Object>> getAdherentsNonRegularises(Integer annee) {
        int anneeRef = annee != null ? annee : LocalDate.now().getYear();
        List<Adherent> actifs = adherentRepository.findByStatut(Adherent.StatutAdherent.ACTIF);
        List<Adhesion> adhesionsAnnee = adhesionRepository.findByAnnee(anneeRef);

        Map<Long, Adhesion.StatutAdhesion> statutMap = adhesionsAnnee.stream()
            .filter(a -> a.getAdherent() != null)
            .collect(Collectors.toMap(
                a -> a.getAdherent().getId(),
                Adhesion::getStatut,
                (existing, replacement) -> existing
            ));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Adherent adherent : actifs) {
            Adhesion.StatutAdhesion statut = statutMap.get(adherent.getId());
            boolean nonRegularise = statut == null
                || statut == Adhesion.StatutAdhesion.EN_ATTENTE
                || statut == Adhesion.StatutAdhesion.ANNULE;

            if (nonRegularise) {
                Map<String, Object> item = new HashMap<>();
                item.put("id",             adherent.getId());
                item.put("numeroAdherent", adherent.getNumeroAdherent());
                item.put("nom",            adherent.getNom());
                item.put("prenom",         adherent.getPrenom());
                item.put("email",          adherent.getEmail());
                item.put("telephone",      adherent.getTelephone());
                item.put("service",        adherent.getService());
                item.put("categorie",      adherent.getCategorie() != null ? adherent.getCategorie().getLibelle() : "---");
                item.put("montantDu",      adherent.getCategorie() != null ? adherent.getCategorie().getMontant() : null);
                item.put("statut",         statut != null ? statut.name() : "NON_ENREGISTRE");
                item.put("annee",          anneeRef);
                result.add(item);
            }
        }
        return result;
    }

    @Transactional
    public void envoyerRelance(Long adherentId, Integer annee) {
        Adherent a = adherentRepository.findById(adherentId)
                .orElseThrow(() -> new RuntimeException("Adherent introuvable"));
        if (a.getEmail() == null || a.getEmail().isBlank())
            throw new RuntimeException("Cet adherent n'a pas d'email.");

        int anneeRef = annee != null ? annee : LocalDate.now().getYear();
        String montant = a.getCategorie() != null
            ? a.getCategorie().getMontant().toPlainString() + " MAD" : "a definir";

        String html =
            "<!DOCTYPE html><html><head><meta charset='UTF-8'>" +
            "<style>body{font-family:Arial,sans-serif;background:#f8f8f8;margin:0;padding:20px}" +
            ".card{max-width:580px;margin:0 auto;background:white;border-radius:6px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}" +
            ".header{background:linear-gradient(135deg,#1a73e8,#0d47a1);padding:24px 32px}" +
            ".header h1{margin:0;font-size:18px;color:white}" +
            ".header p{margin:6px 0 0;font-size:13px;color:#bbdefb}" +
            ".body{padding:28px 32px}" +
            ".info-box{background:#f8f8f8;border:1px solid #e0e0e0;border-radius:4px;padding:14px 18px;margin:18px 0}" +
            ".info-row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #efefef;font-size:13px}" +
            ".info-row:last-child{border:none}" +
            ".label{color:#666}.value{font-weight:600;color:#222}" +
            ".montant{font-size:18px;color:#1a73e8;font-weight:700}" +
            ".footer{background:#f8f9fa;border-top:1px solid #eee;padding:14px 32px;font-size:11px;color:#aaa;text-align:center}" +
            "</style></head><body>" +
            "<div class='card'>" +
            "<div class='header'><h1>" + nomApp + "</h1><p>Rappel de cotisation annuelle</p></div>" +
            "<div class='body'>" +
            "<p style='color:#333'>Bonjour <strong>" + a.getPrenom() + " " + a.getNom() + "</strong>,</p>" +
            "<p style='color:#555;font-size:14px'>Nous vous rappelons que votre cotisation pour l'annee " +
            "<strong>" + anneeRef + "</strong> n'a pas encore ete regularisee.</p>" +
            "<div class='info-box'>" +
            "<div class='info-row'><span class='label'>N Adherent</span><span class='value'>" + val(a.getNumeroAdherent()) + "</span></div>" +
            "<div class='info-row'><span class='label'>Categorie</span><span class='value'>" + (a.getCategorie() != null ? a.getCategorie().getLibelle() : "---") + "</span></div>" +
            "<div class='info-row'><span class='label'>Annee</span><span class='value'>" + anneeRef + "</span></div>" +
            "<div class='info-row'><span class='label'>Montant du</span><span class='value montant'>" + montant + "</span></div>" +
            "</div>" +
            "<p style='color:#555;font-size:13px'>Merci de bien vouloir regulariser votre situation dans les meilleurs delais.</p>" +
            "<p style='color:#555;font-size:13px'>Cordialement,<br><strong>La Direction &mdash; " + nomApp + "</strong></p>" +
            "</div>" +
            "<div class='footer'>" + nomApp + " &nbsp;|&nbsp; Message automatique</div>" +
            "</div></body></html>";

        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(emailFrom);
            helper.setTo(a.getEmail());
            helper.setSubject(nomApp + " - Rappel cotisation " + anneeRef);
            helper.setText(html, true);
            mailSender.send(msg);
        } catch (Exception e) {
            throw new RuntimeException("Erreur envoi relance: " + e.getMessage(), e);
        }
    }

    @Transactional
    public Map<String, Object> envoyerRelanceMasse(List<Long> ids, Integer annee) {
        int envoyes = 0;
        List<String> erreurs = new ArrayList<>();
        for (Long id : ids) {
            try { envoyerRelance(id, annee); envoyes++; }
            catch (Exception e) { erreurs.add("Adherent " + id + ": " + e.getMessage()); }
        }
        Map<String, Object> r = new HashMap<>();
        r.put("envoyes", envoyes); r.put("erreurs", erreurs); r.put("total", ids.size());
        return r;
    }

    private String val(String s) { return s != null ? s : "---"; }
}