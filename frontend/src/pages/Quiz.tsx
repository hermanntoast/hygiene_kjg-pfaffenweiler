import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { QuestionPublic } from '../data/questions';
import {
  quizStart,
  quizSubmit,
  ApiError,
  type QuizStartResponse,
  type QuizSubmitResponse,
} from '../lib/api';
import { TopBar } from '../components/TopBar';
import { Icon } from '../components/Icon';

interface Props {
  user: { firstName: string; lastName: string; email?: string } | null;
  session: QuizStartResponse | null;
  onSessionStarted: (s: QuizStartResponse) => void;
  onSubmitted: (r: QuizSubmitResponse, qs: QuestionPublic[]) => void;
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

export function Quiz({
  user,
  session,
  onSessionStarted,
  onSubmitted,
  onReset,
}: Props) {
  const navigate = useNavigate();
  const [starting, setStarting] = useState(!session);
  const [startError, setStartError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      setStarting(false);
      setAnswers(Array(session.questions.length).fill(-1));
      return;
    }
    if (!user) {
      navigate('/start');
      return;
    }
    setStarting(true);
    quizStart(user)
      .then((s) => {
        onSessionStarted(s);
        setAnswers(Array(s.questions.length).fill(-1));
        setStarting(false);
      })
      .catch((e) => {
        setStarting(false);
        if (e instanceof ApiError && e.status === 429) {
          const retry = (e.payload as { retryAfterSeconds?: number } | null)
            ?.retryAfterSeconds;
          setStartError(
            retry
              ? `Bitte ${retry} Sekunden warten — du hast gerade erst gestartet.`
              : 'Bitte kurz warten, bevor du erneut startest.',
          );
        } else {
          setStartError('Quiz konnte nicht gestartet werden. Bitte erneut versuchen.');
        }
      });
  }, [session, user, navigate, onSessionStarted]);

  const display = useMemo(() => {
    if (!session) return [];
    return session.questions.map((q) => ({
      question: q,
      optionOrder: shuffleIndices(q.options.length),
    }));
  }, [session]);

  if (starting) {
    return (
      <div className="screen">
        <div className="result-body">
          <Icon name="RefreshCw" size={48} className="text-emerald-600 animate-spin" />
          <p className="result-text">Quiz wird vorbereitet …</p>
        </div>
      </div>
    );
  }

  if (startError) {
    return (
      <div className="screen">
        <div className="result-body">
          <div className="result-badge badge-fail">
            <Icon name="AlertTriangle" size={48} strokeWidth={1.75} />
          </div>
          <h2 className="result-title">Moment.</h2>
          <p className="result-text">{startError}</p>
        </div>
        <div className="cta-wrap">
          <button
            className="btn btn-primary btn-block"
            onClick={() => {
              onReset();
              navigate('/start');
            }}
          >
            Zurück
          </button>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const totalQs = display.length;
  const current = display[idx];
  const picked = answers[idx];
  const hasPicked = picked >= 0;
  const isLast = idx === totalQs - 1;
  const allAnswered = answers.every((a) => a >= 0);

  function pick(displayedIndex: number) {
    const originalIndex = current.optionOrder[displayedIndex];
    setAnswers((prev) => {
      const next = [...prev];
      next[idx] = originalIndex;
      return next;
    });
  }

  const handleBack = () => {
    if (idx > 0) {
      setIdx((i) => i - 1);
    } else {
      navigate('/learn/7');
    }
  };

  async function submit() {
    if (!session) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await quizSubmit({ token: session.token, answers });
      onSubmitted(result, session.questions);
      navigate(`/quiz/result/${result.attemptId}`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setSubmitError(
          (e.payload as { error?: string } | null)?.error === 'session_expired'
            ? 'Die Bearbeitungszeit ist abgelaufen. Bitte neu starten.'
            : 'Diese Quiz-Sitzung wurde bereits eingereicht.',
        );
      } else {
        setSubmitError('Konnte nicht abgesendet werden. Bitte erneut versuchen.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (submitError) {
    return (
      <div className="screen">
        <div className="result-body">
          <div className="result-badge badge-fail">
            <Icon name="AlertTriangle" size={48} strokeWidth={1.75} />
          </div>
          <h2 className="result-title">Hmm.</h2>
          <p className="result-text">{submitError}</p>
        </div>
        <div className="cta-wrap">
          <button
            className="btn btn-primary btn-block"
            onClick={() => {
              onReset();
              navigate('/start');
            }}
          >
            Quiz neu starten
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <TopBar
        label={`Frage ${idx + 1} / ${totalQs}`}
        progress={(idx + (hasPicked ? 1 : 0.5)) / totalQs}
        onBack={handleBack}
        showBack
      />
      <div className="quiz-body">
        <div className="eyebrow learn-eyebrow">
          Quiz — {session.passMinCorrect} von {totalQs} zum Bestehen
        </div>
        <h2 className="quiz-q">{current.question.text}</h2>

        <div className="options">
          {current.optionOrder.map((origIdx, displayPos) => {
            const isPicked = picked === origIdx;
            return (
              <button
                key={origIdx}
                type="button"
                onClick={() => pick(displayPos)}
                className={`option ${isPicked ? 'option-picked' : ''}`}
                aria-pressed={isPicked}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + displayPos)}
                </span>
                <span className="option-text">
                  {current.question.options[origIdx]}
                </span>
                {isPicked && (
                  <Icon
                    name="CheckCircle2"
                    size={22}
                    className="text-emerald-600 flex-shrink-0"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="cta-wrap">
        {!isLast ? (
          <button
            type="button"
            className="btn btn-primary btn-block"
            disabled={!hasPicked}
            onClick={() => setIdx((i) => Math.min(totalQs - 1, i + 1))}
          >
            Nächste Frage
            <Icon name="ArrowRight" size={20} />
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-block"
            disabled={!allAnswered || submitting}
            onClick={submit}
          >
            {submitting ? 'Wird ausgewertet …' : 'Auswerten'}
            <Icon name="ArrowRight" size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
