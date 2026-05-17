import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import type { QuizSubmitResponse } from '../lib/api';
import { Icon } from '../components/Icon';

interface Props {
  user: { firstName: string; lastName: string } | null;
  result: QuizSubmitResponse | null;
  onReset: () => void;
}

function todayDe(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

function extractHash(certificateUrl: string | undefined): string | null {
  if (!certificateUrl) return null;
  const m = certificateUrl.match(/hash=([0-9a-f]{64})/);
  return m ? m[1] : null;
}

export function Certificate({ user, result, onReset }: Props) {
  const navigate = useNavigate();
  const hash = extractHash(result?.certificateUrl);
  const verifyUrl = hash ? `${window.location.origin}/verify/${hash}` : '';
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!verifyUrl) return;
    QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 256,
      color: { dark: '#0F172A', light: '#FFFFFF' },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [verifyUrl]);

  if (!user || !result || !result.passed || !result.certificateUrl) {
    return (
      <div className="screen">
        <div className="result-body">
          <p className="result-text">Kein Zertifikat verfügbar.</p>
        </div>
        <div className="cta-wrap">
          <Link to="/" className="btn btn-ghost btn-block">
            Zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  const fullName = `${user.firstName} ${user.lastName}`;
  const date = todayDe();

  return (
    <div className="screen cert-screen">
      <div className="cert-head">
        <div className="cert-head-title">Dein Zertifikat</div>
        <div className="cert-head-sub">Speichere es oder zeige es Florian.</div>
      </div>

      <div className="cert-card-wrap">
        <div className="cert-card">
          {/* Eckmarker nur TL und BR — TR/BL sitzen die Logos */}
          <div className="cert-corner cert-corner-tl" />
          <div className="cert-corner cert-corner-br" />

          {/* Logo oben rechts (größer) */}
          <img
            src="/kjg-logo.png"
            alt="KjG Pfaffenweiler"
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              width: 130,
              height: 'auto',
            }}
          />

          <div className="cert-eyebrow" style={{ marginTop: 12 }}>
            Hygiene-Belehrung
          </div>
          <div className="cert-org">KjG Pfaffenweiler e.V.</div>
          <div className="cert-divider" />

          <div className="cert-intro">Hiermit wird bestätigt, dass</div>
          <div className="cert-name">{fullName}</div>
          <div className="cert-body">
            an der Hygiene-Belehrung gemäß Infektionsschutzgesetz (IfSG) und
            Lebensmittelhygiene-Verordnung (LMHV) für das
          </div>
          <div className="cert-event" style={{ fontSize: 22, margin: '28px 0' }}>
            Dorffest VS-Pfaffenweiler 2026
          </div>
          <div className="cert-body">
            teilgenommen und das abschließende Quiz erfolgreich bestanden hat.
          </div>

          <div className="cert-stats">
            <div className="cert-stat">
              <div className="cert-stat-label">Quiz-Ergebnis</div>
              <div className="cert-stat-val">
                {result.correctCount} / {result.totalCount}
              </div>
            </div>
            <div className="cert-stat">
              <div className="cert-stat-label">Datum</div>
              <div className="cert-stat-val">{date}</div>
            </div>
          </div>

          <div
            className="cert-sign"
            style={{
              marginTop: 18,
              maxWidth: 220,
              marginInline: 'auto',
              textAlign: 'center',
            }}
          >
            <div
              className="cert-sign-line cert-sign-line--filled"
              style={{ justifyContent: 'center' }}
            >
              F. Straub
            </div>
            <div className="cert-sign-label">Hygiene-Verantwortlicher</div>
          </div>

          {/* Footer: zentrierter Meta-Block links vom QR */}
          <div
            style={{
              marginTop: 28,
              paddingTop: 16,
              borderTop: '1px dashed var(--slate-200)',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div
                style={{
                  fontWeight: 700,
                  color: 'var(--slate-900)',
                  fontSize: 14,
                }}
              >
                KjG Pfaffenweiler e.V.
              </div>
              <div
                style={{
                  color: 'var(--slate-500)',
                  marginTop: 4,
                  fontSize: 11,
                }}
              >
                Dorffest 20.–21.06.2026
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Verifikations-QR"
                  width={84}
                  height={84}
                  style={{
                    background: '#fff',
                    padding: 4,
                    borderRadius: 8,
                    border: '1px solid var(--slate-200)',
                    display: 'block',
                  }}
                />
              ) : (
                <div style={{ width: 84, height: 84 }} />
              )}
              <div
                style={{
                  marginTop: 4,
                  fontSize: 9,
                  fontStyle: 'italic',
                  color: 'var(--slate-500)',
                }}
              >
                Scannen
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="cert-actions">
        <a
          href={result.certificateUrl}
          className="btn btn-primary btn-block"
          download
        >
          <Icon name="Download" size={20} />
          PDF herunterladen
        </a>
        <button
          type="button"
          className="btn btn-ghost btn-block"
          onClick={() => {
            onReset();
            navigate('/');
          }}
        >
          Schulung neu starten
        </button>
      </div>
    </div>
  );
}
