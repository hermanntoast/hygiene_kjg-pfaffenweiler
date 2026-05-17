/**
 * Server-seitige Quiz-Logik (Mirror von frontend/src/lib/quiz.ts ohne
 * frontend-spezifische Imports). Bei Aenderungen beide Dateien anpassen.
 */

import type { Question } from './questions.ts';

export const POOL_SIZE = 20;
export const DRAW_COUNT = 10;
export const PASS_MIN_CORRECT = 8;

export type Rng = () => number;

export function shuffleArray<T>(arr: T[], rng: Rng = Math.random): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickStratified(
  pool: Question[],
  drawCount: number = DRAW_COUNT,
  rng: Rng = Math.random,
): Question[] {
  const sectionIds = Array.from(new Set(pool.map((q) => q.sectionId))).sort(
    (a, b) => a - b,
  );
  if (drawCount < sectionIds.length) {
    throw new Error(`drawCount ${drawCount} < sections ${sectionIds.length}`);
  }
  if (drawCount > pool.length) {
    throw new Error(`drawCount ${drawCount} > pool ${pool.length}`);
  }
  const picked: Question[] = [];
  const pickedIds = new Set<number>();
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
  const leftover = pool.filter((q) => !pickedIds.has(q.id));
  shuffleArray(leftover, rng);
  for (const q of leftover) {
    if (picked.length >= drawCount) break;
    picked.push(q);
    pickedIds.add(q.id);
  }
  return shuffleArray(picked, rng);
}

export function normaliseName(first: string, last: string): string {
  return `${first.trim().toLowerCase()}|${last.trim().toLowerCase()}`;
}
