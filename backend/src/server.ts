/**
 * Hygieneschulung KjG-Pfaffenweiler — Express-Server.
 *
 * Single-Binary-Deploy: servt das gebaute Frontend (public/ bzw. ../frontend/dist
 * im Dev-Modus) sowie /api/*.
 */

import express, { type Request, type Response, type NextFunction } from 'express';
import cookieSession from 'cookie-session';
import rateLimit from 'express-rate-limit';
import { randomBytes } from 'node:crypto';
import { existsSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

import { getDb, type SessionRow, type AttemptRow } from './db.ts';
import { getQuestions, toPublic } from './questions.ts';
import { pickStratified, DRAW_COUNT, PASS_MIN_CORRECT, normaliseName } from './quiz-logic.ts';
import { generateCertificate } from './pdf.ts';
import { verifyPassword, requireAdmin, getAdminHash } from './auth.ts';
import { scheduleRetentionCron } from './cron.ts';

const PORT = Number(process.env.PORT ?? 3000);
const COOKIE_SECRET = process.env.COOKIE_SECRET ?? '';
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL ?? '';
const SESSION_TTL_MIN = 30;
const COOLDOWN_SECONDS = 60;

if (!COOKIE_SECRET || COOKIE_SECRET.length < 16) {
  console.warn('[server] WARNING: COOKIE_SECRET is missing or too short.');
}

// ---------- App ----------

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '256kb' }));

  app.use(
    cookieSession({
      name: 'kjg_admin',
      keys: [COOKIE_SECRET || 'dev-only-insecure-secret-please-replace-me'],
      maxAge: 8 * 60 * 60 * 1000, // 8h
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    }),
  );

  // ---------- Quiz-Endpoints ----------

  const startBody = z.object({
    firstName: z.string().min(1).max(60),
    lastName: z.string().min(1).max(60),
    email: z.string().email().max(120).optional(),
  });

  app.post('/api/quiz/start', (req, res) => {
    const parsed = startBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'invalid_input', details: parsed.error.flatten() });
    }
    const { firstName, lastName, email } = parsed.data;
    const db = getDb();
    const key = normaliseName(firstName, lastName);

    // Cooldown: most recent attempt or session for this normalised name.
    const lastSession = db
      .prepare(
        `SELECT started_at FROM quiz_sessions
         WHERE LOWER(TRIM(first_name))||'|'||LOWER(TRIM(last_name)) = ?
         ORDER BY started_at DESC LIMIT 1`,
      )
      .get(key) as { started_at: string } | undefined;
    if (lastSession) {
      const ageS = (Date.now() - new Date(lastSession.started_at + 'Z').getTime()) / 1000;
      if (ageS >= 0 && ageS < COOLDOWN_SECONDS) {
        return res
          .status(429)
          .json({ error: 'cooldown', retryAfterSeconds: Math.ceil(COOLDOWN_SECONDS - ageS) });
      }
    }

    const pool = getQuestions();
    const picked = pickStratified(pool, DRAW_COUNT);
    const questionIds = picked.map((q) => q.id);
    const token = randomBytes(32).toString('base64url');
    const now = new Date();
    const expires = new Date(now.getTime() + SESSION_TTL_MIN * 60 * 1000);

    db.prepare(
      `INSERT INTO quiz_sessions(token, first_name, last_name, email, question_ids,
        started_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      token,
      firstName,
      lastName,
      email ?? null,
      JSON.stringify(questionIds),
      now.toISOString().replace('T', ' ').replace('Z', ''),
      expires.toISOString().replace('T', ' ').replace('Z', ''),
    );

    const publicQuestions = picked.map(toPublic);
    res.json({
      token,
      expiresAt: expires.toISOString(),
      drawCount: DRAW_COUNT,
      passMinCorrect: PASS_MIN_CORRECT,
      questions: publicQuestions,
    });
  });

  const submitBody = z.object({
    token: z.string().min(8),
    answers: z.array(z.number().int().min(-1).max(3)).length(DRAW_COUNT),
  });

  app.post('/api/quiz/submit', async (req, res) => {
    const parsed = submitBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'invalid_input', details: parsed.error.flatten() });
    }
    const { token, answers } = parsed.data;
    const db = getDb();
    const sess = db
      .prepare(`SELECT * FROM quiz_sessions WHERE token = ?`)
      .get(token) as SessionRow | undefined;
    if (!sess) {
      return res.status(404).json({ error: 'session_not_found' });
    }
    if (sess.consumed_at) {
      return res.status(409).json({ error: 'already_consumed' });
    }
    if (new Date(sess.expires_at.replace(' ', 'T') + 'Z').getTime() < Date.now()) {
      return res.status(409).json({ error: 'session_expired' });
    }

    const questionIds = JSON.parse(sess.question_ids) as number[];
    const questions = getQuestions();
    const picked = questionIds
      .map((id) => questions.find((q) => q.id === id))
      .filter((q): q is NonNullable<typeof q> => Boolean(q));

    let correct = 0;
    const details: Array<{
      questionId: number;
      userAnswer: number;
      correctIndex: number;
      isCorrect: boolean;
      sourcePage: string;
      explanation: string;
    }> = [];
    for (let i = 0; i < picked.length; i++) {
      const q = picked[i];
      const a = answers[i];
      const ok = a === q.correctIndex;
      if (ok) correct += 1;
      details.push({
        questionId: q.id,
        userAnswer: a,
        correctIndex: q.correctIndex,
        isCorrect: ok,
        sourcePage: q.sourcePage,
        explanation: q.explanation,
      });
    }
    const passed = correct >= PASS_MIN_CORRECT;

    db.prepare(`UPDATE quiz_sessions SET consumed_at = datetime('now') WHERE token = ?`).run(token);

    const ins = db.prepare(
      `INSERT INTO attempts(first_name, last_name, email, question_ids, answers,
        correct_count, total_count, passed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    const result = ins.run(
      sess.first_name,
      sess.last_name,
      sess.email,
      sess.question_ids,
      JSON.stringify(answers),
      correct,
      picked.length,
      passed ? 1 : 0,
    );
    const attemptId = Number(result.lastInsertRowid);

    let certificateUrl: string | undefined;
    if (passed) {
      const issuedAt = new Date().toISOString();
      const cert = await generateCertificate({
        attemptId,
        firstName: sess.first_name,
        lastName: sess.last_name,
        correctCount: correct,
        totalCount: picked.length,
        issuedAt,
        verifyBaseUrl: PUBLIC_BASE_URL,
      });
      db.prepare(
        `UPDATE attempts SET certificate_pdf = ?, certificate_hash = ? WHERE id = ?`,
      ).run(Buffer.from(cert.pdfBytes), cert.hash, attemptId);
      certificateUrl = `/api/attempts/${attemptId}/certificate.pdf?hash=${cert.hash}`;
    }

    res.json({
      attemptId,
      correctCount: correct,
      totalCount: picked.length,
      passed,
      passMinCorrect: PASS_MIN_CORRECT,
      certificateUrl,
      details,
    });
  });

  // ---------- Helper: PDF aus DB-Daten neu rendern ----------
  //
  // Beim Re-Download (public oder admin) erzeugen wir das PDF jedes Mal frisch
  // mit dem aktuellen Layout, übernehmen aber den gespeicherten Hash exakt —
  // so bleibt der QR-/Verify-Link gültig, und Format-Updates wirken auch auf
  // bestehende Zertifikate.
  async function renderStoredCertificate(id: number): Promise<{
    pdf: Buffer;
    hash: string;
  } | null> {
    type Row = {
      first_name: string;
      last_name: string;
      correct_count: number;
      total_count: number;
      certificate_hash: string | null;
      certificate_pdf: Buffer | null;
      created_at: string;
    };
    const row = getDb()
      .prepare(
        `SELECT first_name, last_name, correct_count, total_count,
                certificate_hash, certificate_pdf, created_at
         FROM attempts WHERE id = ?`,
      )
      .get(id) as Row | undefined;
    if (!row || !row.certificate_hash) return null;

    const issuedAt = row.created_at.includes('T')
      ? row.created_at
      : `${row.created_at.replace(' ', 'T')}Z`;

    try {
      const cert = await generateCertificate({
        attemptId: id,
        firstName: row.first_name,
        lastName: row.last_name,
        correctCount: row.correct_count,
        totalCount: row.total_count,
        issuedAt,
        verifyBaseUrl: PUBLIC_BASE_URL,
        hashOverride: row.certificate_hash,
      });
      return { pdf: Buffer.from(cert.pdfBytes), hash: cert.hash };
    } catch (e) {
      console.error('[renderStoredCertificate]', e);
      // Fallback: gespeicherter PDF-BLOB, falls Re-Render scheitert.
      if (row.certificate_pdf) {
        return { pdf: row.certificate_pdf, hash: row.certificate_hash };
      }
      return null;
    }
  }

  // ---------- Public certificate download ----------

  app.get('/api/attempts/:id/certificate.pdf', async (req, res) => {
    const id = Number(req.params.id);
    const hash = String(req.query.hash ?? '');
    if (!Number.isFinite(id) || hash.length !== 64) {
      return res.status(400).json({ error: 'invalid_request' });
    }
    const row = getDb()
      .prepare(`SELECT certificate_hash FROM attempts WHERE id = ?`)
      .get(id) as { certificate_hash: string | null } | undefined;
    if (!row || row.certificate_hash !== hash) {
      return res.status(404).json({ error: 'not_found' });
    }
    const rendered = await renderStoredCertificate(id);
    if (!rendered) {
      return res.status(404).json({ error: 'not_found' });
    }
    res
      .status(200)
      .set('Content-Type', 'application/pdf')
      .set('Content-Disposition', 'attachment; filename="hygieneschulung-zertifikat.pdf"')
      .set('Cache-Control', 'no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .send(rendered.pdf);
  });

  // ---------- Public verify-by-hash ----------

  const verifyLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'rate_limited' },
  });

  app.get('/api/verify/:hash', verifyLimiter, (req, res) => {
    const hash = String(req.params.hash);
    if (!/^[0-9a-f]{64}$/.test(hash)) {
      return res.status(400).json({ error: 'invalid_hash' });
    }
    const row = getDb()
      .prepare(
        `SELECT first_name, last_name, passed, created_at FROM attempts
         WHERE certificate_hash = ? AND passed = 1`,
      )
      .get(hash) as { first_name: string; last_name: string; passed: number; created_at: string } | undefined;
    if (!row) {
      return res.status(404).json({ error: 'not_found' });
    }
    const initials = `${row.first_name.trim().charAt(0).toUpperCase()}. ${row.last_name.trim().charAt(0).toUpperCase()}.`;
    res.json({
      initials,
      date: row.created_at.slice(0, 10),
      status: 'bestanden',
    });
  });

  // ---------- Admin ----------

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'rate_limited' },
  });

  const loginBody = z.object({ password: z.string().min(1).max(200) });

  app.post('/api/admin/login', loginLimiter, async (req, res) => {
    const parsed = loginBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'invalid_input' });
    }
    // Surface a clear 500 if the hash is unset rather than silently failing.
    try {
      getAdminHash();
    } catch {
      return res.status(500).json({ error: 'admin_not_configured' });
    }
    const ok = await verifyPassword(parsed.data.password);
    if (!ok) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }
    req.session = { admin: true };
    res.json({ ok: true });
  });

  app.post('/api/admin/logout', (req, res) => {
    req.session = null;
    res.json({ ok: true });
  });

  app.get('/api/admin/me', requireAdmin, (_req, res) => {
    res.json({ admin: true });
  });

  app.get('/api/admin/attempts', requireAdmin, (_req, res) => {
    const rows = getDb()
      .prepare(
        `SELECT id, first_name, last_name, email, correct_count, total_count, passed,
         certificate_hash, created_at FROM attempts ORDER BY created_at DESC LIMIT 1000`,
      )
      .all() as Array<Omit<AttemptRow, 'certificate_pdf' | 'question_ids' | 'answers'>>;
    res.json({ attempts: rows });
  });

  app.get('/api/admin/attempts.csv', requireAdmin, (_req, res) => {
    const rows = getDb()
      .prepare(
        `SELECT id, first_name, last_name, email, correct_count, total_count,
         passed, certificate_hash, created_at FROM attempts ORDER BY created_at DESC`,
      )
      .all() as Array<Omit<AttemptRow, 'certificate_pdf' | 'question_ids' | 'answers'>>;
    const header = 'id,first_name,last_name,email,correct,total,passed,hash,created_at\n';
    const body = rows
      .map((r) => {
        const esc = (s: unknown) =>
          s == null
            ? ''
            : `"${String(s).replace(/"/g, '""')}"`;
        return [
          r.id,
          esc(r.first_name),
          esc(r.last_name),
          esc(r.email),
          r.correct_count,
          r.total_count,
          r.passed,
          esc(r.certificate_hash),
          esc(r.created_at),
        ].join(',');
      })
      .join('\n');
    res
      .status(200)
      .set('Content-Type', 'text/csv; charset=utf-8')
      .set('Content-Disposition', 'attachment; filename="attempts.csv"')
      .send(header + body + '\n');
  });

  app.get('/api/admin/attempts/:id/certificate.pdf', requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'invalid_id' });
    }
    const rendered = await renderStoredCertificate(id);
    if (!rendered) {
      return res.status(404).json({ error: 'not_found' });
    }
    res
      .status(200)
      .set('Content-Type', 'application/pdf')
      .set('Content-Disposition', 'attachment; filename="zertifikat.pdf"')
      .set('Cache-Control', 'no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .send(rendered.pdf);
  });

  // ---------- Healthcheck ----------

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', drawCount: DRAW_COUNT, passMinCorrect: PASS_MIN_CORRECT });
  });

  // ---------- Static frontend ----------

  const here = dirname(fileURLToPath(import.meta.url));
  const staticCandidates = [
    resolve(here, '../public'),
    resolve(here, '../../frontend/dist'),
    resolve(process.cwd(), 'public'),
  ];
  const staticDir = staticCandidates.find((p) => existsSync(p) && statSync(p).isDirectory());
  if (staticDir) {
    app.use(express.static(staticDir, { index: 'index.html' }));
    // SPA fallback for client-side routing.
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method !== 'GET') return next();
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(resolve(staticDir, 'index.html'));
    });
  }

  // ---------- Error handler ----------

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[server] unhandled', err);
    if (res.headersSent) return;
    res.status(500).json({ error: 'internal_error' });
  });

  return app;
}

// ---------- Entrypoint ----------

const isMain = (() => {
  try {
    return fileURLToPath(import.meta.url) === resolve(process.argv[1] ?? '');
  } catch {
    return false;
  }
})();

if (isMain) {
  getDb(); // ensure schema migration runs at startup
  scheduleRetentionCron();
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`[server] listening on :${PORT}`);
  });
}
