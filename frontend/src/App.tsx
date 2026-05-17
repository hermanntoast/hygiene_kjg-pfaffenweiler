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
import { ScrollToTop } from './components/ScrollToTop';
import type { QuestionPublic } from './data/questions';
import type { QuizStartResponse, QuizSubmitResponse } from './lib/api';

interface User {
  firstName: string;
  lastName: string;
  email?: string;
}

const PROFILE_KEY = 'kjg.userProfile';

function loadProfile(): User | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<User>;
    if (
      typeof parsed.firstName === 'string' &&
      typeof parsed.lastName === 'string' &&
      parsed.firstName.trim() &&
      parsed.lastName.trim()
    ) {
      return {
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        email: typeof parsed.email === 'string' ? parsed.email : undefined,
      };
    }
  } catch {
    // ignore — clear bad entry
    try {
      localStorage.removeItem(PROFILE_KEY);
    } catch {
      /* noop */
    }
  }
  return null;
}

function saveProfile(user: User | null): void {
  if (typeof localStorage === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(PROFILE_KEY);
    }
  } catch {
    /* noop */
  }
}

export default function App() {
  const [user, setUserState] = useState<User | null>(loadProfile);
  const [session, setSession] = useState<QuizStartResponse | null>(null);
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);
  const [pickedQuestions, setPickedQuestions] = useState<QuestionPublic[] | null>(
    null,
  );

  const setUser = (u: User | null) => {
    setUserState(u);
    saveProfile(u);
  };

  function reset() {
    setSession(null);
    setResult(null);
    setPickedQuestions(null);
    // Wichtig: Name/E-Mail NICHT zurücksetzen — bleibt im localStorage.
  }

  return (
    <>
      <ScrollToTop />
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
    </>
  );
}
