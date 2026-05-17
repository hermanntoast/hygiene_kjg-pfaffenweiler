import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { Topic } from './pages/Topic';
import { QuizIntro } from './pages/QuizIntro';
import { Quiz } from './pages/Quiz';
import { Result } from './pages/Result';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import type { QuestionPublic } from './data/questions';
import type { QuizStartResponse, QuizSubmitResponse } from './lib/api';

export default function App() {
  const [session, setSession] = useState<QuizStartResponse | null>(null);
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);
  const [pickedQuestions, setPickedQuestions] = useState<QuestionPublic[] | null>(
    null,
  );

  return (
    <>
      <header className="bg-kjg-primary text-white">
        <div className="mx-auto max-w-screen-sm px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold">
            KjG-Hygieneschulung
          </Link>
          <Link to="/admin" className="text-xs underline opacity-80">
            Admin
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-screen-sm px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/topics/:id" element={<Topic />} />
          <Route
            path="/quiz/start"
            element={
              <QuizIntro
                onSessionStarted={(payload) => {
                  setSession(payload);
                  setResult(null);
                  setPickedQuestions(payload.questions);
                }}
              />
            }
          />
          <Route
            path="/quiz"
            element={
              session ? (
                <Quiz
                  session={session}
                  onSubmitted={(r, qs) => {
                    setResult(r);
                    setPickedQuestions(qs);
                  }}
                  onReset={() => {
                    setSession(null);
                    setResult(null);
                  }}
                />
              ) : (
                <div className="space-y-3">
                  <p>Keine aktive Quiz-Session.</p>
                  <Link to="/quiz/start" className="btn-primary inline-flex">
                    Quiz starten
                  </Link>
                </div>
              )
            }
          />
          <Route
            path="/quiz/result/:attemptId"
            element={<Result result={result} questions={pickedQuestions} />}
          />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>
      <footer className="mx-auto max-w-screen-sm px-4 py-6 text-center text-xs text-slate-500">
        Quelle: BW-Leitfaden Januar 2025, Ministerium fuer Laendlichen Raum und
        Verbraucherschutz Baden-Wuerttemberg.
      </footer>
    </>
  );
}
