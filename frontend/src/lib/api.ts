/**
 * Thin fetch wrapper for the KjG-Hygieneschulung backend.
 */

import type { QuestionPublic } from '../data/questions';

export interface QuizStartResponse {
  token: string;
  expiresAt: string;
  drawCount: number;
  passMinCorrect: number;
  questions: QuestionPublic[];
}

export interface QuizSubmitDetail {
  questionId: number;
  userAnswer: number;
  correctIndex: number;
  isCorrect: boolean;
  sourcePage: string;
  explanation: string;
}

export interface QuizSubmitResponse {
  attemptId: number;
  correctCount: number;
  totalCount: number;
  passed: boolean;
  passMinCorrect: number;
  certificateUrl?: string;
  details: QuizSubmitDetail[];
}

export interface AdminAttempt {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  correct_count: number;
  total_count: number;
  passed: 0 | 1;
  certificate_hash: string | null;
  created_at: string;
}

export class ApiError extends Error {
  constructor(public status: number, public payload: unknown) {
    super(`api error ${status}`);
  }
}

async function jsonOrThrow<T>(res: Response): Promise<T> {
  const txt = await res.text();
  let body: unknown = null;
  try {
    body = txt ? JSON.parse(txt) : null;
  } catch {
    // non-JSON response
  }
  if (!res.ok) {
    throw new ApiError(res.status, body);
  }
  return body as T;
}

export async function quizStart(input: {
  firstName: string;
  lastName: string;
  email?: string;
}): Promise<QuizStartResponse> {
  const res = await fetch('/api/quiz/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return jsonOrThrow<QuizStartResponse>(res);
}

export async function quizSubmit(input: {
  token: string;
  answers: number[];
}): Promise<QuizSubmitResponse> {
  const res = await fetch('/api/quiz/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return jsonOrThrow<QuizSubmitResponse>(res);
}

export async function adminLogin(password: string): Promise<{ ok: true }> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
    credentials: 'same-origin',
  });
  return jsonOrThrow(res);
}

export async function adminLogout(): Promise<{ ok: true }> {
  const res = await fetch('/api/admin/logout', {
    method: 'POST',
    credentials: 'same-origin',
  });
  return jsonOrThrow(res);
}

export async function adminMe(): Promise<{ admin: true }> {
  const res = await fetch('/api/admin/me', { credentials: 'same-origin' });
  return jsonOrThrow(res);
}

export async function adminAttempts(): Promise<{ attempts: AdminAttempt[] }> {
  const res = await fetch('/api/admin/attempts', { credentials: 'same-origin' });
  return jsonOrThrow(res);
}
