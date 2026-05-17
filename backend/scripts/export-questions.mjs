#!/usr/bin/env node
/**
 * Liest frontend/src/data/questions.ts, parst die Frage-Daten und schreibt
 * sie als questions.json in backend/public/. Wird im Dockerfile zur
 * Build-Zeit ausgefuehrt, damit der Server zur Laufzeit nicht die TS-Quelle
 * benoetigt.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

const srcPath =
  process.argv[2] ?? path.resolve(here, '../../frontend/src/data/questions.ts');
const outPath = process.argv[3] ?? path.resolve(here, '../public/questions.json');

const src = fs.readFileSync(srcPath, 'utf8');

const exportIdx = src.indexOf('export const questions');
if (exportIdx < 0) {
  console.error('Could not find `export const questions` in', srcPath);
  process.exit(1);
}
const eq = src.indexOf('=', exportIdx);
const open = src.indexOf('[', eq);

let depth = 0;
let inStr = null;
let esc = false;
let close = -1;
for (let i = open; i < src.length; i++) {
  const ch = src[i];
  if (esc) {
    esc = false;
    continue;
  }
  if (inStr) {
    if (ch === '\\') esc = true;
    else if (ch === inStr) inStr = null;
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
if (close < 0) {
  console.error('Could not find matching ] in questions array');
  process.exit(1);
}

const arrText = src.slice(open, close + 1).replace(/\/\/[^\n]*/g, '');
// eslint-disable-next-line no-new-func
const data = new Function(`return ${arrText};`)();

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
console.log(`Wrote ${data.length} questions to ${outPath}`);
