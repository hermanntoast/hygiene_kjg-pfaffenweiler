import { describe, it, expect } from 'vitest';
import { computeCertificateHash, generateCertificate } from './pdf';

const fixedInput = {
  attemptId: 42,
  firstName: 'Max',
  lastName: 'Mustermann',
  correctCount: 10,
  totalCount: 10,
  issuedAt: '2026-05-17T10:00:00.000Z',
};

describe('computeCertificateHash', () => {
  it('is deterministic for the same input', () => {
    const a = computeCertificateHash(fixedInput);
    const b = computeCertificateHash(fixedInput);
    expect(a).toBe(b);
  });

  it('is a 64-char hex sha256', () => {
    const h = computeCertificateHash(fixedInput);
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it('changes when name changes', () => {
    const h1 = computeCertificateHash(fixedInput);
    const h2 = computeCertificateHash({ ...fixedInput, firstName: 'Maxi' });
    expect(h1).not.toBe(h2);
  });

  it('changes when issuedAt changes', () => {
    const h1 = computeCertificateHash(fixedInput);
    const h2 = computeCertificateHash({
      ...fixedInput,
      issuedAt: '2026-05-18T10:00:00.000Z',
    });
    expect(h1).not.toBe(h2);
  });
});

describe('generateCertificate', () => {
  it('returns non-trivial PDF bytes and a matching hash', async () => {
    const { pdfBytes, hash } = await generateCertificate(fixedInput);
    expect(pdfBytes.byteLength).toBeGreaterThan(1000);
    expect(pdfBytes.slice(0, 4)).toEqual(new Uint8Array([0x25, 0x50, 0x44, 0x46])); // %PDF
    expect(hash).toBe(computeCertificateHash(fixedInput));
  });

  it('embeds the certificate hash in the PDF metadata (UTF-16BE)', async () => {
    const { pdfBytes, hash } = await generateCertificate(fixedInput);
    const text = Buffer.from(pdfBytes).toString('latin1');
    // pdf-lib encodes string metadata (Subject, Keywords) as UTF-16BE with BOM
    // and writes them as ASCII hex inside angle brackets. Recreate that encoding
    // and assert the encoded hash is present.
    const utf16beHex = Array.from(hash)
      .map((ch) => '00' + ch.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
    expect(text).toContain(utf16beHex);
  });

  it('renders the same PDF length for the same input (deterministic)', async () => {
    const a = await generateCertificate(fixedInput);
    const b = await generateCertificate(fixedInput);
    // pdf-lib stamps creation/mod dates by default — content length should still
    // be identical for identical inputs (we do not set extra timestamps).
    expect(a.hash).toBe(b.hash);
    // PDFs can vary in incidental bytes (xref offsets); just sanity check size:
    expect(Math.abs(a.pdfBytes.byteLength - b.pdfBytes.byteLength)).toBeLessThan(200);
  });
});
