import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '../components/Icon';

interface VerifyResponse {
  initials: string;
  date: string;
  status: string;
}

type State =
  | { kind: 'loading' }
  | { kind: 'ok'; data: VerifyResponse }
  | { kind: 'notfound' }
  | { kind: 'rateLimited' }
  | { kind: 'invalid' }
  | { kind: 'error' };

export function Verify() {
  const { hash } = useParams<{ hash: string }>();
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    if (!hash || !/^[0-9a-f]{64}$/.test(hash)) {
      setState({ kind: 'invalid' });
      return;
    }
    fetch(`/api/verify/${hash}`)
      .then(async (r) => {
        if (r.status === 200) {
          setState({ kind: 'ok', data: (await r.json()) as VerifyResponse });
        } else if (r.status === 404) {
          setState({ kind: 'notfound' });
        } else if (r.status === 429) {
          setState({ kind: 'rateLimited' });
        } else if (r.status === 400) {
          setState({ kind: 'invalid' });
        } else {
          setState({ kind: 'error' });
        }
      })
      .catch(() => setState({ kind: 'error' }));
  }, [hash]);

  return (
    <div className="screen cert-screen">
      <div className="cert-head">
        <div className="cert-head-title">Zertifikat-Verifikation</div>
        <div className="cert-head-sub">KjG-Pfaffenweiler — Hygiene-Schulung</div>
      </div>

      <div className="cert-card-wrap">
        <div className="cert-card">
          <div className="cert-corner cert-corner-tl" />
          <div className="cert-corner cert-corner-tr" />
          <div className="cert-corner cert-corner-bl" />
          <div className="cert-corner cert-corner-br" />

          <div className="cert-eyebrow">Verifikation</div>
          <div className="cert-org">KjG Pfaffenweiler e.V.</div>
          <div className="cert-divider" />

          {state.kind === 'loading' && (
            <p className="cert-body">Prüfe Zertifikat …</p>
          )}

          {state.kind === 'ok' && (
            <>
              <div
                className="result-badge badge-pass"
                style={{ margin: '0 auto 16px', width: 72, height: 72 }}
              >
                <Icon name="CheckCircle2" size={40} strokeWidth={1.75} />
              </div>
              <div className="cert-intro">Dieses Zertifikat ist</div>
              <div
                className="cert-event"
                style={{ fontSize: 24, margin: '4px 0 16px' }}
              >
                gültig
              </div>
              <div className="cert-stats">
                <div className="cert-stat">
                  <div className="cert-stat-label">Initialen</div>
                  <div className="cert-stat-val">{state.data.initials}</div>
                </div>
                <div className="cert-stat">
                  <div className="cert-stat-label">Datum</div>
                  <div className="cert-stat-val">{state.data.date}</div>
                </div>
              </div>
              <div className="cert-body">
                Status: <strong>{state.data.status}</strong> — Hygiene-Belehrung
                für das Dorffest Pfaffenweiler 2026.
              </div>
            </>
          )}

          {state.kind === 'notfound' && (
            <>
              <div
                className="result-badge badge-fail"
                style={{ margin: '0 auto 16px', width: 72, height: 72 }}
              >
                <Icon name="XCircle" size={40} strokeWidth={1.75} />
              </div>
              <div className="cert-event" style={{ fontSize: 22, color: 'var(--red-700)' }}>
                Nicht gefunden
              </div>
              <p className="cert-body">
                Zu diesem Hash existiert kein bestandenes Zertifikat. Bitte den
                aufgedruckten Code mit dem Original vergleichen.
              </p>
            </>
          )}

          {state.kind === 'invalid' && (
            <>
              <div
                className="result-badge badge-fail"
                style={{ margin: '0 auto 16px', width: 72, height: 72 }}
              >
                <Icon name="AlertTriangle" size={40} strokeWidth={1.75} />
              </div>
              <div className="cert-event" style={{ fontSize: 22, color: 'var(--red-700)' }}>
                Ungültiger Code
              </div>
              <p className="cert-body">
                Der angegebene Verifikations-Code hat ein falsches Format.
              </p>
            </>
          )}

          {state.kind === 'rateLimited' && (
            <>
              <div
                className="result-badge badge-fail"
                style={{ margin: '0 auto 16px', width: 72, height: 72 }}
              >
                <Icon name="Clock" size={40} strokeWidth={1.75} />
              </div>
              <div className="cert-event" style={{ fontSize: 22 }}>
                Bitte später erneut
              </div>
              <p className="cert-body">
                Zu viele Anfragen. Bitte in einer Minute nochmal versuchen.
              </p>
            </>
          )}

          {state.kind === 'error' && (
            <>
              <div
                className="result-badge badge-fail"
                style={{ margin: '0 auto 16px', width: 72, height: 72 }}
              >
                <Icon name="AlertTriangle" size={40} strokeWidth={1.75} />
              </div>
              <div className="cert-event" style={{ fontSize: 22 }}>
                Fehler
              </div>
              <p className="cert-body">
                Verifikation konnte nicht abgeschlossen werden. Bitte später
                erneut versuchen.
              </p>
            </>
          )}

          <div className="cert-foot">
            <div className="cert-foot-mark">KjG</div>
            <div className="cert-foot-meta">Pfaffenweiler e.V.</div>
          </div>
        </div>
      </div>

      <div className="cert-actions">
        <Link to="/" className="btn btn-ghost btn-block">
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
