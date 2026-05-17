import { Link } from 'react-router-dom';
import { topics } from '../data/topics';

export function Home() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wider text-kjg-primary font-semibold">
          KjG-Pfaffenweiler e.V.
        </p>
        <h1 className="text-2xl font-bold">Hygieneschulung</h1>
        <p className="text-slate-600">
          Vor dem Dorffest 2026: 8 kurze Themenblocks zur Lebensmittelhygiene, dann
          10 Fragen Quiz. Bestanden ab 8 von 10 (=&nbsp;80&nbsp;%). Bei Bestehen
          gibt&apos;s ein Zertifikat als PDF.
        </p>
      </header>

      <section aria-labelledby="topics-heading" className="space-y-3">
        <h2 id="topics-heading" className="text-lg font-semibold">
          Themen
        </h2>
        <ol className="space-y-2">
          {topics.map((t) => (
            <li key={t.id}>
              <Link
                to={`/topics/${t.id}`}
                className="card flex items-start gap-3 min-h-14 hover:border-kjg-primary focus:border-kjg-primary focus:outline-none focus:ring-2 focus:ring-kjg-primary"
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-kjg-primary text-white text-sm font-bold flex items-center justify-center mt-1">
                  {t.id}
                </span>
                <span className="flex-1">
                  <span className="block font-medium">{t.title}</span>
                  <span className="block text-sm text-slate-600">{t.subtitle}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="pt-2">
        <Link to="/quiz/start" className="btn-primary w-full">
          Quiz starten
        </Link>
      </section>
    </div>
  );
}
