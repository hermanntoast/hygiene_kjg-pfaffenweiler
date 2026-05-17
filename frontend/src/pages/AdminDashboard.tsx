import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAttempts, adminLogout, ApiError, type AdminAttempt } from '../lib/api';

type Filter = 'all' | 'passed' | 'failed';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<AdminAttempt[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    adminAttempts()
      .then((r) => setAttempts(r.attempts))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) {
          navigate('/admin');
        } else {
          setError('Konnte Daten nicht laden.');
        }
      });
  }, [navigate]);

  const filtered = useMemo(() => {
    if (!attempts) return [];
    return attempts.filter((a) => {
      if (filter === 'passed' && a.passed !== 1) return false;
      if (filter === 'failed' && a.passed !== 0) return false;
      if (from && a.created_at.slice(0, 10) < from) return false;
      if (to && a.created_at.slice(0, 10) > to) return false;
      return true;
    });
  }, [attempts, filter, from, to]);

  async function onLogout() {
    await adminLogout();
    navigate('/admin');
  }

  if (error) {
    return <p className="text-kjg-accent">{error}</p>;
  }
  if (!attempts) {
    return <p>Lade ...</p>;
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Admin — Versuche</h1>
        <button type="button" onClick={onLogout} className="btn-secondary text-sm">
          Abmelden
        </button>
      </header>

      <section className="card space-y-3">
        <div className="flex flex-wrap gap-2 items-end">
          <div className="space-y-1 flex-1 min-w-32">
            <label className="text-xs font-medium" htmlFor="filter">
              Status
            </label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="w-full min-h-11 rounded-lg border border-slate-300 px-2"
            >
              <option value="all">Alle</option>
              <option value="passed">Bestanden</option>
              <option value="failed">Nicht bestanden</option>
            </select>
          </div>
          <div className="space-y-1 flex-1 min-w-32">
            <label className="text-xs font-medium" htmlFor="from">
              Von
            </label>
            <input
              id="from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full min-h-11 rounded-lg border border-slate-300 px-2"
            />
          </div>
          <div className="space-y-1 flex-1 min-w-32">
            <label className="text-xs font-medium" htmlFor="to">
              Bis
            </label>
            <input
              id="to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full min-h-11 rounded-lg border border-slate-300 px-2"
            />
          </div>
        </div>
        <a
          href="/api/admin/attempts.csv"
          className="btn-secondary inline-flex w-full sm:w-auto"
          download
        >
          CSV exportieren
        </a>
      </section>

      <p className="text-sm text-slate-600">
        {filtered.length} von {attempts.length} Versuchen
      </p>

      <ul className="space-y-2">
        {filtered.map((a) => (
          <li key={a.id} className="card space-y-1">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">
                {a.first_name} {a.last_name}
              </p>
              <span
                className={`text-xs font-semibold rounded-full px-2 py-0.5 ${a.passed === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}
              >
                {a.passed === 1 ? 'Bestanden' : 'Nicht bestanden'}
              </span>
            </div>
            <p className="text-sm text-slate-600">
              {a.created_at} — {a.correct_count} / {a.total_count} richtig
              {a.email && ` — ${a.email}`}
            </p>
            {a.certificate_hash && (
              <div className="text-xs text-slate-500 space-y-1">
                <p className="font-mono break-all">{a.certificate_hash}</p>
                <Link
                  to={`/api/admin/attempts/${a.id}/certificate.pdf`}
                  reloadDocument
                  className="underline"
                >
                  Zertifikat herunterladen
                </Link>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
