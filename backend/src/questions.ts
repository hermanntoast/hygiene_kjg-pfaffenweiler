/**
 * Server-seitige Spiegelung der Fragenpool-Daten.
 *
 * Wir koennten via tsconfig-Pfad das Frontend-Modul re-exportieren, aber
 * Backend und Frontend werden unabhaengig gebuildet (zwei tsconfigs / npm-Workspaces).
 * Eine schmale Spiegelung ist hier robuster und macht das Datenmodell explizit.
 *
 * SYNCHRONIZATION: Bei jeder Aenderung an frontend/src/data/questions.ts diese
 * Datei mit dem gleichen Inhalt aktualisieren. Tests in backend/src/questions.test.ts
 * (siehe US-009) sichern dies ab.
 */

export type QuestionQuality = 'core' | 'extension';

export interface Question {
  id: number;
  sectionId: number;
  quality: QuestionQuality;
  text: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  sourcePage: string;
  explanation: string;
}

export interface QuestionPublic {
  id: number;
  sectionId: number;
  text: string;
  options: [string, string, string, string];
}

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

/**
 * Load questions from the frontend source file at runtime to avoid duplication.
 * Parses the static export with a tiny regex/eval-free scan: we expect each
 * Question literal to look identical to the TypeScript source.
 *
 * Falls die Datei nicht gefunden wird (z. B. in Docker-Image), wird ein Fehler
 * geworfen -- die Frontend-Quelldatei MUSS verfuegbar sein.
 */
function loadFromFrontend(): Question[] {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    resolve(here, '../../frontend/src/data/questions.ts'),
    resolve(here, '../public/questions.json'),
    resolve(process.cwd(), 'frontend/src/data/questions.ts'),
  ];
  for (const p of candidates) {
    try {
      const raw = readFileSync(p, 'utf8');
      if (p.endsWith('.json')) {
        return JSON.parse(raw) as Question[];
      }
      const parsed = parseQuestionsTs(raw);
      if (parsed.length > 0) return parsed;
    } catch {
      // try next candidate
    }
  }
  throw new Error(
    'Could not load questions.ts — checked: ' + candidates.join(', '),
  );
}

/**
 * Why not `import` the frontend file? It belongs to a separate tsconfig
 * project; importing across would require a shared tsconfig and entangle
 * the build graph. The parser keeps the boundary clean.
 */
function parseQuestionsTs(src: string): Question[] {
  const arrStart = src.indexOf('export const questions');
  if (arrStart < 0) return [];
  // Skip past the type annotation: `: Question[] = `. We want the array literal
  // that starts AFTER the `=` sign, not the `[` inside `Question[]`.
  const eq = src.indexOf('=', arrStart);
  if (eq < 0) return [];
  const open = src.indexOf('[', eq);
  if (open < 0) return [];
  // Find matching ']' considering nested brackets and strings.
  let depth = 0;
  let inStr: string | null = null;
  let esc = false;
  let close = -1;
  for (let i = open; i < src.length; i++) {
    const ch = src[i];
    if (esc) {
      esc = false;
      continue;
    }
    if (inStr) {
      if (ch === '\\') {
        esc = true;
      } else if (ch === inStr) {
        inStr = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inStr = ch;
      continue;
    }
    if (ch === '[') depth += 1;
    else if (ch === ']') {
      depth -= 1;
      if (depth === 0) {
        close = i;
        break;
      }
    }
  }
  if (close < 0) return [];
  const arrText = src.slice(open, close + 1);
  // Strip line comments.
  const stripped = arrText.replace(/\/\/[^\n]*/g, '');
  // Use Function ctor in a sandboxed-feeling way: only this file's source is
  // ever passed in, and it is part of our own repo.
  // eslint-disable-next-line no-new-func
  const fn = new Function(`return ${stripped};`);
  const raw = fn() as Question[];
  return raw;
}

let _cached: Question[] | null = null;

export function getQuestions(): Question[] {
  if (!_cached) _cached = loadFromFrontend();
  return _cached;
}

export function getQuestionById(id: number): Question | undefined {
  return getQuestions().find((q) => q.id === id);
}

export function toPublic(q: Question): QuestionPublic {
  return { id: q.id, sectionId: q.sectionId, text: q.text, options: q.options };
}
