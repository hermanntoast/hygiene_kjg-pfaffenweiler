import { describe, it, expect } from 'vitest';
import { questions } from '../data/questions';
import {
  DRAW_COUNT,
  PASS_MIN_CORRECT,
  POOL_SIZE,
  pickStratified,
  scoreAnswers,
  seededRng,
  normaliseName,
} from './quiz';

describe('constants', () => {
  it('pool has exactly POOL_SIZE questions', () => {
    expect(questions.length).toBe(POOL_SIZE);
  });

  it('pass threshold is 8 (= 80% of 10)', () => {
    expect(PASS_MIN_CORRECT).toBe(8);
  });

  it('draw count is 10', () => {
    expect(DRAW_COUNT).toBe(10);
  });

  it('every section has at least one core question', () => {
    const sections = new Set(questions.map((q) => q.sectionId));
    for (const sid of sections) {
      const cores = questions.filter((q) => q.sectionId === sid && q.quality === 'core');
      expect(cores.length, `section ${sid} core count`).toBeGreaterThanOrEqual(1);
    }
  });

  it('pool covers all 8 sections', () => {
    const sections = new Set(questions.map((q) => q.sectionId));
    expect(sections.size).toBe(8);
    for (let s = 1; s <= 8; s++) {
      expect(sections.has(s)).toBe(true);
    }
  });
});

describe('pickStratified', () => {
  it('returns exactly DRAW_COUNT questions', () => {
    const picked = pickStratified(questions, DRAW_COUNT, seededRng(1));
    expect(picked.length).toBe(DRAW_COUNT);
  });

  it('covers all 8 sections (≥1 question per section)', () => {
    const picked = pickStratified(questions, DRAW_COUNT, seededRng(42));
    const sections = new Set(picked.map((q) => q.sectionId));
    expect(sections.size).toBe(8);
  });

  it('produces no duplicates', () => {
    const picked = pickStratified(questions, DRAW_COUNT, seededRng(99));
    const ids = picked.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is deterministic given a fixed seed', () => {
    const a = pickStratified(questions, DRAW_COUNT, seededRng(1234)).map((q) => q.id);
    const b = pickStratified(questions, DRAW_COUNT, seededRng(1234)).map((q) => q.id);
    expect(a).toEqual(b);
  });

  it('differs across seeds', () => {
    const a = pickStratified(questions, DRAW_COUNT, seededRng(1)).map((q) => q.id);
    const b = pickStratified(questions, DRAW_COUNT, seededRng(2)).map((q) => q.id);
    expect(a).not.toEqual(b);
  });

  it('throws when pool is too small', () => {
    const tiny = questions.slice(0, 3);
    expect(() => pickStratified(tiny, DRAW_COUNT, seededRng(1))).toThrow();
  });

  it('over 100 different seeds always covers all sections and has no duplicates', () => {
    for (let seed = 0; seed < 100; seed++) {
      const picked = pickStratified(questions, DRAW_COUNT, seededRng(seed));
      const sections = new Set(picked.map((q) => q.sectionId));
      const ids = picked.map((q) => q.id);
      expect(sections.size, `seed ${seed} section coverage`).toBe(8);
      expect(new Set(ids).size, `seed ${seed} dup-check`).toBe(ids.length);
      expect(picked.length, `seed ${seed} length`).toBe(DRAW_COUNT);
    }
  });
});

describe('scoreAnswers — Schwellwert (User-Spec ab 80 %)', () => {
  const ten = questions.slice(0, 10);
  const correctIdxs = ten.map((q) => q.correctIndex);

  function answers(numCorrect: number): number[] {
    const out: number[] = [];
    for (let i = 0; i < ten.length; i++) {
      if (i < numCorrect) {
        out.push(correctIdxs[i]);
      } else {
        out.push((correctIdxs[i] + 1) % 4); // deterministic wrong answer
      }
    }
    return out;
  }

  it('0/10 → fail', () => {
    expect(scoreAnswers(ten, answers(0)).passed).toBe(false);
  });

  it('7/10 → fail (just under threshold)', () => {
    const r = scoreAnswers(ten, answers(7));
    expect(r.correctCount).toBe(7);
    expect(r.passed).toBe(false);
  });

  it('8/10 → pass (exactly threshold = 80 %)', () => {
    const r = scoreAnswers(ten, answers(8));
    expect(r.correctCount).toBe(8);
    expect(r.passed).toBe(true);
  });

  it('9/10 → pass', () => {
    const r = scoreAnswers(ten, answers(9));
    expect(r.correctCount).toBe(9);
    expect(r.passed).toBe(true);
  });

  it('10/10 → pass', () => {
    const r = scoreAnswers(ten, answers(10));
    expect(r.correctCount).toBe(10);
    expect(r.passed).toBe(true);
  });

  it('ignores null / undefined as wrong', () => {
    const a: Array<number | null | undefined> = [];
    for (let i = 0; i < ten.length; i++) a.push(null);
    expect(scoreAnswers(ten, a).correctCount).toBe(0);
  });
});

describe('normaliseName', () => {
  it('trims and lowercases', () => {
    expect(normaliseName('  Max ', 'MUSTERMANN  ')).toBe('max|mustermann');
  });

  it('treats different casing as same key', () => {
    expect(normaliseName('Max', 'Mustermann')).toBe(normaliseName('MAX', 'mustermann'));
  });
});
