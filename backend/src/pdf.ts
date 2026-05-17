/**
 * Server-side certificate rendering für die KjG-Hygieneschulung.
 *
 * A4 (595 × 842 pt), Layout entspricht der On-Screen-Vorschau:
 *   - Logo oben rechts (Farbe-Logo aus frontend/public/kjg-logo.png)
 *   - Eyebrow / Titel / Emerald-Divider
 *   - Großer zentrierter Name
 *   - "Dorffest Pfaffenweiler 2026" als großes Event-Highlight
 *   - Stats-Box (Quiz-Ergebnis | Datum)
 *   - Zentrierte Signatur "F. Straub"
 *   - Footer: Logo unten links, zentrierte Meta-Zeile + Hash, QR unten rechts
 *   - Eckmarker oben links & unten rechts (in den anderen Ecken sitzt das Logo)
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont, type RGB, type PDFImage } from 'pdf-lib';
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

// ---- Farb-Tokens ----
const COL_EMERALD_50 = rgb(0xEC / 255, 0xFD / 255, 0xF5 / 255);
const COL_EMERALD_100 = rgb(0xD1 / 255, 0xFA / 255, 0xE5 / 255);
const COL_EMERALD_200 = rgb(0xA7 / 255, 0xF3 / 255, 0xD0 / 255);
const COL_EMERALD_500 = rgb(0x10 / 255, 0xB9 / 255, 0x81 / 255);
const COL_EMERALD_600 = rgb(0x05 / 255, 0x96 / 255, 0x69 / 255);
const COL_EMERALD_700 = rgb(0x04 / 255, 0x78 / 255, 0x57 / 255);
const COL_SLATE_500 = rgb(0x64 / 255, 0x74 / 255, 0x8B / 255);
const COL_SLATE_700 = rgb(0x33 / 255, 0x41 / 255, 0x55 / 255);
const COL_SLATE_900 = rgb(0x0F / 255, 0x17 / 255, 0x2A / 255);

const PAGE_W = 595;
const PAGE_H = 842;

// Logo-Bytes werden gecached, weil PDF-Generierung sonst die Datei bei
// jedem Zertifikat erneut von Disk liest.
let _logoBytesCache: Uint8Array | null = null;
function loadLogoBytes(): Uint8Array | null {
  if (_logoBytesCache) return _logoBytesCache;
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    resolve(here, '../public/kjg-logo.png'),
    resolve(here, '../../frontend/public/kjg-logo.png'),
    resolve(here, '../../frontend/dist/kjg-logo.png'),
    resolve(process.cwd(), 'public/kjg-logo.png'),
    resolve(process.cwd(), 'frontend/public/kjg-logo.png'),
  ];
  for (const p of candidates) {
    try {
      const bytes = readFileSync(p);
      _logoBytesCache = new Uint8Array(bytes);
      return _logoBytesCache;
    } catch {
      // try next
    }
  }
  return null;
}

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

function fitLogo(
  img: PDFImage,
  targetWidth: number,
): { width: number; height: number } {
  const ratio = img.height / img.width;
  return { width: targetWidth, height: targetWidth * ratio };
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

  // Logo (optional — falls Datei nicht gefunden, fällt es weg).
  const logoBytes = loadLogoBytes();
  const logoImg = logoBytes ? await pdf.embedPng(logoBytes) : null;

  // ===== Innen-Rahmen =====
  const inset = 28;
  page.drawRectangle({
    x: inset,
    y: inset,
    width: PAGE_W - 2 * inset,
    height: PAGE_H - 2 * inset,
    borderColor: COL_EMERALD_200,
    borderWidth: 1.5,
  });

  // ===== Eckmarker (nur TL und BR — TR und BL sitzen die Logos) =====
  const cornerLen = 30;
  const cornerInset = inset + 12;
  const cornerThick = 2.5;
  const drawCorner = (cx: number, cy: number, dirX: 1 | -1, dirY: 1 | -1) => {
    page.drawLine({
      start: { x: cx, y: cy },
      end: { x: cx + dirX * cornerLen, y: cy },
      thickness: cornerThick,
      color: COL_EMERALD_600,
    });
    page.drawLine({
      start: { x: cx, y: cy },
      end: { x: cx, y: cy + dirY * cornerLen },
      thickness: cornerThick,
      color: COL_EMERALD_600,
    });
  };
  drawCorner(cornerInset, PAGE_H - cornerInset, 1, -1); // TL
  drawCorner(PAGE_W - cornerInset, cornerInset, -1, 1); // BR

  // ===== Logo oben rechts =====
  if (logoImg) {
    const topLogo = fitLogo(logoImg, 90);
    page.drawImage(logoImg, {
      x: PAGE_W - inset - 18 - topLogo.width,
      y: PAGE_H - inset - 18 - topLogo.height,
      width: topLogo.width,
      height: topLogo.height,
    });
  }

  // ===== Header: Eyebrow + Titel + Divider =====
  let y = PAGE_H - 130;
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
    28,
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
    COL_SLATE_700,
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

  // ===== Event: Dorffest, prominent =====
  y -= 22;
  drawCenteredText(
    page,
    'Dorffest Pfaffenweiler 2026',
    y,
    30,
    helvBold,
    COL_EMERALD_700,
  );

  // ===== Body 2 =====
  y -= 38;
  const body2 = wrapToWidth(
    'teilgenommen und das abschließende Quiz erfolgreich bestanden hat.',
    helv,
    13,
    bodyMaxWidth,
  );
  y = drawCenteredLines(page, body2, y, 13, helv, COL_SLATE_700, 6);

  // ===== Stats-Box =====
  y -= 28;
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
  const drawStat = (cx: number, label: string, value: string) => {
    const labelW = helvBold.widthOfTextAtSize(label, 9);
    page.drawText(label, {
      x: cx - labelW / 2,
      y: statsY + 42,
      size: 9,
      font: helvBold,
      color: COL_SLATE_500,
    });
    const valW = helvBold.widthOfTextAtSize(value, 18);
    page.drawText(value, {
      x: cx - valW / 2,
      y: statsY + 18,
      size: 18,
      font: helvBold,
      color: COL_SLATE_900,
    });
  };
  drawStat(statsX + statsW / 4, 'QUIZ-ERGEBNIS', `${input.correctCount} / ${input.totalCount}`);
  drawStat(statsX + (3 * statsW) / 4, 'DATUM', formatGermanDate(input.issuedAt));

  // ===== Signaturzeile (zentriert, nur Hygiene-Verantwortlicher) =====
  const sigW = 200;
  const sigY = statsY - 70;
  const sigLineY = sigY + 14;
  const sigX = (PAGE_W - sigW) / 2;
  page.drawText('F. Straub', {
    x: sigX + 30,
    y: sigLineY + 4,
    size: 18,
    font: helvOblique,
    color: COL_SLATE_900,
  });
  page.drawLine({
    start: { x: sigX, y: sigLineY },
    end: { x: sigX + sigW, y: sigLineY },
    thickness: 0.8,
    color: COL_SLATE_500,
  });
  const sigLabel = 'Hygiene-Verantwortlicher';
  const sigLabelW = helv.widthOfTextAtSize(sigLabel, 9);
  page.drawText(sigLabel, {
    x: sigX + (sigW - sigLabelW) / 2,
    y: sigY,
    size: 9,
    font: helv,
    color: COL_SLATE_500,
  });

  // ===== Footer-Bereich: Logo links, Meta center, QR rechts =====
  const footerY = 60; // Baseline für die Logo/QR-Bottom-Kante
  const footerInset = inset + 18;

  // Logo unten links
  if (logoImg) {
    const bottomLogo = fitLogo(logoImg, 70);
    page.drawImage(logoImg, {
      x: footerInset,
      y: footerY,
      width: bottomLogo.width,
      height: bottomLogo.height,
    });
  }

  // QR unten rechts
  const qrSize = 95;
  const qrX = PAGE_W - footerInset - qrSize;
  const qrY = footerY;
  const qrPng = await QRCode.toBuffer(verifyUrl, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: qrSize * 4,
    color: { dark: '#0F172A', light: '#FFFFFF' },
  });
  const qrImg = await pdf.embedPng(new Uint8Array(qrPng));
  page.drawImage(qrImg, { x: qrX, y: qrY, width: qrSize, height: qrSize });

  // Mini-Label über dem QR, zentriert relativ zum QR (nicht zur Page-Mitte)
  const qrCenter = qrX + qrSize / 2;
  const qrLabelText = 'Scannen zum Verifizieren';
  const qrLabelW = helvOblique.widthOfTextAtSize(qrLabelText, 8);
  page.drawText(qrLabelText, {
    x: qrCenter - qrLabelW / 2,
    y: qrY + qrSize + 6,
    size: 8,
    font: helvOblique,
    color: COL_SLATE_500,
  });

  // Mittiger Meta-Block zwischen Logo und QR
  const centerStartX = footerInset + 80; // hinter dem Logo
  const centerEndX = qrX - 12; // vor dem QR
  const centerMidX = (centerStartX + centerEndX) / 2;

  const metaTitle = 'Pfaffenweiler e.V.';
  const metaTitleW = helvBold.widthOfTextAtSize(metaTitle, 11);
  page.drawText(metaTitle, {
    x: centerMidX - metaTitleW / 2,
    y: footerY + 50,
    size: 11,
    font: helvBold,
    color: COL_SLATE_900,
  });
  const metaSub = 'Dorffest 20.–21.06.2026';
  const metaSubW = helv.widthOfTextAtSize(metaSub, 9);
  page.drawText(metaSub, {
    x: centerMidX - metaSubW / 2,
    y: footerY + 34,
    size: 9,
    font: helv,
    color: COL_SLATE_500,
  });
  const hashLabel = 'Hash:';
  const hashLabelW = helvBold.widthOfTextAtSize(hashLabel, 7);
  const hashShort = `${hash.slice(0, 24)}…`;
  const hashShortW = helv.widthOfTextAtSize(hashShort, 7);
  const hashTotalW = hashLabelW + 4 + hashShortW;
  page.drawText(hashLabel, {
    x: centerMidX - hashTotalW / 2,
    y: footerY + 16,
    size: 7,
    font: helvBold,
    color: COL_SLATE_500,
  });
  page.drawText(hashShort, {
    x: centerMidX - hashTotalW / 2 + hashLabelW + 4,
    y: footerY + 16,
    size: 7,
    font: helvOblique,
    color: COL_SLATE_500,
  });

  const pdfBytes = await pdf.save({ useObjectStreams: false });
  return { pdfBytes, hash, verifyUrl };
}
