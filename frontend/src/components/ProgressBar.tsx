interface Props {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: Props) {
  const pct = Math.max(0, Math.min(100, (current / total) * 100));
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-600 mb-1">
        <span>Frage {Math.min(current + 1, total)} von {total}</span>
        <span>{Math.round(pct)} %</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-kjg-primary transition-all"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={total}
        />
      </div>
    </div>
  );
}
