import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import type { LastPass } from '../App';

interface Props {
  lastPass: LastPass | null;
  onClearLastPass: () => void;
}

function formatDe(iso: string): string {
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  } catch {
    return iso;
  }
}

export function Home({ lastPass, onClearLastPass }: Props) {
  return (
    <div className="screen ob-hero">
      <div className="ob-hero-bg" />
      <div className="ob-hero-content">
        <img
          src="/kjg-logo-white.png"
          alt="KjG Pfaffenweiler"
          className="h-11 w-auto self-start opacity-95"
        />
        <div className="ob-eyebrow">Hygiene-Schulung</div>
        <h1 className="ob-title">
          {lastPass ? 'Schon bestanden.' : "Bevor's losgeht."}
        </h1>
        <p className="ob-lede">
          {lastPass ? (
            <>
              Hi <strong>{lastPass.firstName}</strong> — du hast die
              Hygiene-Belehrung fürs <strong>Dorffest 2026</strong> bereits am{' '}
              <strong>{formatDe(lastPass.passedAt)}</strong> mit{' '}
              <strong>
                {lastPass.correctCount}/{lastPass.totalCount}
              </strong>{' '}
              bestanden.
            </>
          ) : (
            <>
              Kurze Pflicht-Belehrung fürs <strong>Dorffest 2026</strong>.
              Dauert etwa 10 Minuten. Am Ende gibt&apos;s ein Quiz und ein
              Zertifikat — ohne das geht nichts am Stand.
            </>
          )}
        </p>

        {!lastPass && (
          <div className="ob-meta">
            <div className="ob-meta-row">
              <span className="ob-meta-key">Veranstaltung</span>
              <span className="ob-meta-val">Dorffest Pfaffenweiler</span>
            </div>
            <div className="ob-meta-row">
              <span className="ob-meta-key">Datum</span>
              <span className="ob-meta-val">20.–21. Juni 2026</span>
            </div>
            <div className="ob-meta-row">
              <span className="ob-meta-key">Bereich</span>
              <span className="ob-meta-val">Speisen- &amp; Getränkeverkauf</span>
            </div>
          </div>
        )}

        {lastPass && (
          <div
            style={{
              marginTop: 'auto',
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(52,211,153,0.35)',
              borderRadius: 16,
              padding: 18,
              backdropFilter: 'blur(4px)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 999,
                  background: 'rgba(16,185,129,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#A7F3D0',
                }}
              >
                <Icon name="Award" size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 12,
                    color: '#A7F3D0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 600,
                  }}
                >
                  Dein Zertifikat
                </div>
                <div
                  style={{ fontSize: 13, color: '#CBD5E1', marginTop: 2 }}
                >
                  Bestanden am {formatDe(lastPass.passedAt)} ·{' '}
                  {lastPass.correctCount}/{lastPass.totalCount}
                </div>
              </div>
            </div>
            <a
              href={lastPass.certificateUrl}
              className="btn btn-primary btn-block"
              download
              style={{ marginBottom: 8 }}
            >
              <Icon name="Download" size={18} />
              Zertifikat herunterladen
            </a>
            <button
              type="button"
              onClick={onClearLastPass}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                fontSize: 12,
                padding: '4px 0',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontFamily: 'inherit',
              }}
            >
              Eintrag aus diesem Browser entfernen
            </button>
          </div>
        )}
      </div>
      <div className="cta-wrap cta-wrap-dark">
        <Link to="/start" className="btn btn-primary btn-block">
          {lastPass ? 'Schulung erneut machen' : "Los geht's"}
          <Icon name="ArrowRight" size={20} />
        </Link>
      </div>
    </div>
  );
}
