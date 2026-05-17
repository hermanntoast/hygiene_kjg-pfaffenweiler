import { useEffect, useState } from 'react';

interface Props {
  /** ISO timestamp when the session expires. */
  expiresAt: string;
  onExpire?: () => void;
}

function formatMmSs(ms: number): string {
  if (ms <= 0) return '00:00';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

export function Countdown({ expiresAt, onExpire }: Props) {
  const [remaining, setRemaining] = useState(
    () => new Date(expiresAt).getTime() - Date.now(),
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      const r = new Date(expiresAt).getTime() - Date.now();
      setRemaining(r);
      if (r <= 0) {
        window.clearInterval(id);
        onExpire?.();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt, onExpire]);

  const low = remaining < 5 * 60 * 1000;
  return (
    <span
      className={`tabular-nums font-medium ${low ? 'text-kjg-accent' : 'text-slate-600'}`}
      aria-label="Verbleibende Bearbeitungszeit"
    >
      {formatMmSs(remaining)}
    </span>
  );
}
