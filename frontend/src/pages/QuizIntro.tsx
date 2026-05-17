import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';

interface Props {
  initial?: { firstName: string; lastName: string; email?: string };
  onSaveName: (n: { firstName: string; lastName: string; email?: string }) => void;
}

export function QuizIntro({ initial, onSaveName }: Props) {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState(initial?.firstName ?? '');
  const [lastName, setLastName] = useState(initial?.lastName ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const canStart = firstName.trim().length >= 2 && lastName.trim().length >= 2;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canStart) return;
    onSaveName({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim() || undefined,
    });
    navigate('/learn/1');
  }

  return (
    <div className="screen">
      <div className="form-head">
        <button
          type="button"
          className="iconbtn"
          aria-label="Zurück"
          onClick={() => navigate('/')}
        >
          <Icon name="ArrowLeft" size={20} />
        </button>
        <div className="form-step">Schritt 1 von 2</div>
      </div>
      <form className="form-body" onSubmit={onSubmit} noValidate>
        <h2 className="form-title">Wie heißt du?</h2>
        <p className="form-sub">Für dein Zertifikat am Ende.</p>

        <label className="field">
          <span className="field-label">Vorname</span>
          <input
            className="input"
            type="text"
            autoComplete="given-name"
            placeholder="z. B. Lena"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span className="field-label">Nachname</span>
          <input
            className="input"
            type="text"
            autoComplete="family-name"
            placeholder="z. B. Müller"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span className="field-label">E-Mail (optional)</span>
          <input
            className="input"
            type="email"
            autoComplete="email"
            placeholder="optional"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <div className="info-pill">
          <Icon name="Lightbulb" size={18} />
          <span>
            Genau so erscheint dein Name auf dem Zertifikat — bitte richtig
            schreiben.
          </span>
        </div>

        <details className="info-pill" style={{ background: '#F8FAFC', borderColor: '#E2E8F0', color: '#475569' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
            Datenschutz-Hinweis (DSGVO)
          </summary>
          <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.55 }}>
            Wir speichern Vor- und Nachnamen, optional E-Mail, deine Antworten,
            das Ergebnis und — bei Bestehen — das PDF-Zertifikat. Aufbewahrung:
            36 Monate, danach automatische Löschung. Bei Bestehen wird ein
            Verifikations-Hash erzeugt, unter dem öffentlich nur Initialen und
            Datum abrufbar sind.
          </div>
        </details>

        <div style={{ flex: 1 }} />

        <div className="cta-wrap">
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={!canStart}
          >
            Weiter zur Schulung
            <Icon name="ArrowRight" size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
