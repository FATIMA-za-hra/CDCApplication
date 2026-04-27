package com.cdc.CDCApplication.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.email.from}")
    private String emailFrom;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void envoyerEmailCreationCompte(String destinataire, String nom, String prenom, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(emailFrom);
            helper.setTo(destinataire);
            helper.setSubject("CDCApplication - Creation de votre compte");

            String lien = frontendUrl + "/configurer-mot-de-passe?token=" + token;

            String html =
                "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body>" +
                "<div style='font-family:Arial,sans-serif;max-width:600px;margin:40px auto;background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.1)'>" +
                "<div style='background:linear-gradient(135deg,#1a73e8,#0d47a1);padding:30px;text-align:center'>" +
                "<h1 style='color:white;margin:0;font-size:24px'>CDCApplication</h1>" +
                "<p style='color:#bbdefb;margin:8px 0 0'>Gestion des acces et privileges</p>" +
                "</div>" +
                "<div style='padding:40px'>" +
                "<p style='color:#555;line-height:1.6'>Bonjour <strong>" + prenom + " " + nom + "</strong>,</p>" +
                "<p style='color:#555;line-height:1.6'>Un compte a ete cree pour vous sur <strong>CDCApplication</strong>. " +
                "Cliquez sur le bouton ci-dessous pour definir votre mot de passe :</p>" +
                "<div style='text-align:center;margin:30px 0'>" +
                "<a href='" + lien + "' style='background:#1a73e8;color:white;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block'>Configurer mon mot de passe</a>" +
                "</div>" +
                "<div style='background:#e3f2fd;border-left:4px solid #1a73e8;padding:15px;margin:20px 0;border-radius:4px'>" +
                "<strong>Important :</strong> Ce lien est valable 24 heures." +
                "</div>" +
                "</div>" +
                "<div style='text-align:center;padding:20px;background:#f8f9fa;color:#999;font-size:12px'>CDCApplication</div>" +
                "</div></body></html>";

            helper.setText(html, true);
            mailSender.send(message);

        } catch (Exception e) {
            throw new RuntimeException("Erreur envoi email : " + e.getMessage(), e);
        }
    }
}