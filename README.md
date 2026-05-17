# Hygieneschulung KjG-Pfaffenweiler e.V.

Mobile-first React-Web-App fuer die Online-Hygieneschulung vor dem **Dorffest 2026**.
Ehrenamtliche KjG-Helfer lesen 8 kurze Themenblocks (aus dem BW-Leitfaden zum Umgang
mit Lebensmitteln auf Vereins- und Strassenfesten, Stand Jan 2025), absolvieren ein
Quiz mit 10 zufaellig gezogenen Fragen aus einem Pool von 20, **bestehen ab 80 %
(= 8 von 10 richtigen Antworten)** und erhalten ein PDF-Zertifikat. Die KjG-
Vorstandschaft sieht alle Ergebnisse und Zertifikate in einem Admin-Dashboard.

> Sortiment am Stand: Burger, Pommes, Getraenke. Manuelles Spuelen am Stand.
> Kuehlschrank + Gefrierer vorhanden. Inhalt und Fragenpool sind auf genau
> dieses Setup zugeschnitten (Hackfleisch durcherhitzt, Fritteuse <=175 °C,
> Zwei-Becken-Spuelverfahren, Kuehlkette nach DIN 10508).

Detaillierter Plan + Architecture Decision Record liegen unter
`.omc/plans/2026-05-17_hygieneschulung-kjg.md`.

---

## Inhalt

