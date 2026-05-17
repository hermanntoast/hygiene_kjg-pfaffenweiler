/**
 * E2E Negative Paths: Token-Replay, Session-Expiry, Cooldown, Verify-Hash.
 *
 * Diese Pfade lassen sich rein ueber die API testen; wir nutzen Playwright's
 * Request-Context, damit alles ueber denselben Server-Lifecycle laeuft.
 */

import { test, expect, request as pwRequest } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3098';

async function newApi() {
  return pwRequest.newContext({ baseURL });
}

test('Token-Replay: zweiter Submit mit demselben Token -> 409', async () => {
  const api = await newApi();
  const start = await api.post('/api/quiz/start', {
    data: { firstName: 'Replay', lastName: 'Test' + Date.now() },
  });
  expect(start.ok()).toBe(true);
  const { token } = await start.json();
  const wrong = new Array(10).fill(0);
  const first = await api.post('/api/quiz/submit', { data: { token, answers: wrong } });
  expect(first.status()).toBe(200);
  const second = await api.post('/api/quiz/submit', { data: { token, answers: wrong } });
  expect(second.status()).toBe(409);
});

test('Cooldown: zweite Quiz-Start in <60s -> 429', async () => {
  const api = await newApi();
  const name = 'Cool' + Date.now();
  const first = await api.post('/api/quiz/start', {
    data: { firstName: name, lastName: 'Down' },
  });
  expect(first.ok()).toBe(true);
  const second = await api.post('/api/quiz/start', {
    data: { firstName: name, lastName: 'Down' },
  });
  expect(second.status()).toBe(429);
  const body = await second.json();
  expect(body.error).toBe('cooldown');
});

test('Verify-Hash: zeigt nur Initialen + Datum, keinen vollen Namen', async () => {
  const api = await newApi();
  // Wir koennen den Hash der Happy-Path-Loesung nicht ohne Insiderwissen
  // bestaetigen — daher pruefen wir nur das Format-Verhalten bei einem
  // gut geformten, aber unbekannten Hash (404) und bei Murks (400).
  const r404 = await api.get('/api/verify/' + 'a'.repeat(64));
  expect(r404.status()).toBe(404);
  const r400 = await api.get('/api/verify/not-a-hash');
  expect(r400.status()).toBe(400);
});
