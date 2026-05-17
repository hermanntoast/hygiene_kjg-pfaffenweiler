import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin, ApiError } from '../lib/api';
import { Icon } from '../components/Icon';

export function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await adminLogin(password);
      navigate('/admin/dashboard');
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 401) setError('Passwort falsch.');
        else if (e.status === 429) setError('Zu viele Versuche — bitte 15 Minuten warten.');
        else if (e.status === 500) setError('Admin-Passwort ist nicht konfiguriert.');
        else setError('Fehler bei der Anmeldung.');
      } else {
        setError('Fehler bei der Anmeldung.');
      }
    } finally {
      setLoading(false);
    }
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
        <div className="form-step">Admin-Bereich</div>
      </div>
      <form className="form-body" onSubmit={onSubmit} noValidate>
        <h2 className="form-title">Admin-Anmeldung</h2>
        <p className="form-sub">Nur für KjG-Vorstand und Schulungs-Verantwortliche.</p>

        <label className="field">
          <span className="field-label">Passwort</span>
          <input
            id="password"
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        {error && (
          <div className="info-pill" style={{ background: 'var(--red-50)', borderColor: 'var(--red-200)', color: 'var(--red-700)' }} role="alert">
            <Icon name="AlertTriangle" size={18} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ flex: 1 }} />
        <div className="cta-wrap">
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Anmelden …' : 'Anmelden'}
            <Icon name="ArrowRight" size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
