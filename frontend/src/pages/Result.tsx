import { Link, useNavigate } from 'react-router-dom';
import type { QuestionPublic } from '../data/questions';
import type { QuizSubmitResponse } from '../lib/api';
import { getTopicById, topics } from '../data/topics';
import { Icon } from '../components/Icon';

interface Props {
  result: QuizSubmitResponse | null;
  questions: QuestionPublic[] | null;
  onReset: () => void;
}

export function Result({ result, questions, onReset }: Props) {
  const navigate = useNavigate();

  if (!result || !questions) {
    return (
      <div className="screen">
        <div className="result-body">
          <p className="result-text">Kein Ergebnis verfügbar.</p>
        </div>
        <div className="cta-wrap">
          <Link to="/" className="btn btn-ghost btn-block">
            Zur Startseite
          </Link>
        </div>
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
    <div className="screen">
      <div className="result-body" style={{ paddingTop: 40 }}>
        <div className={`result-badge ${passed ? 'badge-pass' : 'badge-fail'}`}>
          <Icon
            name={passed ? 'CheckCircle2' : 'RefreshCw'}
            size={48}
            strokeWidth={1.75}
          />
        </div>
        <h2 className="result-title">
          {passed ? 'Bestanden!' : 'Knapp daneben.'}
        </h2>
        <p className="result-sub">
          Du hast{' '}
          <strong>
            {result.correctCount} von {result.totalCount}
          </strong>{' '}
          Fragen richtig beantwortet.
        </p>
        <p className="result-text">
          {passed
            ? 'Damit hast du die Hygiene-Belehrung fürs Dorffest 2026 abgeschlossen. Hol dir jetzt dein Zertifikat.'
            : `Fürs Bestehen brauchst du mindestens ${result.passMinCorrect} richtige Antworten. Schau dir die Themen nochmal an — du schaffst das.`}
        </p>
      </div>

      {!passed && weakSections.length > 0 && (
        <section className="px-6 pb-2">
          <div className="callout">
            <div className="callout-title">Empfehlung — bitte nochmal lesen:</div>
            <ul className="callout-list">
              {weakSections.map(([sid, s]) => {
                const t = getTopicById(sid);
                if (!t) return null;
                return (
                  <li key={sid}>
                    <Link
                      to={`/learn/${sid}`}
                      className="underline"
                      style={{ color: 'var(--emerald-800)' }}
                    >
                      {t.title}
                    </Link>{' '}
                    ({s.correct} / {s.total})
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      <section className="learn-body" aria-label="Lösungen und Quellen">
        <h3 className="subsection-title m-0">Deine Antworten im Detail</h3>
        {result.details.map((d, i) => {
          const q = questions.find((x) => x.id === d.questionId);
          if (!q) return null;
          const topic = topics.find((t) => t.id === q.sectionId);
          return (
            <article key={d.questionId} className="subsection">
              <div className="eyebrow learn-eyebrow" style={{ marginBottom: 6 }}>
                Frage {i + 1} — {topic?.title}
              </div>
              <p className="text-slate-900 font-semibold m-0 mb-2">{q.text}</p>
              <div className="options">
                {q.options.map((opt, j) => {
                  const isCorrect = j === d.correctIndex;
                  const isUserChoice = j === d.userAnswer;
                  let cls = 'option';
                  if (isCorrect) cls += ' option-correct';
                  else if (isUserChoice) cls += ' option-wrong';
                  else cls += ' option-dim';
                  return (
                    <div key={j} className={cls} style={{ cursor: 'default' }}>
                      <span className="option-letter">
                        {String.fromCharCode(65 + j)}
                      </span>
                      <span className="option-text">{opt}</span>
                      {isCorrect && (
                        <Icon
                          name="CheckCircle2"
                          size={22}
                          className="text-emerald-600 flex-shrink-0"
                        />
                      )}
                      {isUserChoice && !isCorrect && (
                        <Icon
                          name="XCircle"
                          size={22}
                          className="text-red-600 flex-shrink-0"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div
                className={`feedback ${d.isCorrect ? 'feedback-good' : 'feedback-bad'}`}
              >
                <div className="feedback-head">
                  <Icon
                    name={d.isCorrect ? 'CheckCircle2' : 'XCircle'}
                    size={20}
                  />
                  <strong>{d.isCorrect ? 'Richtig.' : 'Falsch.'}</strong>
                </div>
                <p>{d.explanation}</p>
                <p
                  style={{ marginTop: 8, color: 'var(--slate-500)', fontSize: 12 }}
                >
                  Quelle: BW-Leitfaden S. {d.sourcePage}
                </p>
              </div>
            </article>
          );
        })}
      </section>

      <div className="cta-wrap">
        {passed && result.certificateUrl ? (
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => navigate(`/quiz/certificate/${result.attemptId}`)}
          >
            Zertifikat anzeigen
            <Icon name="Award" size={20} />
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => {
              onReset();
              navigate('/start');
            }}
          >
            Nochmal probieren
            <Icon name="RefreshCw" size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
