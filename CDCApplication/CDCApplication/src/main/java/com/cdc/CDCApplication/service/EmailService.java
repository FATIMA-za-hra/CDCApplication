package com.cdc.CDCApplication.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.email.from}")
    private String emailFrom;

    @Value("${app.nom:AOS Social}")
    private String nomApp;

    @Value("${app.frontend.url}")
    private String frontendUrlBase;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // ── EMAIL CRÉATION DE COMPTE ──
    public void envoyerEmailCreationCompte(String destinataire, String nom, String prenom, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(emailFrom);
            helper.setTo(destinataire);
            helper.setSubject(nomApp + " - Création de votre compte");

            String lien = frontendUrl + "/configurer-mot-de-passe?token=" + token;
            String html = baseTemplate(
                "Création de votre compte",
                "<p style='color:#555;line-height:1.6'>Bonjour <strong>" + prenom + " " + nom + "</strong>,</p>" +
                "<p style='color:#555;line-height:1.6'>Un compte a été créé pour vous sur <strong>" + nomApp + "</strong>. " +
                "Cliquez sur le bouton ci-dessous pour définir votre mot de passe :</p>" +
                "<div style='text-align:center;margin:30px 0'>" +
                "<a href='" + lien + "' style='background:#1a73e8;color:white;padding:14px 32px;" +
                "text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block'>" +
                "Configurer mon mot de passe</a></div>" +
                "<div style='background:#e3f2fd;border-left:4px solid #1a73e8;padding:15px;border-radius:4px'>" +
                "<strong>Important :</strong> Ce lien est valable 72 heures.</div>"
            );

            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Erreur envoi email création compte : " + e.getMessage(), e);
        }
    }

    // ── EMAIL RÉINITIALISATION MOT DE PASSE ──
    public void envoyerEmailReinitialisationMdp(String destinataire, String nom, String prenom, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(emailFrom);
            helper.setTo(destinataire);
            helper.setSubject(nomApp + " - Réinitialisation de votre mot de passe");

            String lien = frontendUrl + "/reinitialiser-mot-de-passe?token=" + token;
            String html = baseTemplate(
                "Réinitialisation du mot de passe",
                "<p style='color:#555;line-height:1.6'>Bonjour <strong>" + prenom + " " + nom + "</strong>,</p>" +
                "<p style='color:#555;line-height:1.6'>Vous avez demandé la réinitialisation de votre mot de passe. " +
                "Cliquez sur le bouton ci-dessous :</p>" +
                "<div style='text-align:center;margin:30px 0'>" +
                "<a href='" + lien + "' style='background:#ea580c;color:white;padding:14px 32px;" +
                "text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block'>" +
                "Réinitialiser mon mot de passe</a></div>" +
                "<div style='background:#fff7ed;border-left:4px solid #ea580c;padding:15px;border-radius:4px'>" +
                "Si vous n'avez pas fait cette demande, ignorez cet email. Lien valable 1 heure.</div>"
            );

            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Erreur envoi email réinitialisation : " + e.getMessage(), e);
        }
    }

    // ── EMAIL DEMANDE D'AIDE VALIDÉE ──
    // Appelé dans AideService.decisionPresident() quand état → VALIDEE
    public void envoyerEmailAideValidee(String destinataire, String nom, String prenom,
                                         String numeroDemande, String typeAide,
                                         BigDecimal montantAccorde) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(emailFrom);
            helper.setTo(destinataire);
            helper.setSubject(nomApp + " - Votre demande d'aide a été validée ✓");

            String montantStr = montantAccorde != null
                ? montantAccorde.toPlainString() + " MAD" : "—";

            String html = baseTemplate(
                "Demande d'aide validée",
                "<p style='color:#555;line-height:1.6'>Bonjour <strong>" + prenom + " " + nom + "</strong>,</p>" +
                "<p style='color:#555;line-height:1.6'>Nous avons le plaisir de vous informer que votre demande d'aide " +
                "a été <strong style='color:#16a34a'>validée définitivement</strong> par le Président.</p>" +
                "<div style='background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:20px 0'>" +
                "<table style='width:100%;border-collapse:collapse'>" +
                "<tr><td style='color:#64748b;padding:6px 0;font-size:14px'>Numéro de demande</td>" +
                "<td style='font-weight:bold;font-size:14px'>" + numeroDemande + "</td></tr>" +
                "<tr><td style='color:#64748b;padding:6px 0;font-size:14px'>Type d'aide</td>" +
                "<td style='font-weight:bold;font-size:14px'>" + typeAide + "</td></tr>" +
                "<tr><td style='color:#64748b;padding:6px 0;font-size:14px'>Montant accordé</td>" +
                "<td style='font-weight:bold;font-size:20px;color:#16a34a'>" + montantStr + "</td></tr>" +
                "</table></div>" +
                "<p style='color:#555;line-height:1.6'>Le virement sera effectué dans les meilleurs délais. " +
                "Vous pouvez suivre l'avancement depuis votre espace personnel.</p>" +
                "<div style='text-align:center;margin:30px 0'>" +
                "<a href='" + frontendUrl + "/mon-espace-aide' style='background:#16a34a;color:white;padding:14px 32px;" +
                "text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block'>" +
                "Voir ma demande</a></div>"
            );

            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            // Ne pas bloquer le workflow si l'email échoue
            System.err.println("Erreur envoi email notification aide: " + e.getMessage());
        }
    }

    // ── EMAIL DEMANDE D'AIDE REJETÉE ──
    public void envoyerEmailAideRejetee(String destinataire, String nom, String prenom,
                                         String numeroDemande, String typeAide, String motifRejet) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(emailFrom);
            helper.setTo(destinataire);
            helper.setSubject(nomApp + " - Résultat de votre demande d'aide");

            String html = baseTemplate(
                "Résultat de votre demande",
                "<p style='color:#555;line-height:1.6'>Bonjour <strong>" + prenom + " " + nom + "</strong>,</p>" +
                "<p style='color:#555;line-height:1.6'>Nous avons étudié votre demande d'aide " +
                "<strong>" + numeroDemande + "</strong> (" + typeAide + ").</p>" +
                "<div style='background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:20px 0'>" +
                "<p style='color:#dc2626;margin:0;font-weight:600'>Demande non accordée</p>" +
                (motifRejet != null && !motifRejet.isBlank()
                    ? "<p style='color:#555;margin:8px 0 0;font-size:14px'>Motif : " + motifRejet + "</p>"
                    : "") +
                "</div>" +
                "<p style='color:#555;line-height:1.6'>Pour toute question, contactez l'administration.</p>"
            );

            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Erreur envoi email rejet aide: " + e.getMessage());
        }
    }

    // ── TEMPLATE DE BASE ──
    private String baseTemplate(String titre, String contenu) {
        
        String logoHtml = "<img src='" + frontendUrlBase + "/logo-aos.png' alt='" + nomApp +
            "' style='height:50px;margin-bottom:10px;display:block;margin-left:auto;margin-right:auto' />";
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body>" +
            "<div style='font-family:Arial,sans-serif;max-width:600px;margin:40px auto;" +
            "background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.1)'>" +
            "<div style='background:linear-gradient(135deg,#1a73e8,#0d47a1);padding:30px;text-align:center'>" +
            logoHtml +
            "<h1 style='color:white;margin:0;font-size:22px'>" + nomApp + "</h1>" +
            "<p style='color:#bbdefb;margin:8px 0 0;font-size:14px'>" + titre + "</p>" +
            "</div>" +
            "<div style='padding:40px'>" + contenu + "</div>" +
            "<div style='text-align:center;padding:20px;background:#f8f9fa;color:#999;font-size:12px'>" +
            "© " + nomApp + " — Cet email a été envoyé automatiquement, merci de ne pas y répondre." +
            "</div></div></body></html>";
    }
}