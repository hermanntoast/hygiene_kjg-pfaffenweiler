/**
 * Server-side certificate rendering for the KjG-Hygieneschulung.
 *
 * Rendered with pdf-lib (no native deps, no headless browser).
 * Each successful attempt yields a deterministic PDF + a sha256-hash that the
 * Verify-route can use without exposing the full name to the public.
 */

import { createHash } from 'node:crypto';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface CertificateInput {
  attemptId: number;
  firstName: string;
  lastName: string;
  correctCount: number;
  totalCount: number;
  /** ISO timestamp; pass a fixed value for tests to get a deterministic PDF. */
  issuedAt: string;
}

export interface CertificateOutput {
  pdfBytes: Uint8Array;
  hash: string;
}

const KJG_HEADER = 'KjG-Pfaffenweiler e.V. - Katholische junge Gemeinde';
const TITLE = 'Zertifikat - Hygieneschulung';
const SCOPE =
  'Lebensmittelhygiene gem. BW-Leitfaden des Ministeriums fuer Laendlichen Raum und ' +
  'Verbraucherschutz Baden-Wuerttemberg (Stand Januar 2025) / Dorffest Pfaffenweiler 2026.';

function formatGermanDate(iso: string): string {
  // Expect ISO; render dd.mm.yyyy (UTC to keep tests deterministic across timezones).
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

export async function generateCertificate(
  input: CertificateInput,
): Promise<CertificateOutput> {
  const hash = computeCertificateHash(input);
  const pdf = await PDFDocument.create();

  pdf.setTitle('Zertifikat - Hygieneschulung KjG-Pfaffenweiler');
  pdf.setAuthor('KjG-Pfaffenweiler e.V.');
  pdf.setSubject(`Verifikations-Hash: ${hash}`);
  pdf.setKeywords([hash]);

  // A4 portrait in pdf-lib units (1pt = 1/72 inch).
  const page = pdf.addPage([595, 842]);

  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const helvOblique = await pdf.embedFont(StandardFonts.HelveticaOblique);

  const navy = rgb(0.04, 0.29, 0.56);
  const slate = rgb(0.2, 0.2, 0.25);
  const grey = rgb(0.45, 0.45, 0.5);

  // Header band.
  page.drawRectangle({ x: 0, y: 792, width: 595, height: 50, color: navy });
  page.drawText(KJG_HEADER, {
    x: 40,
    y: 810,
    size: 13,
    font: helvBold,
    color: rgb(1, 1, 1),
  });

  // Title.
  page.drawText(TITLE, {
    x: 40,
    y: 720,
    size: 28,
    font: helvBold,
    color: navy,
  });

  // Subtitle.
  page.drawText('Hiermit wird bestaetigt, dass', {
    x: 40,
    y: 670,
    size: 14,
    font: helv,
    color: slate,
  });

  // Name.
  const fullName = `${input.firstName.trim()} ${input.lastName.trim()}`;
  page.drawText(fullName, {
    x: 40,
    y: 630,
    size: 24,
    font: helvBold,
    color: navy,
  });

  // Body.
  const bodyLines = [
    'die Online-Hygieneschulung der KjG-Pfaffenweiler erfolgreich absolviert hat.',
    '',
    `Ergebnis: ${input.correctCount} von ${input.totalCount} Fragen korrekt beantwortet`,
    `(bestanden ab ${Math.ceil(input.totalCount * 0.8)} von ${input.totalCount}).`,
    '',
    `Ausstellungsdatum: ${formatGermanDate(input.issuedAt)}`,
  ];
  let y = 590;
  for (const line of bodyLines) {
    page.drawText(line, { x: 40, y, size: 13, font: helv, color: slate });
    y -= 22;
  }

  // Scope.
  page.drawText('Geltungsbereich:', {
    x: 40,
    y: 440,
    size: 13,
    font: helvBold,
    color: slate,
  });
  // Wrap scope into ~80-char lines.
  const scopeLines = wrapText(SCOPE, 80);
  let sy = 420;
  for (const line of scopeLines) {
    page.drawText(line, { x: 40, y: sy, size: 11, font: helvOblique, color: slate });
    sy -= 16;
  }

  // Signature line.
  page.drawText('Unterschrift Veranstaltungsleitung', {
    x: 40,
    y: 220,
    size: 11,
    font: helv,
    color: slate,
  });
  page.drawLine({
    start: { x: 40, y: 240 },
    end: { x: 280, y: 240 },
    thickness: 0.8,
    color: slate,
  });

  // Footer with hash.
  page.drawText('Verifikations-Hash (sha256):', {
    x: 40,
    y: 80,
    size: 9,
    font: helvBold,
    color: grey,
  });
  page.drawText(hash, { x: 40, y: 64, size: 8, font: helv, color: grey });
  page.drawText(
    'Verifikation unter /verify/<hash> -- zeigt Initialen, Datum und Status.',
    { x: 40, y: 48, size: 9, font: helvOblique, color: grey },
  );

  const pdfBytes = await pdf.save({ useObjectStreams: false });
  return { pdfBytes, hash };
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    if (!current) {
      current = w;
    } else if (current.length + 1 + w.length <= maxChars) {
      current += ' ' + w;
    } else {
      lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines;
}
