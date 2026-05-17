# Plan: Hygieneschulung KjG-Pfaffenweiler — Mobile React Web-App

**Erstellt:** 2026-05-17
**Status:** APPROVED (Ralplan-Konsens: Planner → Architect → Critic, 2 Iterationen)
**Auftraggeber:** KjG-Pfaffenweiler e.V. — Dorffest 20.–21.06.2026
**Sortiment am Stand:** Burger, Pommes, Getränke. Manuelles Spülen am Stand. Kühlschrank + Gefrierer vorhanden.

---

## 1. Ziel

Eine kleine, mobiloptimierte React-Webseite, mit der ehrenamtliche KjG-Helfer eine Hygieneschulung online absolvieren können. Sie lesen Themenzusammenfassungen, beantworten 10 zufällig gezogene Fragen aus einem Pool von 20, bestehen ab 80 % Trefferquote (= **≥ 8 / 10**), erhalten ein PDF-Zertifikat, und der Admin (Vorstand) sieht alle Ergebnisse und Zertifikate in einem Dashboard.

---

## 2. Architecture Decision Record (ADR)

### Decision
**Option A**: React-SPA + Node/Express-Backend + SQLite, als **Single-Binary-Deployment** (Express servt gebautes `dist/` plus `/api/*`). Server-seitiges Quiz-Scoring, server-seitige PDF-Zertifikatsgenerierung, self-hosted.

### Drivers
1. **Admin-Persistenz erforderlich** — Ergebnisse und Zertifikate müssen zentral, dauerhaft und manipulationssicher gespeichert werden → reines LocalStorage / Static-Hosting scheidet aus.
2. **Klein, ehrenamtlich, datenschutzfreundlich** — minimale Personendaten, kein Cloud-Drittanbieter, DSGVO ohne Auftragsverarbeitungsvertrag.
3. **Kollegen-Summary lückenhaft** — der KjG-Hygieneplan deckt Kennzeichnung/Allergene, Temperaturen-Tabelle, Verkaufsstand, Trinkwasser, Rauchverbot, rohe-Eier-Regel und Wohltätigkeitsausnahme **nicht** ab; das Plan-Set holt diese aus dem BW-Leitfaden nach.
4. **Sortiment-Spezifika** (Burger = Hackfleisch, Pommes = Fritteuse ≤ 175 °C, Getränke + Eis, Spülen am Stand) gehören zwingend in Inhalt und Fragenpool.

### Alternatives considered

| Option | Verworfen weil |
|---|---|
| B — Static-SPA + Supabase / Firebase | DSGVO / AVV-Overhead, Vendor-Lock-in, Drittland-Risiko (Firebase US). SDK-Overhead für kleine App. |
| C — Static-SPA + Formspree / Google Form + LocalStorage | Kein server-seitiges Scoring → User kann „bestanden" im Frontend setzen und Zertifikat fälschen → Beleg-Charakter futsch. SMTP-Server für E-Mail-Versand doch wieder nötig. |

### Why chosen
Die Anforderung „Ergebnis und Zertifikat wird für den Admin gespeichert" + Beleg-Charakter gegenüber Behörden zwingt zu **server-seitigem Scoring + server-seitigem PDF-Render**. Self-Hosting löst DSGVO/AVV-Frage trivial. Single-Binary (Express servt SPA + API) hält die Wartungslast für einen einzelnen ehrenamtlichen Maintainer bei einem systemd-Unit. SQLite als BLOB-Storage für ~20 Zertifikate/Jahr ist überlegen (atomare Backups via Datei-Kopie).

