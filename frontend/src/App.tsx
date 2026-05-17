import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Topic } from './pages/Topic';
import { QuizIntro } from './pages/QuizIntro';
import { Quiz } from './pages/Quiz';
import { Result } from './pages/Result';
import { Certificate } from './pages/Certificate';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { Verify } from './pages/Verify';
import type { QuestionPublic } from './data/questions';
import type { QuizStartResponse, QuizSubmitResponse } from './lib/api';

interface User {
  firstName: string;
  lastName: string;
  email?: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<QuizStartResponse | null>(null);
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);
  const [pickedQuestions, setPickedQuestions] = useState<QuestionPublic[] | null>(
    null,
  );

  function reset() {
    setUser(null);
    setSession(null);
    setResult(null);
    setPickedQuestions(null);
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/start"
        element={
          <QuizIntro
            initial={user ?? undefined}
            onSaveName={(n) => {
              setUser(n);
              setSession(null);
              setResult(null);
            }}
          />
        }
      />
      <Route path="/learn/:id" element={<Topic />} />
      <Route
        path="/quiz"
        element={
          <Quiz
            user={user}
            session={session}
            onSessionStarted={(s) => {
              setSession(s);
              setPickedQuestions(s.questions);
            }}
            onSubmitted={(r, qs) => {
              setResult(r);
              setPickedQuestions(qs);
            }}
            onReset={reset}
          />
        }
      />
      <Route
        path="/quiz/result/:attemptId"
        element={
          <Result result={result} questions={pickedQuestions} onReset={reset} />
        }
      />
      <Route
        path="/quiz/certificate/:attemptId"
        element={<Certificate user={user} result={result} onReset={reset} />}
      />
      <Route path="/verify/:hash" element={<Verify />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}
