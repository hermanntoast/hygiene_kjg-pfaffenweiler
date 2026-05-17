import { Icon } from './Icon';

interface Props {
  label: string;
  progress: number;
  onBack?: () => void;
  showBack?: boolean;
}

export function TopBar({ label, progress, onBack, showBack = false }: Props) {
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <div className="topbar">
      <div className="topbar-row">
        {showBack && onBack ? (
          <button
            type="button"
            className="iconbtn"
            onClick={onBack}
            aria-label="Zurück"
          >
            <Icon name="ArrowLeft" size={20} />
          </button>
        ) : (
          <span style={{ width: 36 }} />
        )}
        <div className="topbar-label">{label}</div>
        <span style={{ width: 36 }} />
      </div>
      <div className="progress">
        <div
          className="progress-fill"
          style={{ width: `${Math.round(pct * 100)}%` }}
          role="progressbar"
          aria-valuenow={Math.round(pct * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
