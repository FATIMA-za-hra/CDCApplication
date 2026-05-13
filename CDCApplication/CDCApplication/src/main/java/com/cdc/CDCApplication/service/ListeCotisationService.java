package com.cdc.CDCApplication.service;

import com.cdc.CDCApplication.entity.Adhesion;
import com.cdc.CDCApplication.repository.AdhesionRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ListeCotisationService {

    private final AdhesionRepository adhesionRepository;

    /* ─── Palette : élégant, neutre, sans bleu ni noir absolu ─── */
    private static final Color ENTETE_BG    = new Color(250, 250, 250);
    private static final Color ENTETE_BORD  = new Color(185, 185, 185);
    private static final Color ACCENT_LINE  = new Color(80,  80,  80);
    private static final Color TITRE_COLOR  = new Color(35,  35,  35);
    private static final Color SOUS_TITRE   = new Color(110, 110, 110);
    private static final Color DATE_COLOR   = new Color(150, 150, 150);
    private static final Color STAT_BG      = new Color(244, 244, 244);
    private static final Color STAT_BORD    = new Color(205, 205, 205);
    private static final Color STAT_LBL     = new Color(110, 110, 110);
    private static final Color STAT_VAL     = new Color(30,  30,  30);
    private static final Color TH_BG        = new Color(75,  75,  75);
    private static final Color TH_TXT       = Color.WHITE;
    private static final Color TR_ALT       = new Color(249, 249, 249);
    private static final Color TR_NORM      = Color.WHITE;
    private static final Color CELL_BORD    = new Color(218, 218, 218);
    private static final Color VAL_COLOR    = new Color(28,  28,  28);
    private static final Color PAYE_BAR     = new Color(130, 185, 130); // bande latérale verte douce
    private static final Color ATT_BAR      = new Color(195, 140, 140); // bande latérale rouge douce
    private static final Color TOTAL_BG     = new Color(242, 242, 242);
    private static final Color PIED_COLOR   = new Color(155, 155, 155);
    private static final Color PIED_LIGNE   = new Color(200, 200, 200);

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public ListeCotisationService(AdhesionRepository adhesionRepository) {
        this.adhesionRepository = adhesionRepository;
    }

    public byte[] genererListe(Integer annee, Long categorieId, String statut) throws Exception {
        List<Adhesion> adhesions = adhesionRepository.findAll().stream()
            .filter(a -> annee == null || a.getAnnee().equals(annee))
            .filter(a -> categorieId == null || (a.getCategorie() != null && a.getCategorie().getId().equals(categorieId)))
            .filter(a -> statut == null || statut.isBlank() || (a.getStatut() != null && a.getStatut().name().equalsIgnoreCase(statut)))
            .sorted((a, b) -> { int c = b.getAnnee().compareTo(a.getAnnee()); if(c!=0) return c;
                String na = a.getAdherent()!=null?a.getAdherent().getNom():""; String nb2=b.getAdherent()!=null?b.getAdherent().getNom():""; return na.compareTo(nb2); })
            .collect(Collectors.toList());

        PDDocument doc = new PDDocument();
        PDType1Font B = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
        PDType1Font N = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
        PDType1Font I = new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE);

        PDPage page = new PDPage(PDRectangle.A4);
        doc.addPage(page);
        float W = page.getMediaBox().getWidth();
        float H = page.getMediaBox().getHeight();
        float M = 38;
        PDPageContentStream cs = new PDPageContentStream(doc, page);

        /* ══════════════════════════════════
           EN-TÊTE
           ══════════════════════════════════ */
        rect(cs, 0, H - 80, W, 80, ENTETE_BG);
        rect(cs, 0, H - 3,  W, 3,  ACCENT_LINE);
        line(cs, 0, H - 80, W, H - 80, ENTETE_BORD, 0.8f);

        txt(cs, "CDCApplication",       M, H - 26, TITRE_COLOR, B, 17);
        txt(cs, "LISTE DES COTISATIONS",M, H - 44, SOUS_TITRE,  N, 9);
        String filtresTxt = "Annee : " + (annee!=null?annee:"Toutes") +
            "   Statut : " + (statut!=null&&!statut.isBlank()?statut:"Tous") +
            "   Edite le : " + LocalDate.now().format(FMT);
        txt(cs, filtresTxt, M, H - 60, DATE_COLOR, N, 8);
        line(cs, M, H - 68, W - M, H - 68, CELL_BORD, 0.5f);

        float y = H - 90;

        /* ══════════════════════════════════
           CARTES STATISTIQUES
           ══════════════════════════════════ */
        long   total  = adhesions.size();
        long   nbPaye = adhesions.stream().filter(a -> a.getStatut()==Adhesion.StatutAdhesion.PAYE).count();
        long   nbAtt  = adhesions.stream().filter(a -> a.getStatut()==Adhesion.StatutAdhesion.EN_ATTENTE).count();
        BigDecimal mont = adhesions.stream()
            .filter(a -> a.getStatut()==Adhesion.StatutAdhesion.PAYE)
            .map(a -> a.getMontant()!=null?a.getMontant():BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO,BigDecimal::add);

        String[][] stats = {{"Total",String.valueOf(total)},{"Payees",String.valueOf(nbPaye)},{"En attente",String.valueOf(nbAtt)},{"Montant percu",mont.toPlainString()+" MAD"}};
        float cw4 = (W - 2*M - 9) / 4f;
        float sx  = M;
        for (String[] s : stats) {
            rect(cs, sx, y - 36, cw4, 38, STAT_BG);
            cs.setStrokingColor(STAT_BORD); cs.setLineWidth(0.5f);
            cs.addRect(sx, y - 36, cw4, 38); cs.stroke();
            txt(cs, s[0],           sx + 6, y - 13, STAT_LBL, N, 8);
            txt(cs, trunc(s[1],16), sx + 6, y - 29, STAT_VAL, B, 11);
            sx += cw4 + 3;
        }
        y -= 50;

        /* ══════════════════════════════════
           TABLEAU
           ══════════════════════════════════ */
        float tw = W - 2*M;
        String[] cols = {"N  Adh.", "Nom & Prenom", "Categorie", "Annee", "Montant", "Date paiement", "Statut"};
        float[]  cw   = {tw*.11f, tw*.21f, tw*.16f, tw*.08f, tw*.12f, tw*.15f, tw*.17f};
        y = th(cs, cols, cw, M, y, B);

        boolean alt = false;
        for (Adhesion adh : adhesions) {
            if (y < 60) {
                pied(cs, N, W, M, filtresTxt);
                cs.close(); PDPage np = new PDPage(PDRectangle.A4); doc.addPage(np);
                cs = new PDPageContentStream(doc, np); y = H - M;
                y = th(cs, cols, cw, M, y, B); alt = false;
            }
            float rH = 13;
            Color bg = alt ? TR_ALT : TR_NORM;
            rect(cs, M, y - rH + 2, sum(cw), rH, bg);

            // Bande latérale colorée douce selon statut
            if (adh.getStatut() == Adhesion.StatutAdhesion.PAYE)
                rect(cs, M, y - rH + 2, 3, rH, PAYE_BAR);
            else if (adh.getStatut() == Adhesion.StatutAdhesion.EN_ATTENTE)
                rect(cs, M, y - rH + 2, 3, rH, ATT_BAR);

            line(cs, M, y - rH + 2, M + sum(cw), y - rH + 2, CELL_BORD, 0.3f);

            String numAdh  = adh.getAdherent()!=null && adh.getAdherent().getNumeroAdherent()!=null ? adh.getAdherent().getNumeroAdherent() : "---";
            String nom     = adh.getAdherent()!=null ? adh.getAdherent().getPrenom()+" "+adh.getAdherent().getNom() : "---";
            String cat     = adh.getCategorie()!=null ? adh.getCategorie().getLibelle() : "---";
            String mont2   = adh.getMontant()!=null ? adh.getMontant().toPlainString() : "---";
            String datePai = adh.getDatePaiement()!=null ? adh.getDatePaiement().format(FMT) : "---";
            String stat    = adh.getStatut()!=null ? adh.getStatut().name() : "---";
            String[] row   = {numAdh, trunc(nom,18), trunc(cat,13), String.valueOf(adh.getAnnee()), mont2, datePai, stat};

            float cx = M + 4;
            for (int i = 0; i < row.length; i++) {
                txt(cs, row[i], cx + 2, y - 9, VAL_COLOR, N, 7.5f); cx += cw[i];
            }
            y -= rH; alt = !alt;
        }

        if (adhesions.isEmpty()) {
            y -= 14;
            txt(cs, "Aucune cotisation ne correspond aux criteres selectionnes.", M+10, y, STAT_LBL, I, 10);
        }

        /* ══════════════════════════════════
           LIGNE TOTAL
           ══════════════════════════════════ */
        if (!adhesions.isEmpty()) {
            y -= 4;
            rect(cs, M, y - 16, sum(cw), 18, TOTAL_BG);
            line(cs, M, y - 16, M+sum(cw), y - 16, ENTETE_BORD, 0.5f);
            line(cs, M, y + 2,  M+sum(cw), y + 2,  ENTETE_BORD, 0.5f);
            txt(cs, "Total : "+nbPaye+" payee(s) / "+total+" adhesion(s)", M+4, y - 11, STAT_LBL, N, 8);
            String totStr = "Montant percu : " + mont.toPlainString() + " MAD";
            float  totW   = B.getStringWidth(san(totStr)) / 1000f * 9;
            txt(cs, totStr, M + sum(cw) - totW - 6, y - 11, STAT_VAL, B, 9);
        }

        pied(cs, N, W, M, filtresTxt);
        cs.close();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        doc.save(baos); doc.close();
        return baos.toByteArray();
    }

    private float th(PDPageContentStream cs, String[] cols, float[] cw, float x, float y, PDType1Font B) throws Exception {
        float rH = 16;
        rect(cs, x, y - rH + 2, sum(cw), rH, TH_BG);
        float cx = x + 4;
        for (int i = 0; i < cols.length; i++) { txt(cs, cols[i], cx+2, y-11, TH_TXT, B, 7.5f); cx += cw[i]; }
        return y - rH;
    }

    private void pied(PDPageContentStream cs, PDType1Font N, float W, float M, String filtres) throws Exception {
        String t = "CDCApplication  ·  Liste des Cotisations  ·  " + LocalDate.now().format(FMT);
        line(cs, M, 30, W-M, 30, PIED_LIGNE, 0.5f);
        float tw = N.getStringWidth(san(t)) / 1000f * 7;
        txt(cs, t, (W-tw)/2, 18, PIED_COLOR, N, 7);
    }

    private void rect(PDPageContentStream cs, float x, float y, float w, float h, Color c) throws Exception {
        cs.setNonStrokingColor(c); cs.addRect(x,y,w,h); cs.fill();
    }
    private void txt(PDPageContentStream cs, String t, float x, float y, Color c, PDType1Font f, float s) throws Exception {
        cs.beginText(); cs.setNonStrokingColor(c); cs.setFont(f,s);
        cs.newLineAtOffset(x,y); cs.showText(san(t)); cs.endText();
    }
    private void line(PDPageContentStream cs, float x1, float y1, float x2, float y2, Color c, float w) throws Exception {
        cs.setStrokingColor(c); cs.setLineWidth(w); cs.moveTo(x1,y1); cs.lineTo(x2,y2); cs.stroke();
    }
    private float sum(float[] a) { float s=0; for(float v:a) s+=v; return s; }
    private String trunc(String s, int m) { if(s==null) return "---"; return s.length()>m?s.substring(0,m)+".":s; }
    private String san(String s) { if(s==null) return ""; return s.replaceAll("[^\\x00-\\xFF]","?").replace("\n"," ").replace("\r",""); }
}