- [Ueberblick](#ueberblick)
- [Setup lokal](#setup-lokal)
- [Setup Docker](#setup-docker)
- [Konfiguration (.env)](#konfiguration-env)
- [Entwicklung](#entwicklung)
- [Build](#build)
- [Deploy](#deploy)
- [Tests](#tests)
- [Wartungsmodell und Bus-Faktor](#wartungsmodell-und-bus-faktor)
- [Backup-Strategie + Restore-Test](#backup-strategie--restore-test)
- [Florian-Sign-off vor Go-Live](#florian-sign-off-vor-go-live)
- [DSGVO-Hinweis](#dsgvo-hinweis)

---

## Ueberblick

```
hygieneschulung-kjg/
├── frontend/                        Vite + React 18 + TypeScript + Tailwind
│   ├── src/{pages,components,data,lib}
│   ├── e2e/                         Playwright-Specs
│   ├── playwright.config.ts
│   └── vite.config.ts
├── backend/                         Express + better-sqlite3 + pdf-lib + Zod
│   ├── src/{server,db,pdf,auth,cron,questions,quiz-logic}.ts
│   ├── src/{integration,pdf}.test.ts
│   └── scripts/export-questions.mjs
├── Dockerfile                       Multi-Stage Build
├── docker-compose.yml
├── .env.example
└── README.md
```

Stack-Highlights:

- **Server-side Quiz-Scoring**: Antworten + Punktzahl + PDF werden ausschliesslich
  serverseitig erzeugt. Das Frontend bekommt nie die richtigen Antworten.
- **SHA-256-Verifikationshash**: Jedes Zertifikat traegt einen Hash. Die
  Verify-Route `/api/verify/:hash` zeigt nur Initialen + Datum + Status.
- **Single-Binary-Deploy**: Express servt das gebaute Frontend auf demselben
  Port wie die API.
- **Self-hosted, DSGVO-konform**: SQLite, kein Cloud-Drittanbieter, 36 Monate
  Aufbewahrung mit Cron-Loeschung.

---

## Setup lokal

Voraussetzung: Node.js 20 LTS oder neuer, npm.

```bash
npm install            # installiert npm-run-all im Root
npm run install:all    # installiert frontend + backend Dependencies
cp .env.example .env   # Werte ersetzen (siehe naechster Abschnitt)
npm run dev            # Frontend (:5173) + Backend (:3000) parallel
```

Im Dev-Modus proxyt Vite alle `/api/*`-Aufrufe transparent auf den Backend-Port.

## Setup Docker

```bash
cp .env.example .env             # Werte ersetzen
docker compose up -d --build     # baut und startet den Container
docker compose logs -f app       # Logs verfolgen
```

Die SQLite-Datei liegt im Host-Verzeichnis `./data` (per Volume-Mount), damit
ein Container-Neustart die Daten nicht verliert.

---

## Konfiguration (.env)

| Variable               | Pflicht | Beschreibung |
|------------------------|---------|--------------|
| `PORT`                 | nein    | HTTP-Port (Default 3000). |
| `COOKIE_SECRET`        | **ja**  | Signierschluessel fuer das Admin-Cookie. Mindestens 32 zufaellige Bytes. |
| `ADMIN_PASSWORD_HASH`  | **ja**  | bcrypt-Hash des Admin-Passworts. Niemals Klartext einchecken. |
| `DB_PATH`              | nein    | Pfad zur SQLite-Datei (Default `./data/app.sqlite`). |

### Admin-Hash erzeugen

```bash
node -e "console.log(require('bcryptjs').hashSync('DEIN_PASSWORT', 12))"
```

Den ausgegebenen String (beginnt mit `$2a$12$...`) als `ADMIN_PASSWORD_HASH` in `.env`
eintragen.

> **Docker-Compose-Gotcha**: bcrypt-Hashes enthalten `$`. Docker Compose
> interpretiert `$VAR` in `.env`-Werten als Variablen-Referenz. **Jedes `$` im
> Hash in der `.env`-Datei verdoppeln** (`$` → `$$`), wenn du Docker Compose
> nutzt. Im lokalen Setup (`npm start`) ohne Docker ist kein Escaping noetig.
>
> Beispiel:
> - Original: `$2a$12$abcdef.real.hash...`
> - In `.env` fuer Compose: `$$2a$$12$$abcdef.real.hash...`

### Cookie-Secret erzeugen

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

---

## Entwicklung

```bash
npm run dev                       # frontend + backend parallel
cd frontend && npm run dev        # nur frontend (:5173)
cd backend  && npm run dev        # nur backend (:3000, tsx-watch)
```

Mobile-Layout testen: Chrome DevTools -> Device Mode "Pixel 5" oder ähnliche
Aufloesung 375x667.

---

## Build

```bash
npm run build       # baut Frontend, kopiert dist/ nach backend/public/
npm start           # startet Express auf PORT (servt Statics + /api)
```

Verifikation:

```bash
curl http://localhost:3000/api/health
# -> {"status":"ok","drawCount":10,"passMinCorrect":8}
```

---

## Deploy

Empfohlen: Docker auf einem kleinen VPS oder Heim-NAS hinter **Traefik** (Reverse
Proxy + Let's Encrypt). Das mitgelieferte `docker-compose.yml` ist bereits dafuer
konfiguriert.

```bash
docker compose up -d --build
docker compose logs -f app
```

### Traefik-Setup

Die Compose-Datei erwartet ein **extern** angelegtes Docker-Netzwerk namens
`frontend`, an dem Traefik bereits haengt:

```bash
docker network create frontend            # einmalig, falls noch nicht vorhanden
```

Konfiguration (Labels):

- **Domain**: `hygiene.kjg-pfaffenweiler.de`
- **HTTP**: Entrypoint `web` (Port 80) -> permanenter Redirect auf HTTPS.
- **HTTPS**: Entrypoint `websecure` (Port 443) mit certresolver `le`
  (Let's Encrypt). Der Resolver-Name `le` muss in der Traefik-Hauptkonfiguration
  existieren, z. B.:
  ```yaml
  # traefik.yml (Auszug)
  certificatesResolvers:
    le:
      acme:
        email: admin@kjg-pfaffenweiler.de
        storage: /letsencrypt/acme.json
        httpChallenge:
          entryPoint: web
  ```
- **Sicherheits-Header**: HSTS (180 Tage, includeSubdomains, preload),
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, sinnvoller
  `Referrer-Policy`.

DNS-Setup: A/AAAA-Record fuer `hygiene.kjg-pfaffenweiler.de` auf die
oeffentliche IP des Traefik-Hosts. Traefik holt das LE-Zertifikat beim ersten
Request automatisch.

Verifikation nach Deploy:

```bash
curl -I https://hygiene.kjg-pfaffenweiler.de/api/health
# -> HTTP/2 200, strict-transport-security: max-age=15552000; ...
```

Healthcheck: `/api/health` (Docker-interne `wget`-Probe alle 30s).

---

## Tests

```bash
# Frontend Unit-Tests (Vitest)
cd frontend && npm test

# Backend Unit + Integrations-Tests (Vitest + supertest)
cd backend && npm test

# Frontend E2E (Playwright, Mobile-Chromium)
cd frontend
npx playwright install chromium     # einmalig
npm run e2e
```

Abdeckung:

- **frontend/src/lib/quiz.test.ts** — Pool-Verteilung, Stratified-Sampling,
  Schwellwert 7/8/9/10, Determinismus per Seed.
- **backend/src/pdf.test.ts** — Hash-Determinismus, PDF-Format, Metadaten.
- **backend/src/integration.test.ts** — Happy Path, Token-Replay (409),
  Session-Expiry (409), Cooldown (429), Verify-Bogus (400/404), Admin-Auth.
- **frontend/e2e/*.spec.ts** — Browser-Smoke-Test des Happy-Paths und
  Negativ-Pfade via Playwright-Request-Context.

---

## Wartungsmodell und Bus-Faktor

Die App ist bewusst minimalistisch gehalten, damit sie von einer einzelnen
ehrenamtlichen Person betrieben werden kann. Trotzdem: **Bus-Faktor 1 ist ein
Risiko**. Empfohlener Hand-Over an Nachfolger:

1. **Zugaenge teilen**:
   - SSH/Server-Zugang zum Host.
   - Inhalt der `.env`-Datei (per verschluesseltem Vault, z. B. Bitwarden).
   - Admin-Passwort (nicht den Hash, sondern das Klartext-Passwort, damit der
     Nachfolger einsteigen kann).
   - GitHub/Git-Repo-Zugang.
2. **Wartungspfade**:
   - Node-LTS-Upgrade jaehrlich (`node:20-alpine` -> `node:22-alpine` ...).
   - `npm audit` ausserhalb von Saison.
   - Dependency-Bumps bei kritischen CVEs (Express, Zod, pdf-lib).
3. **Saisonarbeit**: Vor jedem Dorffest die Fragen mit dem aktuellen BW-Leitfaden
   abgleichen (siehe naechster Abschnitt zum Florian-Sign-off).
4. **Notfall**: Container neustarten `docker compose restart app`.
   Backup-Restore siehe unten.

---

## Backup-Strategie + Restore-Test

### Backup

SQLite ist eine einzelne Datei. Tagliches Backup-Script (Beispiel via cron auf
dem Host):

```bash
#!/bin/sh
DATE=$(date +%Y-%m-%d)
mkdir -p backups
sqlite3 data/app.sqlite ".backup backups/app-${DATE}.sqlite"
# Aelter als 30 Tage entfernen
find backups -type f -mtime +30 -delete
```

Das geht **waehrend laufendem Container** sicher, weil SQLite's `.backup` einen
konsistenten Snapshot zieht.

### Restore-Test (mindestens 1x pro Saison)

```bash
# 1. Backup-Datei in eine Sandbox laden
cp backups/app-2026-05-17.sqlite /tmp/restore-test.sqlite

# 2. Pruefen, ob die Datei intakt ist
sqlite3 /tmp/restore-test.sqlite "PRAGMA integrity_check;"
# Erwartet: ok

# 3. Zeilenzahl pruefen
sqlite3 /tmp/restore-test.sqlite "SELECT COUNT(*) FROM attempts;"
# -> sollte aktuelle Anzahl liefern

# 4. Erfolg dokumentieren, Sandbox aufraeumen
rm /tmp/restore-test.sqlite
```

Wenn die Datei korrupt ist, das naechstaeltere Backup probieren. Der Restore-
Test sollte **mindestens einmal jaehrlich** durchgespielt werden, damit man im
Ernstfall weiss, dass der Pfad funktioniert.

---

## Florian-Sign-off vor Go-Live

Die 20 Quiz-Fragen unter `frontend/src/data/questions.ts` sind aus dem BW-
Leitfaden (Stand Januar 2025) abgeleitet. Jede Frage traegt:

- `sourcePage` mit der Seitenangabe im BW-Leitfaden,
- `explanation` mit einer Ein-Satz-Begruendung,
- einen `// REVIEW: Florian`-Marker im JSDoc.

**Vor jeder produktiven Schaltung** muss Florian Straub (Schulungsverantwortliche
KjG) die Fragenliste gegen den BW-Leitfaden sowie den KjG-Hygieneplan
abgleichen und freigeben. Sign-off bitte als Kommentar im Repository oder per
E-Mail an die Vorstandschaft. Ohne Sign-off **nicht** live schalten.

Aenderungen an `questions.ts` erfordern einen erneuten Sign-off.

---

## DSGVO-Hinweis

Erhoben werden: **Vorname, Nachname, optional E-Mail, Antworten, Score und das
PDF-Zertifikat (bei Bestehen)**. Aufbewahrungsdauer: **36 Monate**, analog
Belehrungspraxis nach Infektionsschutzgesetz § 43. Cron-Job loescht aeltere
Datensaetze automatisch.

Verifikations-Hash: Bei Bestehen wird ein SHA-256-Hash erzeugt. Unter der
oeffentlichen Verify-Route `/api/verify/<hash>` sind **nur Initialen + Datum +
Status** abrufbar — kein voller Name. Rate-Limit 10/min/IP.

Recht auf vorzeitige Loeschung: per E-Mail an die KjG-Vorstandschaft.

Die App ist self-hosted und uebermittelt keine personenbezogenen Daten an
Drittanbieter (kein Tracking, kein CDN-Drittanbieter mit Personendaten).
