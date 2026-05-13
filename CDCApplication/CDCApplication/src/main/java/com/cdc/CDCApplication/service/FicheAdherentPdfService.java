package com.cdc.CDCApplication.service;

import com.cdc.CDCApplication.entity.Adherent;
import com.cdc.CDCApplication.entity.Adhesion;
import com.cdc.CDCApplication.entity.Enfant;
import com.cdc.CDCApplication.repository.AdherentRepository;
import com.cdc.CDCApplication.repository.AdhesionRepository;
import com.cdc.CDCApplication.repository.EnfantRepository;
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
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class FicheAdherentPdfService {

    private final AdherentRepository  adherentRepository;
    private final AdhesionRepository  adhesionRepository;
    private final EnfantRepository    enfantRepository;

    /* ─── Palette : aucun bleu, aucun noir absolu ─── */
    private static final Color ENTETE_BG   = new Color(250, 250, 250); // fond en-tête très clair
    private static final Color ENTETE_BORD = new Color(180, 180, 180); // trait de séparation
    private static final Color TITRE_ORG   = new Color(40,  40,  40);  // "CDCApplication"
    private static final Color SOUS_TITRE  = new Color(110, 110, 110); // "FICHE ADHERENT"
    private static final Color NUM_COLOR   = new Color(60,  60,  60);  // numéro adhérent
    private static final Color DATE_COLOR  = new Color(150, 150, 150); // date impression
    private static final Color SECTION_BG  = new Color(240, 240, 240); // fond titre section
    private static final Color SECTION_BAR = new Color(90,  90,  90);  // bande gauche section
    private static final Color SECTION_TXT = new Color(40,  40,  40);  // texte titre section
    private static final Color TH_BG       = new Color(80,  80,  80);  // fond en-tête tableau
    private static final Color TH_TXT      = Color.WHITE;
    private static final Color TR_ALT      = new Color(249, 249, 249); // ligne alternée tableau
    private static final Color TR_NORM     = Color.WHITE;
    private static final Color CELL_BORD   = new Color(220, 220, 220); // bordure cellule
    private static final Color LABEL_COLOR = new Color(100, 100, 100); // label champ
    private static final Color VALUE_COLOR = new Color(30,  30,  30);  // valeur champ
    private static final Color PHOTO_BG    = new Color(235, 235, 235); // fond placeholder photo
    private static final Color PHOTO_INIT  = new Color(160, 160, 160); // initiales placeholder
    private static final Color PIED_COLOR  = new Color(160, 160, 160); // texte pied de page
    private static final Color PIED_LIGNE  = new Color(200, 200, 200); // ligne pied de page
    private static final Color OBS_BG      = new Color(252, 252, 252); // fond observations

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public FicheAdherentPdfService(AdherentRepository a, AdhesionRepository ad, EnfantRepository e) {
        this.adherentRepository = a;
        this.adhesionRepository = ad;
        this.enfantRepository   = e;
    }

    public byte[] genererFiche(Long adherentId) throws Exception {
        Adherent a  = adherentRepository.findById(adherentId)
                .orElseThrow(() -> new RuntimeException("Adherent introuvable"));
        List<Adhesion> adhesions = adhesionRepository.findByAdherentId(adherentId);
        List<Enfant>   enfants   = enfantRepository.findByAdherentId(adherentId);

        PDDocument doc = new PDDocument();
        PDType1Font B  = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
        PDType1Font N  = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
        PDType1Font I  = new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE);

        PDPage page = new PDPage(PDRectangle.A4);
        doc.addPage(page);
        float W = page.getMediaBox().getWidth();   // 595
        float H = page.getMediaBox().getHeight();  // 842
        float M = 44;

        PDPageContentStream cs = new PDPageContentStream(doc, page);

        /* ══════════════════════════════════
           EN-TÊTE : fond très clair + filets
           ══════════════════════════════════ */
        rect(cs, 0, H - 82, W, 82, ENTETE_BG);
        // Filet supérieur épais (accent graphique)
        rect(cs, 0, H - 3, W, 3, SECTION_BAR);
        // Filet séparateur bas en-tête
        line(cs, 0, H - 82, W, H - 82, ENTETE_BORD, 0.8f);

        txt(cs, "CDCApplication", M, H - 28, TITRE_ORG, B, 17);
        txt(cs, "FICHE  ADHERENT", M, H - 46, SOUS_TITRE, N, 9);

        String numTxt = val(a.getNumeroAdherent());
        float  nw     = B.getStringWidth(numTxt) / 1000f * 13;
        txt(cs, numTxt, W - M - nw, H - 28, NUM_COLOR, B, 13);
        String dateTxt = "Edite le " + LocalDate.now().format(FMT);
        float  dw      = N.getStringWidth(dateTxt) / 1000f * 8;
        txt(cs, dateTxt, W - M - dw, H - 46, DATE_COLOR, N, 8);

        float y = H - 100;

        /* ══════════════════════════════════
           BLOC IDENTITÉ : Photo + 2 colonnes
           ══════════════════════════════════ */
        float PSZ = 76; // taille photo

        // Cadre photo
        rect(cs, M, y - PSZ, PSZ, PSZ, PHOTO_BG);
        line(cs, M,      y - PSZ, M + PSZ, y - PSZ, ENTETE_BORD, 0.5f);
        line(cs, M,      y,       M + PSZ, y,       ENTETE_BORD, 0.5f);
        line(cs, M,      y - PSZ, M,       y,       ENTETE_BORD, 0.5f);
        line(cs, M + PSZ,y - PSZ, M + PSZ, y,       ENTETE_BORD, 0.5f);

        boolean hasPhoto = false;
        if (a.getPhotoChemin() != null) {
            try {
                File f = new File(a.getPhotoChemin());
                if (f.exists()) {
                    PDImageXObject img = PDImageXObject.createFromFile(a.getPhotoChemin(), doc);
                    cs.drawImage(img, M, y - PSZ, PSZ, PSZ);
                    hasPhoto = true;
                }
            } catch (Exception ignored) {}
        }
        if (!hasPhoto) {
            String ini = init(a.getPrenom(), a.getNom());
            float  iw  = B.getStringWidth(ini) / 1000f * 26;
            txt(cs, ini, M + (PSZ - iw) / 2, y - PSZ / 2f - 9, PHOTO_INIT, B, 26);
        }

        // Infos en 2 colonnes à droite
        float DX  = M + PSZ + 16;
        float DW  = W - M - DX;

        txt(cs, a.getPrenom() + " " + a.getNom(), DX, y - 14, VALUE_COLOR, B, 14);
        line(cs, DX, y - 20, DX + DW, y - 20, CELL_BORD, 0.4f);

        float col1 = DX, col2 = DX + DW / 2f;
        float ry   = y - 33, rH = 13;

        String[][] c1 = {{"CIN",       val(a.getCin())},      {"Matricule", val(a.getMatricule())}, {"Telephone", val(a.getTelephone())}};
        String[][] c2 = {{"Service",   val(a.getService())},  {"Email",     trunc(val(a.getEmail()), 26)}, {"Statut",    a.getStatut() != null ? a.getStatut().name() : "---"}};

        for (int i = 0; i < 3; i++) {
            txt(cs, c1[i][0], col1,       ry, LABEL_COLOR, N, 8);
            txt(cs, c1[i][1], col1 + 54,  ry, VALUE_COLOR, B, 8);
            txt(cs, c2[i][0], col2,       ry, LABEL_COLOR, N, 8);
            txt(cs, c2[i][1], col2 + 52,  ry, VALUE_COLOR, B, 8);
            ry -= rH;
        }

        y = y - PSZ - 16;

        /* ══════════════════════════════════
           INFORMATIONS PERSONNELLES
           ══════════════════════════════════ */
        y = section(cs, "INFORMATIONS PERSONNELLES", M, y, W - 2*M, B);

        String duree = "---";
        if (a.getDateAdhesion() != null) {
            Period p = Period.between(a.getDateAdhesion(), LocalDate.now());
            duree = p.getYears() + " an(s) " + p.getMonths() + " mois";
        }
        // 4 lignes, 2 colonnes chacune
        String[][] perso = {
            {"Date de naissance",   dateAge(a.getDateNaissance()), "Date d adhesion", a.getDateAdhesion() != null ? a.getDateAdhesion().format(FMT) : "---"},
            {"Situation familiale", val(a.getSituationFamiliale()), "Duree adhesion",  duree},
            {"Nombre d enfants",    String.valueOf(a.getNombreEnfants() != null ? a.getNombreEnfants() : 0), "Categorie", a.getCategorie() != null ? a.getCategorie().getLibelle() : "---"},
            {"Adresse",             trunc(val(a.getAdresse()), 40), "", ""},
        };
        y = table2col(cs, perso, M, y, W - 2*M, N, B);
        y -= 10;

        /* ══════════════════════════════════
           HISTORIQUE COTISATIONS
           ══════════════════════════════════ */
        if (!adhesions.isEmpty()) {
            if (y < 160) { y = newPage(doc, cs, W, M, N); cs.close(); page = doc.getPage(doc.getNumberOfPages()-1); cs = new PDPageContentStream(doc, page, PDPageContentStream.AppendMode.APPEND, true); }
            y = section(cs, "HISTORIQUE DES COTISATIONS", M, y, W - 2*M, B);
            float tw = W - 2*M;
            String[] cols = {"Annee","Categorie","Montant (MAD)","Date paiement","Mode","Statut"};
            float[]  cw   = {tw*.10f, tw*.26f, tw*.17f, tw*.17f, tw*.13f, tw*.17f};
            y = th(cs, cols, cw, M, y, B);
            boolean alt = false;
            for (Adhesion adh : adhesions) {
                if (y < 50) { piedPage(cs, N, W, M); cs.close(); PDPage np = new PDPage(PDRectangle.A4); doc.addPage(np); cs = new PDPageContentStream(doc, np); y = H - M; y = th(cs, cols, cw, M, y, B); }
                String[] row = {String.valueOf(adh.getAnnee()),
                    adh.getCategorie() != null ? adh.getCategorie().getLibelle() : "---",
                    adh.getMontant() != null ? adh.getMontant().toPlainString() : "---",
                    adh.getDatePaiement() != null ? adh.getDatePaiement().format(FMT) : "---",
                    adh.getModePaiement() != null ? adh.getModePaiement() : "---",
                    adh.getStatut() != null ? adh.getStatut().name() : "---"};
                y = tr(cs, row, cw, M, y, N, alt); alt = !alt;
            }
            y -= 10;
        }

        /* ══════════════════════════════════
           ENFANTS
           ══════════════════════════════════ */
        if (!enfants.isEmpty()) {
            if (y < 100) { piedPage(cs, N, W, M); cs.close(); PDPage np = new PDPage(PDRectangle.A4); doc.addPage(np); cs = new PDPageContentStream(doc, np); y = H - M; }
            y = section(cs, "ENFANTS", M, y, W - 2*M, B);
            float tw = W - 2*M;
            String[] cols = {"Prenom","Nom","Date de naissance","Age","Sexe"};
            float[]  cw   = {tw*.22f, tw*.22f, tw*.26f, tw*.10f, tw*.20f};
            y = th(cs, cols, cw, M, y, B);
            boolean alt = false;
            for (Enfant e : enfants) {
                int age = e.getDateNaissance() != null ? Period.between(e.getDateNaissance(), LocalDate.now()).getYears() : 0;
                String sx = "M".equals(e.getSexe()) ? "Masculin" : "F".equals(e.getSexe()) ? "Feminin" : "---";
                String[] row = {val(e.getPrenom()), val(e.getNom()), e.getDateNaissance() != null ? e.getDateNaissance().format(FMT) : "---", String.valueOf(age), sx};
                y = tr(cs, row, cw, M, y, N, alt); alt = !alt;
            }
            y -= 10;
        }

        /* ══════════════════════════════════
           OBSERVATIONS
           ══════════════════════════════════ */
        if (a.getObservations() != null && !a.getObservations().isBlank()) {
            if (y < 80) { piedPage(cs, N, W, M); cs.close(); PDPage np = new PDPage(PDRectangle.A4); doc.addPage(np); cs = new PDPageContentStream(doc, np); y = H - M; }
            y = section(cs, "OBSERVATIONS", M, y, W - 2*M, B);
            rect(cs, M, y - 38, W - 2*M, 42, OBS_BG);
            line(cs, M, y - 38, W - 2*M + M, y - 38, CELL_BORD, 0.4f);
            line(cs, M, y + 4,  W - 2*M + M, y + 4,  CELL_BORD, 0.4f);
            txt(cs, trunc(a.getObservations(), 118), M + 8, y - 22, LABEL_COLOR, I, 9);
            y -= 48;
        }

        piedPage(cs, N, W, M);
        cs.close();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        doc.save(baos); doc.close();
        return baos.toByteArray();
    }

    /* ─── Helpers ─── */

    private float section(PDPageContentStream cs, String titre, float x, float y, float w, PDType1Font B) throws Exception {
        y -= 4;
        rect(cs, x,     y - 16, w, 19, SECTION_BG);
        rect(cs, x,     y - 16, 3, 19, SECTION_BAR);
        txt(cs, titre,  x + 9,  y - 10, SECTION_TXT, B, 9);
        return y - 26;
    }

    private float table2col(PDPageContentStream cs, String[][] rows, float x, float y, float w, PDType1Font N, PDType1Font B) throws Exception {
        float lw  = w * 0.22f, vw = w * 0.28f, rH = 14;
        boolean alt = false;
        for (String[] row : rows) {
            if (alt) rect(cs, x, y - rH + 3, w, rH, TR_ALT);
            txt(cs, row[0], x + 4,        y - 10, LABEL_COLOR, N, 9);
            txt(cs, trunc(row[1], 24), x + lw + 4, y - 10, VALUE_COLOR, B, 9);
            if (row.length > 2 && !row[2].isBlank()) {
                txt(cs, row[2], x + lw + vw + 4,        y - 10, LABEL_COLOR, N, 9);
                txt(cs, trunc(row[3], 22), x + lw + vw + lw + 6, y - 10, VALUE_COLOR, B, 9);
            }
            line(cs, x, y - rH + 3, x + w, y - rH + 3, CELL_BORD, 0.3f);
            y -= rH; alt = !alt;
        }
        return y;
    }

    private float th(PDPageContentStream cs, String[] cols, float[] cw, float x, float y, PDType1Font B) throws Exception {
        float rH = 16;
        rect(cs, x, y - rH + 2, sum(cw), rH, TH_BG);
        float cx = x;
        for (int i = 0; i < cols.length; i++) { txt(cs, cols[i], cx + 3, y - 11, TH_TXT, B, 7.5f); cx += cw[i]; }
        return y - rH;
    }

    private float tr(PDPageContentStream cs, String[] row, float[] cw, float x, float y, PDType1Font N, boolean alt) throws Exception {
        float rH = 13;
        rect(cs, x, y - rH + 2, sum(cw), rH, alt ? TR_ALT : TR_NORM);
        line(cs, x, y - rH + 2, x + sum(cw), y - rH + 2, CELL_BORD, 0.3f);
        float cx = x;
        for (int i = 0; i < row.length; i++) { txt(cs, trunc(row[i], 22), cx + 3, y - 9, VALUE_COLOR, N, 8); cx += cw[i]; }
        return y - rH;
    }

    private void piedPage(PDPageContentStream cs, PDType1Font N, float W, float M) throws Exception {
        String t = "CDCApplication  ·  Fiche Adherent  ·  " + LocalDate.now().format(FMT);
        line(cs, M, 32, W - M, 32, PIED_LIGNE, 0.5f);
        float tw = N.getStringWidth(san(t)) / 1000f * 7;
        txt(cs, t, (W - tw) / 2, 20, PIED_COLOR, N, 7);
    }

    private float newPage(PDDocument doc, PDPageContentStream cs, float W, float M, PDType1Font N) throws Exception {
        piedPage(cs, N, W, M); cs.close();
        PDPage np = new PDPage(PDRectangle.A4); doc.addPage(np);
        return np.getMediaBox().getHeight() - M;
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
    private float sum(float[] a) { float s = 0; for (float v : a) s += v; return s; }
    private String init(String p, String n) { return (p!=null&&!p.isEmpty()?String.valueOf(p.charAt(0)):"")+(n!=null&&!n.isEmpty()?String.valueOf(n.charAt(0)):""); }
    private String val(String s)  { return s != null && !s.isBlank() ? s : "---"; }
    private String dateAge(LocalDate d) { if(d==null) return "---"; return d.format(FMT)+" ("+Period.between(d,LocalDate.now()).getYears()+" ans)"; }
    private String trunc(String s, int m) { if(s==null) return "---"; return s.length()>m ? s.substring(0,m)+"..." : s; }
    private String san(String s)  { if(s==null) return ""; return s.replaceAll("[^\\x00-\\xFF]","?").replace("\n"," ").replace("\r",""); }
}