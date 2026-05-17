import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin, ApiError } from '../lib/api';

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
        if (e.status === 401) {
          setError('Passwort falsch.');
        } else if (e.status === 429) {
          setError('Zu viele Versuche — bitte 15 Minuten warten.');
        } else if (e.status === 500) {
          setError('Admin-Passwort ist nicht konfiguriert.');
        } else {
          setError('Fehler bei der Anmeldung.');
        }
      } else {
        setError('Fehler bei der Anmeldung.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Admin-Anmeldung</h1>
      <p className="text-slate-600 text-sm">
        Nur fuer KjG-Vorstand und Schulungs-Verantwortliche.
      </p>
      <form onSubmit={onSubmit} className="card space-y-4" noValidate>
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">
            Passwort
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full min-h-12 rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-kjg-primary"
          />
        </div>
        {error && (
          <p className="text-sm text-kjg-accent" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Anmelden ...' : 'Anmelden'}
        </button>
      </form>
    </div>
  );
}
