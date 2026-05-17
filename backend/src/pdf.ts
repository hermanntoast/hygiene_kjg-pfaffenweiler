/**
 * Server-side certificate rendering für die KjG-Hygieneschulung.
 *
 * Eine A4-Seite (595 x 842 pt), Layout entspricht der On-Screen-Vorschau:
 * Eck-Marker in Emerald, dünner Emerald-Innenrahmen, zentrierte Karten-
 * Struktur mit Eyebrow / Titel / Divider / Name / Event / Stats-Grid /
 * Signaturzeile / QR-Code / KjG-Footer.
 */

import { createHash } from 'node:crypto';
import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont, type RGB } from 'pdf-lib';
import QRCode from 'qrcode';

export interface CertificateInput {
  attemptId: number;
  firstName: string;
  lastName: string;
  correctCount: number;
  totalCount: number;
  /** ISO timestamp; pass a fixed value for tests to get a deterministic PDF. */
  issuedAt: string;
  /** Basis-URL (z. B. https://hygiene.kjg-pfaffenweiler.de). */
  verifyBaseUrl?: string;
}

export interface CertificateOutput {
  pdfBytes: Uint8Array;
  hash: string;
  verifyUrl: string;
}

// ---- Farb-Tokens (1:1 vom Frontend-Design) ----
const COL_EMERALD_50 = rgb(0xEC / 255, 0xFD / 255, 0xF5 / 255);
const COL_EMERALD_100 = rgb(0xD1 / 255, 0xFA / 255, 0xE5 / 255);
const COL_EMERALD_200 = rgb(0xA7 / 255, 0xF3 / 255, 0xD0 / 255);
const COL_EMERALD_500 = rgb(0x10 / 255, 0xB9 / 255, 0x81 / 255);
const COL_EMERALD_600 = rgb(0x05 / 255, 0x96 / 255, 0x69 / 255);
const COL_EMERALD_700 = rgb(0x04 / 255, 0x78 / 255, 0x57 / 255);
const COL_SLATE_500 = rgb(0x64 / 255, 0x74 / 255, 0x8B / 255);
const COL_SLATE_600 = rgb(0x47 / 255, 0x55 / 255, 0x69 / 255);
const COL_SLATE_700 = rgb(0x33 / 255, 0x41 / 255, 0x55 / 255);
const COL_SLATE_900 = rgb(0x0F / 255, 0x17 / 255, 0x2A / 255);
const COL_KJG_BLUE = rgb(0x15 / 255, 0x68 / 255, 0xA6 / 255);

const PAGE_W = 595;
const PAGE_H = 842;

function formatGermanDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export function computeCertificateHash(input: CertificateInput): string {
  const payload = [
    input.attemptId,
    input.firstName.trim(),
    input.lastName.trim(),
    input.correctCount,
    input.totalCount,
    input.issuedAt,
  ].join('|');
  return createHash('sha256').update(payload).digest('hex');
}

function drawCenteredText(
  page: PDFPage,
  text: string,
  y: number,
  size: number,
  font: PDFFont,
  color: RGB,
): void {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: (PAGE_W - width) / 2,
    y,
    size,
    font,
    color,
  });
}

function drawCenteredLines(
  page: PDFPage,
  lines: string[],
  startY: number,
  size: number,
  font: PDFFont,
  color: RGB,
  lineGap: number,
): number {
  let y = startY;
  for (const line of lines) {
    drawCenteredText(page, line, y, size, font, color);
    y -= size + lineGap;
  }
  return y;
}

