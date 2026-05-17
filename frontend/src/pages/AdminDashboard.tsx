import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  adminAttempts,
  adminLogout,
  ApiError,
  type AdminAttempt,
} from '../lib/api';
import { Icon } from '../components/Icon';

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

  if (error) return <p className="result-text px-6 py-8">{error}</p>;
  if (!attempts) return <p className="result-text px-6 py-8">Lade …</p>;

  return (
    <div className="screen">
      <div className="form-head" style={{ justifyContent: 'space-between' }}>
        <div className="form-step">Admin — Versuche</div>
        <button type="button" onClick={onLogout} className="iconbtn" aria-label="Abmelden">
          <Icon name="ArrowLeft" size={20} />
        </button>
      </div>
      <div className="learn-body">
        <h2 className="form-title" style={{ fontSize: 24 }}>
          Versuche
        </h2>

        <div className="subsection" style={{ marginTop: 0 }}>
          <div className="flex flex-wrap gap-2 items-end">
            <div className="space-y-1 flex-1 min-w-32">
              <label className="field-label" htmlFor="filter">
                Status
              </label>
              <select
                id="filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value as Filter)}
                className="input"
              >
                <option value="all">Alle</option>
                <option value="passed">Bestanden</option>
                <option value="failed">Nicht bestanden</option>
              </select>
            </div>
            <div className="space-y-1 flex-1 min-w-32">
              <label className="field-label" htmlFor="from">
                Von
              </label>
              <input
                id="from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="input"
              />
            </div>
            <div className="space-y-1 flex-1 min-w-32">
              <label className="field-label" htmlFor="to">
                Bis
              </label>
              <input
                id="to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="input"
              />
            </div>
          </div>
          <a href="/api/admin/attempts.csv" className="btn btn-ghost btn-block mt-3" download>
            <Icon name="Download" size={18} />
            CSV exportieren
          </a>
        </div>

        <p className="text-sm text-slate-600">
          {filtered.length} von {attempts.length} Versuchen
        </p>

        {filtered.map((a) => (
          <article key={a.id} className="subsection">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-slate-900 m-0">
                {a.first_name} {a.last_name}
              </p>
              <span
                className={`text-xs font-semibold rounded-full px-2 py-0.5 ${
                  a.passed === 1
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {a.passed === 1 ? 'Bestanden' : 'Nicht bestanden'}
              </span>
            </div>
            <p className="text-sm text-slate-600 m-0 mt-1">
              {a.created_at} — {a.correct_count} / {a.total_count} richtig
              {a.email ? ` — ${a.email}` : ''}
            </p>
            {a.certificate_hash && (
              <div className="text-xs text-slate-500 mt-2 space-y-1">
                <p className="font-mono break-all m-0">{a.certificate_hash}</p>
                <a
                  href={`/api/admin/attempts/${a.id}/certificate.pdf`}
                  download
                  className="underline"
                >
                  Zertifikat herunterladen
                </a>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
