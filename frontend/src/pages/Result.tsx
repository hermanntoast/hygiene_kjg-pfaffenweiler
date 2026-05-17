import { Link } from 'react-router-dom';
import type { QuestionPublic } from '../data/questions';
import type { QuizSubmitResponse } from '../lib/api';
import { getTopicById, topics } from '../data/topics';

interface ResultProps {
  result: QuizSubmitResponse | null;
  questions: QuestionPublic[] | null;
}

export function Result({ result, questions }: ResultProps) {
  if (!result || !questions) {
    return (
      <div className="space-y-4">
        <p>Kein Ergebnis verfuegbar.</p>
        <Link to="/" className="btn-secondary">
          Zur Startseite
        </Link>
      </div>
    );
  }

  const passed = result.passed;
  const sectionScores = new Map<number, { correct: number; total: number }>();
  for (const d of result.details) {
    const q = questions.find((x) => x.id === d.questionId);
    if (!q) continue;
    const cur = sectionScores.get(q.sectionId) ?? { correct: 0, total: 0 };
    cur.total += 1;
    if (d.isCorrect) cur.correct += 1;
    sectionScores.set(q.sectionId, cur);
  }
  const weakSections = [...sectionScores.entries()].filter(
    ([, s]) => s.total > 0 && s.correct / s.total < 0.5,
  );

  return (
    <div className="space-y-5">
      <header
        className={`card text-center space-y-2 ${passed ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`}
      >
        <p className="text-sm uppercase tracking-wider font-semibold">
          {passed ? 'Bestanden' : 'Nicht bestanden'}
        </p>
        <p className="text-3xl font-bold">
          {result.correctCount} / {result.totalCount}
        </p>
        <p className="text-slate-700">
          Bestehen ab {result.passMinCorrect} richtigen Antworten.
        </p>
      </header>

      {passed && result.certificateUrl && (
        <a href={result.certificateUrl} className="btn-primary w-full" download>
          Zertifikat als PDF herunterladen
        </a>
      )}

      {!passed && weakSections.length > 0 && (
        <section className="card border-kjg-accent/40 bg-kjg-accent/5 space-y-2">
          <p className="font-medium">Empfehlung — bitte nochmal lesen:</p>
          <ul className="list-disc list-inside text-sm">
            {weakSections.map(([sid, s]) => {
              const t = getTopicById(sid);
              if (!t) return null;
              return (
                <li key={sid}>
                  <Link className="underline" to={`/topics/${sid}`}>
                    {t.title}
                  </Link>{' '}
                  ({s.correct} / {s.total})
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="space-y-3" aria-label="Loesungen und Quellen">
        <h2 className="text-lg font-semibold">Loesungen</h2>
        {result.details.map((d, i) => {
          const q = questions.find((x) => x.id === d.questionId);
          if (!q) return null;
          return (
            <article
              key={d.questionId}
              className={`card space-y-2 border-l-4 ${d.isCorrect ? 'border-l-emerald-500' : 'border-l-kjg-accent'}`}
            >
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Frage {i + 1} — {topics.find((t) => t.id === q.sectionId)?.title}
              </p>
              <p className="font-medium">{q.text}</p>
              <ul className="space-y-1 text-sm">
                {q.options.map((opt, j) => {
                  const isCorrect = j === d.correctIndex;
                  const isUserChoice = j === d.userAnswer;
                  let cls = 'text-slate-700';
                  if (isCorrect) cls = 'text-emerald-700 font-medium';
                  if (isUserChoice && !isCorrect) cls = 'text-kjg-accent line-through';
                  return (
                    <li key={j} className={cls}>
                      {isCorrect ? '✓ ' : isUserChoice ? '✗ ' : '   '}
                      {opt}
                    </li>
                  );
                })}
              </ul>
              <p className="text-sm text-slate-600">
                <strong>Begruendung:</strong> {d.explanation}
              </p>
              <p className="text-xs text-slate-500">
                Quelle: BW-Leitfaden S. {d.sourcePage}
              </p>
            </article>
          );
        })}
      </section>

      <Link to="/" className="btn-secondary w-full">
        Zur Startseite
      </Link>
    </div>
  );
}
