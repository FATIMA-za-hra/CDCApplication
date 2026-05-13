package com.cdc.CDCApplication.service;

import com.cdc.CDCApplication.entity.Adherent;
import com.cdc.CDCApplication.entity.Adhesion;
import com.cdc.CDCApplication.repository.AdhesionRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class RecuPaiementService {

    private final AdhesionRepository adhesionRepository;

    /* ─── Palette : blanc cassé + gris + touches de gris moyen ─── */
    private static final Color ENTETE_BG    = new Color(250, 250, 250);
    private static final Color ENTETE_BORD  = new Color(190, 190, 190);
    private static final Color TITRE_COLOR  = new Color(35,  35,  35);
    private static final Color SOUS_TITRE   = new Color(110, 110, 110);
    private static final Color NUM_COLOR    = new Color(130, 130, 130);
    private static final Color STATUT_BORD  = new Color(140, 140, 140);
    private static final Color STATUT_TXT   = new Color(50,  50,  50);
    private static final Color SECTION_LBL  = new Color(120, 120, 120);
    private static final Color LIGNE_SEP    = new Color(210, 210, 210);
    private static final Color ROW_ALT      = new Color(252, 252, 252);
    private static final Color LABEL_COLOR  = new Color(105, 105, 105);
    private static final Color VALUE_COLOR  = new Color(28,  28,  28);
    private static final Color MONTANT_BG   = new Color(246, 246, 246);
    private static final Color MONTANT_BORD = new Color(195, 195, 195);
    private static final Color PIED_COLOR   = new Color(160, 160, 160);
    private static final Color PIED_LIGNE   = new Color(200, 200, 200);
    private static final Color PHOTO_BG     = new Color(238, 238, 238);
    private static final Color ACCENT_LINE  = new Color(80,  80,  80);   // filet d'accent haut

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public RecuPaiementService(AdhesionRepository adhesionRepository) {
        this.adhesionRepository = adhesionRepository;
    }

    public byte[] genererRecu(Long adhesionId) throws Exception {
        Adhesion adh = adhesionRepository.findById(adhesionId)
                .orElseThrow(() -> new RuntimeException("Adhesion introuvable"));
        Adherent a = adh.getAdherent();

        PDDocument doc = new PDDocument();
        PDType1Font B = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
        PDType1Font N = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
        PDType1Font I = new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE);

        // A5 paysage
        PDPage page = new PDPage(new PDRectangle(PDRectangle.A5.getHeight(), PDRectangle.A5.getWidth()));
        doc.addPage(page);
        float W = page.getMediaBox().getWidth();
        float H = page.getMediaBox().getHeight();
        float M = 30;

        PDPageContentStream cs = new PDPageContentStream(doc, page);

        /* ══════════════════════════════════
           EN-TÊTE : fond très clair, filet accent
           ══════════════════════════════════ */
        rect(cs, 0, H - 78, W, 78, ENTETE_BG);
        rect(cs, 0, H - 3,  W, 3,  ACCENT_LINE); // filet supérieur
        line(cs, 0, H - 78, W, H - 78, ENTETE_BORD, 0.8f);

        // Photo adhérent dans l'en-tête
        float PSZ = 58;
        boolean hasPhoto = false;
        if (a != null && a.getPhotoChemin() != null) {
            try {
                File f = new File(a.getPhotoChemin());
                if (f.exists()) {
                    PDImageXObject img = PDImageXObject.createFromFile(a.getPhotoChemin(), doc);
                    rect(cs, M, H - 74, PSZ, PSZ, PHOTO_BG);
                    cs.drawImage(img, M, H - 74, PSZ, PSZ);
                    hasPhoto = true;
                }
            } catch (Exception ignored) {}
        }
        float TX = hasPhoto ? M + PSZ + 12 : M;

        txt(cs, "CDCApplication",   TX, H - 25, TITRE_COLOR, B, 15);
        txt(cs, "RECU DE PAIEMENT", TX, H - 41, SOUS_TITRE,  N, 9);
        String numRecu = "N  REC-" + adhesionId + "-" + adh.getAnnee();
        txt(cs, numRecu, TX, H - 56, NUM_COLOR, I, 8);

        // Statut sobre (cadre simple)
        String statTxt = adh.getStatut() != null ? adh.getStatut().name() : "";
        float  sw      = B.getStringWidth(statTxt) / 1000f * 12;
        float  sx      = W - M - sw - 14;
        float  sy      = H - 62;
        cs.setStrokingColor(STATUT_BORD); cs.setLineWidth(0.7f);
        cs.addRect(sx, sy, sw + 14, 19); cs.stroke();
        txt(cs, statTxt, sx + 7, sy + 5, STATUT_TXT, B, 12);
        String dateTxt = "Emis le " + LocalDate.now().format(FMT);
        float  dw      = N.getStringWidth(dateTxt) / 1000f * 8;
        txt(cs, dateTxt, W - M - dw, H - 26, NUM_COLOR, N, 8);

        float y = H - 90;

        /* ══════════════════════════════════
           ADHÉRENT
           ══════════════════════════════════ */
        line(cs, M, y, W - M, y, LIGNE_SEP, 0.5f); y -= 4;
        txt(cs, "ADHERENT", M, y, SECTION_LBL, B, 7); y -= 14;
        if (a != null) {
            txt(cs, a.getPrenom() + " " + a.getNom(), M, y, VALUE_COLOR, B, 12); y -= 13;
            String l2 = "N  " + val(a.getNumeroAdherent());
            if (a.getCin() != null) l2 += "   CIN : " + a.getCin();
            txt(cs, l2, M, y, LABEL_COLOR, N, 8); y -= 11;
            if (a.getService() != null) { txt(cs, "Service : " + a.getService(), M, y, LABEL_COLOR, N, 8); y -= 11; }
        }
        y -= 8;
        line(cs, M, y, W - M, y, LIGNE_SEP, 0.5f); y -= 12;

        /* ══════════════════════════════════
           DÉTAILS
           ══════════════════════════════════ */
        txt(cs, "DETAILS DE LA COTISATION", M, y, SECTION_LBL, B, 7); y -= 14;
        String[][] det = {
            {"Annee de cotisation", String.valueOf(adh.getAnnee())},
            {"Categorie",           adh.getCategorie() != null ? adh.getCategorie().getLibelle() : "---"},
            {"Date de paiement",    adh.getDatePaiement() != null ? adh.getDatePaiement().format(FMT) : "---"},
            {"Mode de paiement",    adh.getModePaiement() != null ? adh.getModePaiement() : "---"},
            {"Reference",           adh.getReferencePaiement() != null ? adh.getReferencePaiement() : "---"},
        };
        float lw = 130; boolean alt = false;
        for (String[] row : det) {
            if (alt) rect(cs, M, y - 12, W - 2*M, 15, ROW_ALT);
            txt(cs, row[0], M + 4,     y - 9, LABEL_COLOR, N, 8);
            txt(cs, row[1], M + lw,    y - 9, VALUE_COLOR, B, 8);
            line(cs, M, y - 12, W - M, y - 12, LIGNE_SEP, 0.3f);
            y -= 16; alt = !alt;
        }
        y -= 10;

        /* ══════════════════════════════════
           MONTANT : encadré sobre
           ══════════════════════════════════ */
        rect(cs, M, y - 36, W - 2*M, 40, MONTANT_BG);
        cs.setStrokingColor(MONTANT_BORD); cs.setLineWidth(0.6f);
        cs.addRect(M, y - 36, W - 2*M, 40); cs.stroke();

        txt(cs, "MONTANT TOTAL", M + 12, y - 12, LABEL_COLOR, N, 8);
        String mStr = adh.getMontant() != null ? adh.getMontant().toPlainString() + " MAD" : "--- MAD";
        txt(cs, mStr, M + 12, y - 29, VALUE_COLOR, B, 18);

        if (Boolean.TRUE.equals(adh.getEstExonere()) && adh.getMontantExonere() != null) {
            String exo = "dont exoneration : " + adh.getMontantExonere().toPlainString() + " MAD";
            float  ew  = I.getStringWidth(exo) / 1000f * 8;
            txt(cs, exo, W - M - ew - 10, y - 22, NUM_COLOR, I, 8);
        }
        y -= 52;

        /* ══════════════════════════════════
           OBSERVATIONS + SIGNATURE
           ══════════════════════════════════ */
        if (adh.getObservations() != null && !adh.getObservations().isBlank()) {
            txt(cs, "Obs. : " + adh.getObservations(), M, y, LABEL_COLOR, I, 8); y -= 14;
        }
        y -= 8;
        line(cs, M, y, W - M, y, LIGNE_SEP, 0.5f); y -= 13;
        txt(cs, "Signature du responsable :", M, y, LABEL_COLOR, N, 8);
        txt(cs, "Date d emission : " + LocalDate.now().format(FMT), W - M - 128, y, LABEL_COLOR, N, 8);
        y -= 34;
        line(cs, M, y, M + 110, y, new Color(140, 140, 140), 0.5f);

        // Pied
        line(cs, M, 22, W - M, 22, PIED_LIGNE, 0.5f);
        String pied = "CDCApplication  ·  Recu de Paiement  ·  " + LocalDate.now().format(FMT);
        float  pw   = I.getStringWidth(san(pied)) / 1000f * 7;
        txt(cs, pied, (W - pw) / 2, 12, PIED_COLOR, I, 7);

        cs.close();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        doc.save(baos); doc.close();
        return baos.toByteArray();
    }

    private void rect(PDPageContentStream cs, float x, float y, float w, float h, Color c) throws Exception {
        cs.setNonStrokingColor(c); cs.addRect(x, y, w, h); cs.fill();
    }
    private void txt(PDPageContentStream cs, String t, float x, float y, Color c, PDType1Font f, float s) throws Exception {
        cs.beginText(); cs.setNonStrokingColor(c); cs.setFont(f, s);
        cs.newLineAtOffset(x, y); cs.showText(san(t)); cs.endText();
    }
    private void line(PDPageContentStream cs, float x1, float y1, float x2, float y2, Color c, float w) throws Exception {
        cs.setStrokingColor(c); cs.setLineWidth(w); cs.moveTo(x1, y1); cs.lineTo(x2, y2); cs.stroke();
    }
    private String val(String s) { return s != null && !s.isBlank() ? s : "---"; }
    private String san(String s) { if(s==null) return ""; return s.replaceAll("[^\\x00-\\xFF]","?").replace("\n"," ").replace("\r",""); }
}