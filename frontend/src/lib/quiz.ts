/**
 * Quiz-Logik für die KjG-Hygieneschulung.
 *
 * Server-seitig wird gescort: `correctIndex` darf das Frontend nicht erreichen.
 * Diese Datei wird in beiden Seiten genutzt (Frontend für die UI-Helfer wie
 * shuffleArray; Backend kopiert die `Question`-Typen via Import-Pfad
 * oder Code-Duplikat -- siehe Backend-Implementierung).
 */

import type { Question } from '../data/questions';

/** Pool-Groesse: 20 Fragen. */
export const POOL_SIZE = 20;

/** Anzahl der pro Quiz gezogenen Fragen. */
export const DRAW_COUNT = 10;

/**
 * Schwelle zum Bestehen.
 *
 * User-Spec: "ab 80 % bei 10 Fragen" (Klarstellung 2026-05-17).
 * 8 / 10 = exakt 80 % reicht zum Bestehen.
 */
export const PASS_MIN_CORRECT = 8;

/** Injectable RNG, defaults to Math.random. */
export type Rng = () => number;

/** Fisher-Yates in-place shuffle (returns the same array reference). */
export function shuffleArray<T>(arr: T[], rng: Rng = Math.random): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Deterministic PRNG (mulberry32) — for tests. */
export function seededRng(seed: number): Rng {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Pick {@link DRAW_COUNT} questions from `pool` such that
 *  - every distinct sectionId from the pool appears at least once,
 *    guaranteed by drawing one `quality:'core'` question per section first,
 *  - the remaining slots are filled uniformly at random from the leftover pool,
 *  - no duplicates.
 *
 * Throws if any section lacks a `core` question or if the pool is too small.
 */
export function pickStratified(
  pool: Question[],
  drawCount: number = DRAW_COUNT,
  rng: Rng = Math.random,
): Question[] {
  const sectionIds = Array.from(new Set(pool.map((q) => q.sectionId))).sort(
    (a, b) => a - b,
  );

  if (drawCount < sectionIds.length) {
    throw new Error(
      `drawCount ${drawCount} is smaller than section count ${sectionIds.length}; cannot guarantee coverage`,
    );
  }
  if (drawCount > pool.length) {
    throw new Error(`drawCount ${drawCount} exceeds pool size ${pool.length}`);
  }

  const picked: Question[] = [];
  const pickedIds = new Set<number>();

  // Step 1: one core question per section.
  for (const sid of sectionIds) {
    const cores = pool.filter((q) => q.sectionId === sid && q.quality === 'core');
    if (cores.length === 0) {
      throw new Error(`section ${sid} has no core question`);
    }
    const shuffled = shuffleArray([...cores], rng);
    const choice = shuffled[0];
    picked.push(choice);
    pickedIds.add(choice.id);
  }

  // Step 2: fill remaining slots from the leftover pool, uniformly at random.
  const leftover = pool.filter((q) => !pickedIds.has(q.id));
  shuffleArray(leftover, rng);
  for (const q of leftover) {
    if (picked.length >= drawCount) break;
    picked.push(q);
    pickedIds.add(q.id);
  }

  // Final shuffle so the "guaranteed" picks aren't always first.
  return shuffleArray(picked, rng);
}

export interface ScoreResult {
  correctCount: number;
  totalCount: number;
  passed: boolean;
}

/**
 * Score a set of answers against the picked questions.
 * `answers[i]` is the option-index the user selected for `questions[i]`,
 * or -1 / undefined for "no answer".
 */
export function scoreAnswers(
  questions: Question[],
  answers: ReadonlyArray<number | null | undefined>,
): ScoreResult {
  let correctCount = 0;
  for (let i = 0; i < questions.length; i++) {
    const a = answers[i];
    if (typeof a === 'number' && a === questions[i].correctIndex) {
      correctCount += 1;
    }
  }
  const totalCount = questions.length;
  return {
    correctCount,
    totalCount,
    passed: correctCount >= PASS_MIN_CORRECT,
  };
}

/** Normalise a name for cooldown/lookup keys. */
export function normaliseName(first: string, last: string): string {
  return `${first.trim().toLowerCase()}|${last.trim().toLowerCase()}`;
}
