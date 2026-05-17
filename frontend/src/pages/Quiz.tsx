import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { QuestionPublic } from '../data/questions';
import { quizSubmit, ApiError, type QuizStartResponse, type QuizSubmitResponse } from '../lib/api';
import { ProgressBar } from '../components/ProgressBar';
import { Countdown } from '../components/Countdown';

interface QuizProps {
  session: QuizStartResponse;
  onSubmitted: (result: QuizSubmitResponse, questions: QuestionPublic[]) => void;
  onReset: () => void;
}

function shuffleIndices(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface DisplayQuestion {
  question: QuestionPublic;
  optionOrder: number[]; // shuffled indices into `options`
}

export function Quiz({ session, onSubmitted, onReset }: QuizProps) {
  const navigate = useNavigate();
  const display = useMemo<DisplayQuestion[]>(
    () =>
      session.questions.map((q) => ({
        question: q,
        optionOrder: shuffleIndices(q.options.length),
      })),
    [session],
  );

  const [idx, setIdx] = useState(0);
  /** Answers as **original** option indices into question.options, -1 = unanswered. */
  const [answers, setAnswers] = useState<number[]>(() =>
    Array(session.questions.length).fill(-1),
  );
  const [submitting, setSubmitting] = useState(false);
  const [expired, setExpired] = useState(false);

  const current = display[idx];
  const totalQs = display.length;
  const answeredAll = answers.every((a) => a >= 0);

  function pick(displayedIndex: number) {
    const originalIndex = current.optionOrder[displayedIndex];
    setAnswers((prev) => {
      const next = [...prev];
      next[idx] = originalIndex;
      return next;
    });
  }

  async function submit() {
    setSubmitting(true);
    try {
      const result = await quizSubmit({
        token: session.token,
        answers,
      });
      onSubmitted(result, session.questions);
      navigate(`/quiz/result/${result.attemptId}`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setExpired(true);
      } else {
        alert('Quiz konnte nicht abgesendet werden. Bitte erneut versuchen.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (expired) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Bearbeitungszeit abgelaufen</h1>
        <p className="text-slate-700">
          Die 30-minuetige Bearbeitungszeit ist vorbei. Die Antworten wurden
          nicht gespeichert.
        </p>
        <button
          type="button"
          className="btn-primary w-full"
          onClick={() => {
            onReset();
            navigate('/quiz/start');
          }}
        >
          Quiz neu starten
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <ProgressBar current={idx} total={totalQs} />
        <Countdown
          expiresAt={session.expiresAt}
          onExpire={() => setExpired(true)}
        />
      </div>

      <article className="card space-y-4">
        <p className="text-xs uppercase tracking-wider text-kjg-primary font-semibold">
          Frage {idx + 1}
        </p>
        <h2 className="text-lg font-semibold leading-snug">
          {current.question.text}
        </h2>

        <ul className="space-y-2">
          {current.optionOrder.map((origIdx, displayPos) => {
            const isSelected = answers[idx] === origIdx;
            return (
              <li key={origIdx}>
                <button
                  type="button"
                  onClick={() => pick(displayPos)}
                  className={`w-full min-h-12 text-left rounded-lg border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-kjg-primary ${
                    isSelected
                      ? 'border-kjg-primary bg-kjg-primary/10'
                      : 'border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                  aria-pressed={isSelected}
                >
                  <span className="font-medium mr-2">
                    {String.fromCharCode(65 + displayPos)})
                  </span>
                  {current.question.options[origIdx]}
                </button>
              </li>
            );
          })}
        </ul>
      </article>

      <nav className="flex gap-2">
        <button
          type="button"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="btn-secondary flex-1 disabled:opacity-50"
        >
          Zurueck
        </button>
        {idx < totalQs - 1 ? (
          <button
            type="button"
            onClick={() => setIdx((i) => Math.min(totalQs - 1, i + 1))}
            disabled={answers[idx] < 0}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            Weiter
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!answeredAll || submitting}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {submitting ? 'Sende ...' : 'Abgeben'}
          </button>
        )}
      </nav>

      {!answeredAll && idx === totalQs - 1 && (
        <p className="text-xs text-kjg-accent">
          Bitte alle Fragen beantworten, bevor du abgibst.
        </p>
      )}
    </div>
  );
}
