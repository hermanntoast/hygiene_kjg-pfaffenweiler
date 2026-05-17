import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizStart, ApiError } from '../lib/api';
import { DatenschutzNotice } from '../components/DatenschutzNotice';

interface QuizIntroProps {
  onSessionStarted: (
    payload: Awaited<ReturnType<typeof quizStart>>,
  ) => void;
}

export function QuizIntro({ onSessionStarted }: QuizIntroProps) {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!firstName.trim() || !lastName.trim()) {
      setError('Bitte Vor- und Nachnamen eintragen.');
      return;
    }
    setLoading(true);
    try {
      const payload = await quizStart({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
      });
      onSessionStarted(payload);
      navigate('/quiz');
    } catch (e) {
      if (e instanceof ApiError && e.status === 429) {
        const retry = (e.payload as { retryAfterSeconds?: number } | null)
          ?.retryAfterSeconds;
        setError(
          retry
            ? `Bitte ${retry} Sekunden warten, bevor du erneut starten kannst.`
            : 'Bitte kurz warten, bevor du erneut startest.',
        );
      } else {
        setError('Quiz konnte nicht gestartet werden. Bitte erneut versuchen.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Quiz starten</h1>
        <p className="text-slate-600">
          10 Fragen aus den 8 Themen. Bestanden ab <strong>8 von 10</strong>{' '}
          richtigen Antworten (= 80 %). Bearbeitungszeit: 30 Minuten.
        </p>
      </header>

      <DatenschutzNotice />

      <form onSubmit={onSubmit} className="card space-y-4" noValidate>
        <div className="space-y-1">
          <label htmlFor="firstName" className="text-sm font-medium">
            Vorname *
          </label>
          <input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            autoComplete="given-name"
            className="w-full min-h-12 rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-kjg-primary"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="lastName" className="text-sm font-medium">
            Nachname *
          </label>
          <input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            autoComplete="family-name"
            className="w-full min-h-12 rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-kjg-primary"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            E-Mail (optional)
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full min-h-12 rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-kjg-primary"
          />
        </div>
        {error && (
          <p className="text-sm text-kjg-accent" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Wird gestartet ...' : 'Quiz starten'}
        </button>
      </form>
    </div>
  );
}