### Consequences
- **Positiv**: Volle Datenhoheit; Forgery-frei (Antworten + Score + PDF nur serverseitig); ein Prozess / ein Port / ein Backup; einfacher Hand-Over (nur Zugangsdaten + Backup-Pfad teilen).
- **Negativ**: Node-/SQLite-/Reverse-Proxy-Wartung liegt beim Maintainer; bei Maintainer-Wechsel ist Hand-Over nötig (README-Sektion „Wartungsmodell + Bus-Faktor" adressiert das).
- **Aufwand**: 5–8 Personentage für v1 inkl. Tests + Doku.

### Follow-ups
- Florian Straub als Fachprüfer für `questions.ts` vor Go-Live einbinden.
- Backup-Restore-Test produktiv durchführen.
- v2: ggf. Fragen-Editor im Admin, Versand des Zertifikat-Links per E-Mail an Helfer.

---

## 3. Tech-Stack

**Frontend**: Vite + React 18 + TypeScript + Tailwind CSS + React Router. Build → `frontend/dist/`.
**Backend**: Node.js (LTS) + Express + better-sqlite3 + Zod + bcrypt + cookie-session + express-rate-limit + pdf-lib. Express servt `dist/` statisch + `/api/*`.
**Tests**: Vitest (Unit), Playwright (1 E2E-Happy-Path).
**Deploy**: Dockerfile + docker-compose.yml; Volume-Mount für SQLite-Datei.

```
hygieneschulung-kjg/
├── frontend/  React+Vite+TS+Tailwind
│   ├── src/{pages,components,data,lib}/
│   └── vite.config.ts  (proxy /api → :3000 in dev)
├── backend/  Express+TS+SQLite
│   ├── src/{server,db,routes,auth,pdf,cron}.ts
│   └── data/  (gitignored: app.sqlite)
├── docker-compose.yml
├── .env.example
└── README.md  inkl. Wartungsmodell + Bus-Faktor
```

---

## 4. Datenmodell

```sql
CREATE TABLE quiz_sessions (
  token         TEXT PRIMARY KEY,         -- crypto.randomBytes(32).base64url
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  question_ids  TEXT NOT NULL,            -- JSON array
  started_at    TEXT NOT NULL,
  expires_at    TEXT NOT NULL,            -- started_at + 30 min
  consumed_at   TEXT                       -- single-use
);

CREATE TABLE attempts (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name        TEXT NOT NULL,
  last_name         TEXT NOT NULL,
  email             TEXT,                  -- optional
  question_ids      TEXT NOT NULL,
  answers           TEXT NOT NULL,         -- JSON array
  correct_count     INTEGER NOT NULL,
  total_count       INTEGER NOT NULL DEFAULT 10,
  passed            INTEGER NOT NULL,      -- 0|1
  certificate_pdf   BLOB,                  -- nur bei passed=1
  certificate_hash  TEXT,                  -- sha256, hex
  created_at        TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attempts_created  ON attempts(created_at);
CREATE INDEX idx_attempts_name     ON attempts(LOWER(TRIM(first_name)), LOWER(TRIM(last_name)));
```

---

## 5. Themen (8 Sektionen, BW-quellenbelegt)

| # | Sektion | BW-Quelle | Sortiment-Bezug |
|---|---|---|---|
| 1 | Personalhygiene & Handhygiene (inkl. **Rauchverbot**) | S. 13 | alle |
| 2 | Verkaufsstand & Ausstattung (inkl. **Trinkwasser, Eis aus Trinkwasser**) | S. 5–6 | Getränke |
| 3 | Lagerung & Kühlkette + **Tabelle 2** (4 °C / 7 °C / 10 °C / −18 °C) | S. 8–9 | Burger-Hackfleisch, TK-Pommes |
| 4 | Zubereitung + **Hackfleisch durcherhitzt** + **Fritteuse ≤ 175 °C** + Kreuzkontamination | S. 8, 10 | Burger, Pommes |
| 5 | Ausgabe & verzehrfertige Lebensmittel (kein Handkontakt, Zangen) | S. 8 | Burger |
| 6 | Getränke & Eis (sauberes Zapfanlagen, Eis nicht mit Hand) | S. 10 | Getränke |
| 7 | Kennzeichnung & Allergene + **Wohltätigkeitsausnahme** | S. 11–12 | alle, rechtl. Pointe |
| 8 | Reinigung, Abfall, Schädlinge + **Zwei-Becken-Spülverfahren** | S. 5–7 | Spülen am Stand |

Jede Sektion = eine eigene Seite mit max. 1 Bildschirm Mobile-Inhalt + „Weiter / Quiz starten". Auf der Übersichts-/Startseite Liste aller 8 Sektionen mit Fortschrittsanzeige (gelesen ✓).

---

## 6. Quiz-Logik

```ts
// frontend/src/lib/quiz.ts
export const POOL_SIZE = 20;
export const DRAW_COUNT = 10;
export const PASS_MIN_CORRECT = 8; // User-Spec: "ab 80% bei 10 Fragen" (User-Klarstellung 2026-05-17)
                                   // 8/10 = exakt 80% reicht zum Bestehen.

// Pool-Verteilung:
//   8 Sektionen, je ≥1 Frage mit quality:"core"
//   dichte Sektionen (3,4,7,8): 3 Fragen (1 core + 2 extension)
//   dünne Sektionen (1,2,5,6):  2 Fragen (2 core)
//   Summe: 4×3 + 4×2 = 20 ✓
```

**Ziehung** (`pickStratified`): 1 `core` pro Sektion (=8) + 2 zufällig aus verbleibendem Pool. Token + question_ids serverseitig persistiert (`quiz_sessions`). Antwortoptionen + Frage-Reihenfolge clientseitig shuffled.

**Server-side Scoring** ist Pflicht — `correctIndex` verlässt niemals den Server.

**Sicherheitsmechanismen**:
- Session-Token kryptographisch: `crypto.randomBytes(32).toString('base64url')`.
- Session-Expiry 30 min → `409 session_expired` → Neustart-Modal.
- Single-use via `consumed_at` → Replay → `409 already_consumed`.
- Cooldown 60 s zwischen Start-Calls für selben (normalisierten) Namen → `429`.

**Lernmodus committed**: Ergebnisscreen zeigt alle 10 Fragen mit User-Antwort, korrekter Antwort, BW-Seitenangabe + 1-Satz-Begründung. Bei <50 % in einer Sektion: prominente Empfehlung „Sektion X nochmal lesen". Schulung = Lern- und Belegnachweis, kein Klausurmodus.

---

## 7. Zertifikat

**Render-Ort**: Backend mit `pdf-lib`.
**Inhalt**: KjG-Logo-Placeholder, Titel „Zertifikat — Hygieneschulung KjG-Pfaffenweiler e.V.", voller Name, Ausstellungsdatum, Score („10 / 10 Fragen korrekt"), Geltungsbezug („Lebensmittelhygiene gem. BW-Leitfaden Ministerium für Ländlichen Raum, Jan 2025 / Dorffest Pfaffenweiler 2026"), Unterschriftszeile + Hash im Fußteil.

**Verifikation**: `certificate_hash = sha256(attemptId + first_name + last_name + correct_count + issuedAt)`, hex.
**Verify-Route** `GET /api/verify/:hash` (öffentlich, Rate-Limit 10/min/IP): Response `{ initials: "F. S.", date: "2026-05-17", status: "bestanden" }`. Voller Name nur via Admin-Login. Datenschutzhinweis vor Quizstart erwähnt explizit, dass Initialen + Datum öffentlich verifizierbar sind.

---

## 8. API-Endpunkte

| Methode | Pfad | Auth | Zweck |
|---|---|---|---|
| POST | `/api/quiz/start` | none | Name → 10 Fragen ohne `correctIndex` + Session-Token. Cooldown 60 s. |
| POST | `/api/quiz/submit` | Session-Token | Antworten → Score, Pass/Fail, ggf. Cert-Download-URL. Single-use. |
| GET | `/api/attempts/:id/certificate.pdf` | öffentlich, mit `?hash=`-Param | PDF-Download (Hash muss matchen). |
| GET | `/api/verify/:hash` | rate-limited | Verify (Initialen + Datum + Status). |
| POST | `/api/admin/login` | rate-limited | Passwort → Cookie. |
| POST | `/api/admin/logout` | Cookie | Cookie löschen. |
| GET | `/api/admin/attempts` | Cookie | Liste aller Versuche (Tabelle). |
| GET | `/api/admin/attempts.csv` | Cookie | CSV-Export. |
| GET | `/api/admin/attempts/:id/certificate.pdf` | Cookie | PDF-Download (voller Name). |

---

## 9. Admin

- Route `/admin` → Login-Formular (nur Passwort, kein Username — single Admin).
- Passwort = bcrypt-Hash in `.env` (z. B. `ADMIN_PASSWORD_HASH`); `.env.example` enthält Dummy + README-Befehl zur Hash-Erzeugung.
- Cookie: `httpOnly`, `SameSite=Strict`, signiert, 8 h Lebensdauer.
- `express-rate-limit` 5 Versuche / 15 min / IP auf Login.
- Dashboard: Tabelle (Datum, Name, Score, Pass/Fail, Cert-Download-Icon, Verify-Hash-Snippet), Filter nach Pass/Fail + Datum, CSV-Export-Button.

---

## 10. DSGVO

- **Datenkategorien**: Vorname, Nachname, E-Mail (optional), Antworten, Score, Zertifikat-Hash.
- **Aufbewahrung**: **36 Monate** (analog Belehrungspraxis IfSG § 43). Begründung: Beleg gegenüber Lebensmittelüberwachung.
- **Cron-Löschung**: tägliches `DELETE FROM attempts WHERE created_at < datetime('now','-36 months')` (node-cron).
- **Datenschutzhinweis vor Quizstart**: erklärt Datenkategorien, Aufbewahrungsdauer, öffentlich verifizierbare Initialen+Datum, Recht auf vorzeitige Löschung via E-Mail an Admin.

---

## 11. Implementierungsschritte (10)

1. **Repo-Setup**: `frontend/` (Vite-React-TS) + `backend/` (TS + tsx) + Root-`package.json` mit `npm-run-all` (`dev` parallel beide; `build` baut Frontend in `backend/public/`; `start` startet Express).
2. **`frontend/src/data/topics.ts`**: 8 Sektionen, JSDoc je Sektion mit BW-Seitenzahl, Mobile-freundlicher Inhalt (≤ 250 Wörter).
3. **`frontend/src/data/questions.ts`** mit `{ id, section, quality: 'core'|'extension', text, options[4], correctIndex, sourcePage, explanation }`. **Wird vor Go-Live von Florian Straub fachlich freigegeben.** Pool = 20; Verteilung wie oben.
4. **`frontend/src/lib/quiz.ts`** + Vitest-Tests:
   - `pickStratified` (deterministisch via Seed; Test: alle 8 Sektionen vertreten; Test: keine Duplikate zwischen core- und extension-Slots).
   - Schwellwert (Test: 7/10 → fail, 8/10 → pass, 9/10 → pass, 10/10 → pass).
5. **UI / Routing / Mobile-Layout**: Tailwind `max-w-screen-sm`, große Buttons (`min-h-12 min-w-12`), Single-Question-per-Screen, Progress-Bar, Countdown-Timer (passiv).
6. **`backend/src/pdf.ts`** (pdf-lib) + Snapshot-Test (fixed `issuedAt` → byte-stable PDF; Hash-Berechnung deterministisch).
7. **Backend**: Express + better-sqlite3 + Zod + bcrypt + cookie-session + express-rate-limit + node-cron. Endpunkte gemäß Tabelle 8. Cooldown-Key normalisiert: `${first.trim().toLowerCase()}|${last.trim().toLowerCase()}`.
8. **Admin-UI**: Login + Tabelle + Filter + CSV-Export + Cert-Download.
9. **Playwright-E2E** (1 Happy-Path: Start → 10 Fragen bestehen → Cert-Download → Admin-Login → Eintrag sichtbar → Verify-Hash returnt `bestanden`). **Negativtests**: Token-Replay nach Consume → 409; abgelaufene Session → 409; Verify mit bogus Hash → 404; Cooldown < 60 s → 429.
10. **Docker + README**: Dockerfile (multi-stage), docker-compose.yml mit Volume `./data:/app/data`; README-Sektionen: Setup, Build, Deploy, `.env`-Config, **Wartungsmodell + Bus-Faktor**, **Backup-Restore-Test** (`sqlite3 backup.sqlite ".restore" && SELECT COUNT(*) FROM attempts`).

---

## 12. Akzeptanzkriterien (testbar)

- [ ] Mobile-Viewport 375 × 667 ohne horizontales Scrollen; Touch-Targets ≥ 44 px (axe / Lighthouse).
- [ ] Alle 8 Sektionen mit Inhalten aus den BW-Quellseiten verifizierbar (Stichprobe je Sektion).
- [ ] `pickStratified` liefert immer 10 Fragen, ≥ 1 je Sektion, keine Duplikate (Vitest mit fixiertem RNG).
- [ ] ≥ 8 richtig → „Bestanden" + Cert-Download; ≤ 7 → „Nicht bestanden" + Lernmodus-Anzeige; **kein** Cert bei Fail.
- [ ] Session-Expiry 30 min → 409; Frontend-Modal → Neustart-Pfad.
- [ ] Cooldown: 2× `/api/quiz/start` mit gleichem Namen in < 60 s → zweite Anfrage 429.
- [ ] Token-Replay nach `consumed_at` → 409.
- [ ] Admin sieht Eintrag (Name, Score, Pass/Fail, PDF bei Pass).
- [ ] `GET /api/verify/:hash` returnt nur Initialen + Datum + Status; Rate-Limit 10/min/IP greift.
- [ ] Cron-Löschung: simulierter `created_at = vor 37 Monaten` → nach Cron-Run entfernt.
- [ ] Lighthouse Mobile ≥ 90 Performance, ≥ 95 Accessibility.
- [ ] **Florian Sign-off** auf `questions.ts` vor Go-Live (README-Schritt).
- [ ] Backup-Restore-Test produktiv erfolgreich.

---

## 13. Risiken & Mitigationen

| Risiko | Mitigation |
|---|---|
| Schwellwert-Off-by-One (80 %) | Konstante `PASS_MIN_CORRECT = 8` + Vitest 7/8/9/10 |
| Fragenqualität / Quellentreue | BW-Seitenzahl + 1-Satz-Begründung je Frage (JSDoc); Florian-Sign-off |
| Forgery: Client manipuliert Score | Server-side Scoring; Token single-use; Server-PDF mit Hash |
| Admin-Passwort-Leck | nur bcrypt-Hash in `.env`; README erklärt Hash-Erzeugung |
| SQLite-Datenverlust | Volume-Mount + cron `sqlite3 .backup`; dokumentierter Restore-Test |
| DSGVO / Aufbewahrungspflicht | 36 Mon. Cron-Löschung; Hinweis vor Quizstart; Lösch-E-Mail-Adresse |
| Verify-Route-Enumeration / Privacy | Rate-Limit + nur Initialen + Datum öffentlich; Hinweistext erwähnt das |
| Re-Memorisierung bei Retry | Cooldown 60 s + Pool 20/Draw 10 + Antwort-Shuffle; bewusst akzeptiert (Lernziel > Klausurintegrität) |
| Bus-Faktor / Maintainer-Wechsel | README-Sektion „Wartungsmodell + Bus-Faktor" |

---

## 14. Out of Scope für v1

- Multi-Tenant (mehrere KjG-Gruppen).
- Fragen-Editor-UI (Fragen direkt im Code, Redeploy).
- Push- oder E-Mail-Versand des Zertifikats.
- Mehrsprachigkeit.
- Mehrere parallele Veranstaltungen.

---

## 15. Konsens-Historie

- **Rev 1 (Planner)**: 8 Sektionen, Pool 20, Client-PDF. Architect: NEEDS-ADJUSTMENT (7 Punkte: Server-PDF, Server-Scoring, Single-Binary, Stratified, 9. Sektion, Pass-Schwelle, DSGVO).
- **Rev 2 (Planner)**: Architect-Punkte + Sortiment-Kontext (Burger/Pommes/Getränke/Spülen/Kühlung) integriert. Critic: ITERATE (6 Must-Fix: Pool 20 statt 24, DSGVO 36 Mon., Schwelle dokumentieren, Rauchverbot Sektion 1, Session-Expiry-Verhalten, Retry-Policy).
- **Rev 3 (Planner)**: Critic-Must-Fix integriert. Architect re-Review: NEEDS-ADJUSTMENT (4 Minors: core/filler-Tag, Verify-Privacy, Token-Spec, Lernmodus-Commit).
- **Rev 4 (Planner)**: Architect-Minors integriert. **Critic: APPROVE.**
- **Rev 5 (User-Klarstellung)**: Pass-Schwelle auf `PASS_MIN_CORRECT = 8` (= 80 %, 8/10 reicht) geändert — User-Interpretation der ursprünglichen ">80%"-Spec.

---

## 16. Implementierungs-Hinweise (vom Critic, nicht-blockierend)

- JSDoc je Frage mit BW-Seitenzahl + Begründung (Florian-Review-freundlich).
- Cert-Render: Hash deterministisch testen (fixed `issuedAt`).
- Cooldown-Key normalisieren (`trim().toLowerCase()`) — `idx_attempts_name` ist bereits darauf indexiert.
- E2E-Negativtests: Token-Replay, Session-Expiry, Verify-Bogus.
- README-Sektion „Florian-Sign-off vor Go-Live" prominent.

---

**Plan freigegeben für Executor-Handoff.**
