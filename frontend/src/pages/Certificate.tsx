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
      color: { dark: '#0F172A', light: '#FFFFFF00' },
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
          <div className="cert-corner cert-corner-tl" />
          <div className="cert-corner cert-corner-tr" />
          <div className="cert-corner cert-corner-bl" />
          <div className="cert-corner cert-corner-br" />

          <div className="cert-eyebrow">Hygiene-Belehrung</div>
          <div className="cert-org">KjG Pfaffenweiler e.V.</div>
          <div className="cert-divider" />

          <div className="cert-intro">Hiermit wird bestätigt, dass</div>
          <div className="cert-name">{fullName}</div>
          <div className="cert-body">
            an der Hygiene-Belehrung gemäß Infektionsschutzgesetz (IfSG) und
            Lebensmittelhygiene-Verordnung (LMHV) für das
          </div>
          <div className="cert-event">Dorffest Pfaffenweiler 2026</div>
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

          <div className="cert-sign-row" style={{ alignItems: 'end' }}>
            <div className="cert-sign">
              <div className="cert-sign-line" />
              <div className="cert-sign-label">Unterschrift Teilnehmer*in</div>
            </div>
            <div className="cert-sign">
              <div className="cert-sign-line cert-sign-line--filled">
                F. Straub
              </div>
              <div className="cert-sign-label">Hygiene-Verantwortlicher</div>
            </div>
          </div>

          {qrDataUrl && (
            <div
              style={{
                marginTop: 18,
                paddingTop: 14,
                borderTop: '1px dashed var(--slate-200)',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                justifyContent: 'center',
              }}
            >
              <img
                src={qrDataUrl}
                alt="Verifikations-QR"
                width={88}
                height={88}
                style={{
                  background: '#fff',
                  padding: 4,
                  borderRadius: 8,
                  border: '1px solid var(--slate-200)',
                }}
              />
              <div style={{ textAlign: 'left' }}>
                <div
                  style={{
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                    color: 'var(--slate-500)',
                    marginBottom: 4,
                  }}
                >
                  Zertifikat verifizieren
                </div>
                <div style={{ fontSize: 12, color: 'var(--slate-700)' }}>
                  Code scannen — zeigt Initialen + Datum
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: 9,
                    color: 'var(--slate-400)',
                    wordBreak: 'break-all',
                  }}
                >
                  {hash?.slice(0, 16)}…
                </div>
              </div>
            </div>
          )}

          <div className="cert-foot">
            <div className="cert-foot-mark">KjG</div>
            <div className="cert-foot-meta">
              Pfaffenweiler — Veranstaltung 20.–21.06.2026
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
