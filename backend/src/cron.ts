/**
 * DSGVO-Cron: Löscht Attempts und Quiz-Sessions, die über die
 * Aufbewahrungsfrist hinaus sind (36 Monate für Attempts, 1 Tag für Sessions).
 */

import cron from 'node-cron';
import { getDb } from './db.ts';

const RETENTION_MONTHS = 36;

export function runRetentionDeletion(): {
  attemptsDeleted: number;
  sessionsDeleted: number;
} {
  const db = getDb();
  const att = db
    .prepare(
      `DELETE FROM attempts WHERE created_at < datetime('now', '-${RETENTION_MONTHS} months')`,
    )
    .run();
  // Sessions are short-lived; remove anything expired more than a day ago.
  const sess = db
    .prepare(
      `DELETE FROM quiz_sessions WHERE expires_at < datetime('now', '-1 days')`,
    )
    .run();
  return {
    attemptsDeleted: att.changes,
    sessionsDeleted: sess.changes,
  };
}

export function scheduleRetentionCron(): void {
  // Jeden Tag um 03:17 Uhr (zufällige Off-Peak-Zeit).
  cron.schedule('17 3 * * *', () => {
    const r = runRetentionDeletion();
    console.log(
      `[cron] retention sweep — attempts: ${r.attemptsDeleted}, sessions: ${r.sessionsDeleted}`,
    );
  });
}
