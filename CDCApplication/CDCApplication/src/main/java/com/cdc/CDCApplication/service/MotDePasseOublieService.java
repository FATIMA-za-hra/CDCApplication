package com.cdc.CDCApplication.service;

import com.cdc.CDCApplication.entity.Utilisateur;
import com.cdc.CDCApplication.repository.UtilisateurRepository;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
public class MotDePasseOublieService {

    private final UtilisateurRepository utilisateurRepository;
    private final JavaMailSender mailSender; // injecté directement, plus de getMailSender()

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.email.from}")
    private String emailFrom;

    @Value("${app.nom:AOS Social}")
    private String nomApp;

    public MotDePasseOublieService(UtilisateurRepository utilisateurRepository,
                                    JavaMailSender mailSender) {
        this.utilisateurRepository = utilisateurRepository;
        this.mailSender            = mailSender;
    }

    public void demanderReinit(String email) {
        Utilisateur u = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Aucun compte associe a cet email."));

        if (!Boolean.TRUE.equals(u.getActif()))
            throw new RuntimeException("Ce compte est inactif.");

        String token = UUID.randomUUID().toString();
        u.setTokenResetMdp(token);
        u.setTokenExpiry(LocalDateTime.now().plusHours(2));
        utilisateurRepository.save(u);

        envoyerEmailReinit(u, token);
    }

    private void envoyerEmailReinit(Utilisateur u, String token) {
        String lien = frontendUrl + "/reinitialiser-mot-de-passe?token=" + token;

        String html =
            "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body>" +
            "<div style='font-family:Arial,sans-serif;max-width:600px;margin:40px auto;" +
            "background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.1)'>" +
            "<div style='background:linear-gradient(135deg,#1a73e8,#0d47a1);padding:30px;text-align:center'>" +
            "<h1 style='color:white;margin:0;font-size:22px'>" + nomApp + "</h1>" +
            "<p style='color:#bbdefb;margin:8px 0 0'>Réinitialisation du mot de passe</p>" +
            "</div>" +
            "<div style='padding:32px'>" +
            "<p style='color:#374151'>Bonjour <strong>" + u.getPrenom() + " " + u.getNom() + "</strong>,</p>" +
            "<p style='color:#374151'>Vous avez demandé la réinitialisation de votre mot de passe.</p>" +
            "<div style='text-align:center;margin:28px 0'>" +
            "<a href='" + lien + "' style='background:#1a73e8;color:white;padding:14px 32px;" +
            "text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block'>" +
            "Réinitialiser mon mot de passe</a></div>" +
            "<div style='background:#fef9c3;border-left:4px solid #eab308;padding:14px;" +
            "border-radius:4px;font-size:13px;color:#713f12'>" +
            "<strong>⚠ Ce lien est valable 2 heures.</strong><br>" +
            "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</div>" +
            "</div>" +
            "<div style='text-align:center;padding:16px;background:#f8f9fa;color:#999;font-size:12px'>" +
            nomApp + "</div></div></body></html>";

        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(emailFrom);
            helper.setTo(u.getEmail());
            helper.setSubject(nomApp + " - Réinitialisation de votre mot de passe");
            helper.setText(html, true);
            mailSender.send(msg);
        } catch (Exception e) {
            throw new RuntimeException("Erreur envoi email: " + e.getMessage(), e);
        }
    }
}