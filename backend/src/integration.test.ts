/**
 * Integrations-Tests für die KjG-Hygieneschulung API.
 *
 * Deckt die Acceptance-Kriterien aus US-009 ab:
 * - Happy Path: Quiz starten -> 10/10 richtig -> Pass + Zertifikat + Admin sieht es
 * - Session Expired -> 409
 * - Token Replay nach Consume -> 409
 * - Cooldown -> 429
 * - Verify-Hash zeigt nur Initialen + Datum, kein voller Name
 */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import bcrypt from 'bcryptjs';
import request from 'supertest';

const tmpDir = mkdtempSync(join(tmpdir(), 'kjg-test-'));
const dbPath = join(tmpDir, 'test.sqlite');

process.env.DB_PATH = dbPath;
process.env.COOKIE_SECRET = 'integrationtest-32-bytes-randomvalueAAAAAA';
process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync('integration-test-pw', 4);
process.env.NODE_ENV = 'test';

// Imports MUST come after env setup so the modules pick up the test env.
const { createApp } = await import('./server.ts');
const { getDb, _resetDbForTests } = await import('./db.ts');
const { getQuestions } = await import('./questions.ts');

let app: ReturnType<typeof createApp>;

beforeAll(() => {
  app = createApp();
});

beforeEach(() => {
  // Fresh DB for each test.
  _resetDbForTests();
  const db = getDb();
  db.exec('DELETE FROM attempts; DELETE FROM quiz_sessions;');
});

afterAll(() => {
  _resetDbForTests();
  try {
    rmSync(tmpDir, { recursive: true, force: true });
  } catch {
    // ignore
  }
});

function pickCorrectAnswers(questionIds: number[]): number[] {
  const all = getQuestions();
  return questionIds.map((id) => {
    const q = all.find((x) => x.id === id);
    if (!q) throw new Error(`unknown qid ${id}`);
    return q.correctIndex;
  });
}