function wrapToWidth(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const candidate = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function generateCertificate(
  input: CertificateInput,
): Promise<CertificateOutput> {
  const hash = computeCertificateHash(input);
  const base = (input.verifyBaseUrl ?? '').replace(/\/+$/, '');
  const verifyUrl = base ? `${base}/verify/${hash}` : `/verify/${hash}`;

  const pdf = await PDFDocument.create();
  pdf.setTitle('Zertifikat - Hygieneschulung KjG-Pfaffenweiler');
  pdf.setAuthor('KjG-Pfaffenweiler e.V.');
  pdf.setSubject(`Verifikations-URL: ${verifyUrl}`);
  pdf.setKeywords([hash]);

  const page = pdf.addPage([PAGE_W, PAGE_H]);

  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const helvOblique = await pdf.embedFont(StandardFonts.HelveticaOblique);

  // ===== Innen-Rahmen (Emerald 200, 1.5pt) — wie ::before im Design =====
  const inset = 28;
  page.drawRectangle({
    x: inset,
    y: inset,
    width: PAGE_W - 2 * inset,
    height: PAGE_H - 2 * inset,
    borderColor: COL_EMERALD_200,
    borderWidth: 1.5,
  });

  // ===== Eck-Marker (Emerald 600, 2.5pt) — wie cert-corner-* im Design =====
  const cornerLen = 30;
  const cornerInset = inset + 12;
  const cornerThick = 2.5;
  const drawCorner = (cx: number, cy: number, dirX: 1 | -1, dirY: 1 | -1) => {
    // Horizontal arm
    page.drawLine({
      start: { x: cx, y: cy },
      end: { x: cx + dirX * cornerLen, y: cy },
      thickness: cornerThick,
      color: COL_EMERALD_600,
    });
    // Vertical arm
    page.drawLine({
      start: { x: cx, y: cy },
      end: { x: cx, y: cy + dirY * cornerLen },
      thickness: cornerThick,
      color: COL_EMERALD_600,
    });
  };
  drawCorner(cornerInset, PAGE_H - cornerInset, 1, -1); // TL
  drawCorner(PAGE_W - cornerInset, PAGE_H - cornerInset, -1, -1); // TR
  drawCorner(cornerInset, cornerInset, 1, 1); // BL
  drawCorner(PAGE_W - cornerInset, cornerInset, -1, 1); // BR

  // ===== Header: Eyebrow + Titel + Divider =====
  let y = PAGE_H - 110;
  drawCenteredText(
    page,
    'HYGIENE-BELEHRUNG',
    y,
    13,
    helvBold,
    COL_EMERALD_700,
  );

  y -= 32;
  drawCenteredText(
    page,
    'KjG Pfaffenweiler e.V.',
    y,
    30,
    helvBold,
    COL_SLATE_900,
  );

  y -= 22;
  const dividerW = 60;
  page.drawRectangle({
    x: (PAGE_W - dividerW) / 2,
    y,
    width: dividerW,
    height: 2.5,
    color: COL_EMERALD_500,
  });

  // ===== Intro + Name =====
  y -= 40;
  drawCenteredText(
    page,
    'Hiermit wird bestätigt, dass',
    y,
    14,
    helv,
    COL_SLATE_600,
  );

  y -= 50;
  const fullName = `${input.firstName.trim()} ${input.lastName.trim()}`;
  drawCenteredText(page, fullName, y, 36, helvBold, COL_SLATE_900);

  // ===== Body 1 =====
  y -= 50;
  const bodyMaxWidth = PAGE_W - 2 * 90;
  const body1 = wrapToWidth(
    'an der Hygiene-Belehrung gemäß Infektionsschutzgesetz (IfSG) und Lebensmittelhygiene-Verordnung (LMHV) für das',
    helv,
    13,
    bodyMaxWidth,
  );
  y = drawCenteredLines(page, body1, y, 13, helv, COL_SLATE_700, 6);

  // ===== Event =====
  y -= 10;
  drawCenteredText(
    page,
    'Dorffest Pfaffenweiler 2026',
    y,
    22,
    helvBold,
    COL_EMERALD_700,
  );

  // ===== Body 2 =====
  y -= 30;
  const body2 = wrapToWidth(
    'teilgenommen und das abschließende Quiz erfolgreich bestanden hat.',
    helv,
    13,
    bodyMaxWidth,
  );
  y = drawCenteredLines(page, body2, y, 13, helv, COL_SLATE_700, 6);

  // ===== Stats-Box (Quiz-Ergebnis | Datum) =====
  y -= 30;
  const statsW = 380;
  const statsH = 70;
  const statsX = (PAGE_W - statsW) / 2;
  const statsY = y - statsH;
  page.drawRectangle({
    x: statsX,
    y: statsY,
    width: statsW,
    height: statsH,
    color: COL_EMERALD_50,
    borderColor: COL_EMERALD_100,
    borderWidth: 1,
  });

  const drawStat = (
    centerX: number,
    label: string,
    value: string,
  ) => {
    const labelW = helvBold.widthOfTextAtSize(label, 9);
    page.drawText(label, {
      x: centerX - labelW / 2,
      y: statsY + 42,
      size: 9,
      font: helvBold,
      color: COL_SLATE_500,
    });
    const valW = helvBold.widthOfTextAtSize(value, 18);
    page.drawText(value, {
      x: centerX - valW / 2,
      y: statsY + 18,
      size: 18,
      font: helvBold,
      color: COL_SLATE_900,
    });
  };
  drawStat(statsX + statsW / 4, 'QUIZ-ERGEBNIS', `${input.correctCount} / ${input.totalCount}`);
  drawStat(statsX + (3 * statsW) / 4, 'DATUM', formatGermanDate(input.issuedAt));

  // ===== Signaturzeile (zwei Spalten) =====
  const sigY = statsY - 75;
  const sigW = (PAGE_W - 2 * 90 - 40) / 2;
  const sigLineY = sigY + 14;
  const sigGap = 40;

  // Links: leere Linie, Label "Unterschrift Teilnehmer*in"
  page.drawLine({
    start: { x: 90, y: sigLineY },
    end: { x: 90 + sigW, y: sigLineY },
    thickness: 0.8,
    color: COL_SLATE_500,
  });
  page.drawText('Unterschrift Teilnehmer*in', {
    x: 90,
    y: sigY,
    size: 9,
    font: helv,
    color: COL_SLATE_500,
  });

  // Rechts: "F. Straub" (italic) über Linie, Label "Hygiene-Verantwortlicher"
  const rightX = 90 + sigW + sigGap;
  page.drawText('F. Straub', {
    x: rightX + 8,
    y: sigLineY + 4,
    size: 18,
    font: helvOblique,
    color: COL_SLATE_900,
  });
  page.drawLine({
    start: { x: rightX, y: sigLineY },
    end: { x: rightX + sigW, y: sigLineY },
    thickness: 0.8,
    color: COL_SLATE_500,
  });
  page.drawText('Hygiene-Verantwortlicher', {
    x: rightX,
    y: sigY,
    size: 9,
    font: helv,
    color: COL_SLATE_500,
  });

  // ===== QR-Code mit Label (zentrierte Gruppe: QR + Text) =====
  const qrSize = 95;
  const qrLabelMaxWidth = 240;
  const qrGap = 18;
  const qrGroupW = qrSize + qrGap + qrLabelMaxWidth;
  const qrX = (PAGE_W - qrGroupW) / 2;
  const qrY = 95;
  const qrPng = await QRCode.toBuffer(verifyUrl, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: qrSize * 4,
    color: { dark: '#0F172A', light: '#FFFFFF' },
  });
  const qrImg = await pdf.embedPng(new Uint8Array(qrPng));
  page.drawImage(qrImg, { x: qrX, y: qrY, width: qrSize, height: qrSize });

  const labelX = qrX + qrSize + qrGap;
  page.drawText('ZERTIFIKAT VERIFIZIEREN', {
    x: labelX,
    y: qrY + qrSize - 14,
    size: 9,
    font: helvBold,
    color: COL_EMERALD_700,
  });
  page.drawText('Code scannen — zeigt Initialen,', {
    x: labelX,
    y: qrY + qrSize - 32,
    size: 11,
    font: helv,
    color: COL_SLATE_700,
  });
  page.drawText('Datum und Bestanden-Status.', {
    x: labelX,
    y: qrY + qrSize - 46,
    size: 11,
    font: helv,
    color: COL_SLATE_700,
  });
  page.drawText('Hash:', {
    x: labelX,
    y: qrY + qrSize - 68,
    size: 8,
    font: helvBold,
    color: COL_SLATE_500,
  });
  page.drawText(`${hash.slice(0, 20)}…`, {
    x: labelX + 28,
    y: qrY + qrSize - 68,
    size: 8,
    font: helvOblique,
    color: COL_SLATE_500,
  });

  // ===== Footer: KjG-Mark + Meta (zentriert, einzeilig) =====
  const footY = 55;
  const markText = 'KjG';
  const metaText = ' — Pfaffenweiler · Dorffest 20.–21.06.2026';
  const markSize = 13;
  const metaSize = 9;
  const markW = helvBold.widthOfTextAtSize(markText, markSize);
  const metaW = helv.widthOfTextAtSize(metaText, metaSize);
  const totalW = markW + metaW;
  const startX = (PAGE_W - totalW) / 2;
  page.drawText(markText, {
    x: startX,
    y: footY,
    size: markSize,
    font: helvBold,
    color: COL_KJG_BLUE,
  });
  page.drawText(metaText, {
    x: startX + markW,
    y: footY + 1,
    size: metaSize,
    font: helv,
    color: COL_SLATE_500,
  });

  const pdfBytes = await pdf.save({ useObjectStreams: false });
  return { pdfBytes, hash, verifyUrl };
}