describe('Quiz Happy Path', () => {
  it('start -> all-correct submit -> pass + cert + admin can see + verify works', async () => {
    const startRes = await request(app)
      .post('/api/quiz/start')
      .send({ firstName: 'Anna', lastName: 'Helferin' })
      .expect(200);

    expect(startRes.body.questions).toHaveLength(10);
    expect(startRes.body.passMinCorrect).toBe(8);
    // No correctIndex leaked.
    for (const q of startRes.body.questions) {
      expect(q).not.toHaveProperty('correctIndex');
      expect(q).not.toHaveProperty('explanation');
      expect(q).not.toHaveProperty('sourcePage');
    }

    const qids = startRes.body.questions.map((q: { id: number }) => q.id);
    const answers = pickCorrectAnswers(qids);

    const sub = await request(app)
      .post('/api/quiz/submit')
      .send({ token: startRes.body.token, answers })
      .expect(200);

    expect(sub.body.correctCount).toBe(10);
    expect(sub.body.passed).toBe(true);
    expect(sub.body.certificateUrl).toMatch(/\/api\/attempts\/\d+\/certificate\.pdf\?hash=[0-9a-f]{64}/);
    const hash = sub.body.certificateUrl.match(/hash=([0-9a-f]{64})/)![1];

    // Cert download
    const cert = await request(app)
      .get(`/api/attempts/${sub.body.attemptId}/certificate.pdf?hash=${hash}`)
      .expect(200);
    expect(cert.headers['content-type']).toContain('application/pdf');

    // Verify by hash — public, only initials + date, no full name
    const ver = await request(app).get(`/api/verify/${hash}`).expect(200);
    expect(ver.body.initials).toBe('A. H.');
    expect(ver.body.status).toBe('bestanden');
    expect(ver.body.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // No leak of full name in verify response
    expect(JSON.stringify(ver.body)).not.toContain('Anna');
    expect(JSON.stringify(ver.body)).not.toContain('Helferin');

    // Admin can see the attempt
    const agent = request.agent(app);
    await agent
      .post('/api/admin/login')
      .send({ password: 'integration-test-pw' })
      .expect(200);
    const list = await agent.get('/api/admin/attempts').expect(200);
    expect(list.body.attempts).toHaveLength(1);
    expect(list.body.attempts[0].first_name).toBe('Anna');
    expect(list.body.attempts[0].passed).toBe(1);
    expect(list.body.attempts[0].certificate_hash).toBe(hash);
  });

  it('failed quiz (all-wrong) returns details with explanations + no certificate', async () => {
    const start = await request(app)
      .post('/api/quiz/start')
      .send({ firstName: 'Bob', lastName: 'Lerner' })
      .expect(200);

    // Always answer wrong: pick option (correctIndex + 1) % 4
    const all = getQuestions();
    const wrong = (start.body.questions as Array<{ id: number }>).map((q) => {
      const def = all.find((x) => x.id === q.id)!;
      return (def.correctIndex + 1) % 4;
    });
    const sub = await request(app)
      .post('/api/quiz/submit')
      .send({ token: start.body.token, answers: wrong })
      .expect(200);

    expect(sub.body.correctCount).toBe(0);
    expect(sub.body.passed).toBe(false);
    expect(sub.body.certificateUrl).toBeUndefined();
    expect(sub.body.details).toHaveLength(10);
    for (const d of sub.body.details) {
      expect(d.isCorrect).toBe(false);
      expect(d.explanation).toBeTruthy();
      expect(d.sourcePage).toBeTruthy();
    }
  });
});

describe('Negative path: token replay', () => {
  it('second submit with the same token returns 409 already_consumed', async () => {
    const start = await request(app)
      .post('/api/quiz/start')
      .send({ firstName: 'Carla', lastName: 'Replay' })
      .expect(200);
    const answers = pickCorrectAnswers(
      (start.body.questions as Array<{ id: number }>).map((q) => q.id),
    );

    await request(app)
      .post('/api/quiz/submit')
      .send({ token: start.body.token, answers })
      .expect(200);

    const replay = await request(app)
      .post('/api/quiz/submit')
      .send({ token: start.body.token, answers })
      .expect(409);
    expect(replay.body.error).toBe('already_consumed');
  });
});

describe('Negative path: session expired', () => {
  it('submit after expires_at returns 409 session_expired', async () => {
    const start = await request(app)
      .post('/api/quiz/start')
      .send({ firstName: 'Dana', lastName: 'Slow' })
      .expect(200);
    // Force expiry in the past.
    getDb()
      .prepare(`UPDATE quiz_sessions SET expires_at = ? WHERE token = ?`)
      .run('2000-01-01 00:00:00.000', start.body.token);
    const answers = pickCorrectAnswers(
      (start.body.questions as Array<{ id: number }>).map((q) => q.id),
    );
    const sub = await request(app)
      .post('/api/quiz/submit')
      .send({ token: start.body.token, answers })
      .expect(409);
    expect(sub.body.error).toBe('session_expired');
  });
});

describe('Negative path: cooldown', () => {
  it('two starts with the same normalised name within 60s returns 429', async () => {
    await request(app)
      .post('/api/quiz/start')
      .send({ firstName: 'Eli', lastName: 'Fast' })
      .expect(200);

    const second = await request(app)
      .post('/api/quiz/start')
      .send({ firstName: '  ELI  ', lastName: 'fast' }) // normalises to same key
      .expect(429);
    expect(second.body.error).toBe('cooldown');
    expect(second.body.retryAfterSeconds).toBeGreaterThan(0);
  });
});

describe('Negative path: verify-by-hash bogus + 404', () => {
  it('verify returns 404 for an unknown but well-formed hash', async () => {
    const res = await request(app)
      .get('/api/verify/' + '0'.repeat(64))
      .expect(404);
    expect(res.body.error).toBe('not_found');
  });

  it('verify returns 400 for a malformed hash', async () => {
    await request(app).get('/api/verify/not-a-hash').expect(400);
  });
});

describe('Admin auth', () => {
  it('requires correct password and cookie for admin routes', async () => {
    await request(app).get('/api/admin/attempts').expect(401);

    await request(app)
      .post('/api/admin/login')
      .send({ password: 'wrong' })
      .expect(401);
  });

  it('logout clears the session', async () => {
    const agent = request.agent(app);
    await agent
      .post('/api/admin/login')
      .send({ password: 'integration-test-pw' })
      .expect(200);
    await agent.get('/api/admin/me').expect(200);
    await agent.post('/api/admin/logout').expect(200);
    await agent.get('/api/admin/me').expect(401);
  });
});
