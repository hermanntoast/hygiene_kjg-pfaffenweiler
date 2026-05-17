/**
 * Themenuebersicht der KjG-Hygieneschulung.
 *
 * Inhalte zitieren bzw. paraphrasieren den BW-Leitfaden
 * "Leitfaden fuer den Umgang mit Lebensmitteln auf Vereins- und Strassenfesten"
 * (Ministerium fuer Laendlichen Raum und Verbraucherschutz Baden-Wuerttemberg,
 *  Stand Januar 2025).
 *
 * Sortiment am KjG-Stand: Burger, Pommes, Getraenke. Manuelles Spuelen am Stand.
 * Kuehlschrank + Gefrierer vorhanden.
 */

export interface Topic {
  /** Stable id 1..8, used for routing and as section reference in questions. */
  id: number;
  /** URL-friendly slug. */
  slug: string;
  /** Display title (German). */
  title: string;
  /** Short subtitle / one-liner. */
  subtitle: string;
  /** Markdown content. Kept compact for mobile reading. */
  summary: string;
  /** BW-Leitfaden source pages (printed page numbers). */
  sources: number[];
}

/** @see BW-Leitfaden S. 13 */
const personalhygiene: Topic = {
  id: 1,
  slug: 'personalhygiene',
  title: 'Personalhygiene & Handhygiene',
  subtitle: 'Sauber kleiden, gruendlich Haende waschen, nicht rauchen.',
  sources: [13],
  summary: `
### Wer darf am Stand mithelfen?
Personen mit **Magen-Darm-Erkrankungen, Hauterkrankungen oder eitrigen Wunden an Haenden
oder Armen** duerfen nicht mit Lebensmitteln arbeiten. Kleinere Schnittwunden wasserdicht
mit Pflaster + Einmalhandschuh abdecken.

### Kleidung
- Saubere Arbeitskleidung, ggf. Schuerze.
- **Haare zusammenbinden** oder Kopfbedeckung tragen.
- **Kein Schmuck** an Haenden oder Armen.

### Haende waschen — Pflicht-Zeitpunkte
- vor Arbeitsbeginn,
- nach jedem Toilettengang,
- nach Kontakt mit rohen Lebensmitteln (z. B. Hackfleisch fuer Burger),
- nach Husten / Niesen / Nase putzen,
- nach Geld- oder Muell-Kontakt.

Mit Seife und fliessendem Wasser, abtrocknen mit **Einmalhandtuechern**.

### Einmalhandschuhe
Sind kein Ersatz fuer Haendewaschen. Regelmaessig wechseln, spaetestens nach Kontakt
mit unsauberen Bereichen (Verpackung, Muell, Geld).

### Verbote im Lebensmittelbereich
- **Rauchen und Dampfen sind verboten.**
- Speisen nicht anhusten, nicht anniesen, nicht ablecken.
`,
};

/** @see BW-Leitfaden S. 5, 6, 10 */
const verkaufsstand: Topic = {
  id: 2,
  slug: 'verkaufsstand',
  title: 'Verkaufsstand & Ausstattung',
  subtitle: 'Geschuetzt aufstellen, Trinkwasser sichern, Eis nur aus Trinkwasser.',
  sources: [5, 6, 10],
  summary: `
### Bauliche Voraussetzungen
- Fester, sauberer Boden; **ueberdacht**, an drei Seiten geschlossen.
- Offene Lebensmittel an der Vorderseite durch **Spuckschutz** vor Husten / Niesen / Staub schuetzen.
- Bereich fuer offene Lebensmittel mindestens 1,5 m vom Publikumsverkehr abschirmen.

### Handwaschgelegenheit
- Leicht erreichbar, mit ausreichend Wasser, **Fluessigseife** und **Einmalhandtuechern**.
- Bei Umgang mit leicht verderblichen Lebensmitteln: warmes Wasser, z. B. Gluehweinkocher mit Zapfhahn.

### Trinkwasser
- Wasser fuer Lebensmittel, Reinigung und Geschirr muss **Trinkwasserqualitaet** haben.
- Schlaeuche und Vorratsbehaelter muessen lebensmittelgeeignet sein (z. B. **KTW-A / DVGW W270**).
- Handelsuebliche Gartenschlaeuche sind nicht zulaessig.
- Bei temporaerer Wasserverteilung Gesundheitsamt informieren.

### Eis aus Trinkwasser
Eis, das Lebensmittel oder Getraenke beruehrt, muss **aus Trinkwasser** hergestellt sein.
Saubere Aufbewahrungs- und Portionierhilfen verwenden — **nicht mit blosser Hand**.
`,
};

/** @see BW-Leitfaden S. 8, 9 (Tabelle 2) */
const lagerung: Topic = {
  id: 3,
  slug: 'lagerung-kuehlkette',
  title: 'Lagerung & Kuehlkette',
  subtitle: 'Kuehlkette einhalten — Tabelle 2 kennen.',
  sources: [8, 9],
  summary: `
### Grundregeln
- Rohe Lebensmittel **getrennt** von verzehrfertigen lagern (raeumlich oder durch
  verschlossene Behaelter).
- Kuehlgeraete vor Befuellen ausreichend vorkuehlen.
- Mindesthaltbarkeitsdatum und Verbrauchsdatum pruefen.
- Vorratsgefaesse vor Wiederbefuellen reinigen.

### Tabelle 2 — Maximale Lagertemperaturen (DIN 10508)

| Erzeugnis                                       | max. Temperatur |
|-------------------------------------------------|-----------------|
| Gefluegel- und Hackfleischerzeugnisse           | **4 °C**        |
| Frischfleisch, Fleischerzeugnisse, Sahnetorten, Salate | **7 °C**  |
| Milchprodukte                                   | **10 °C**       |
| Tiefkuehlprodukte                               | **−18 °C**      |

### Fuer den KjG-Stand
- **Burger-Hackfleisch** gehoert ins **kaelteste Fach** des Kuehlschranks (max. 4 °C).
- **TK-Pommes** bleiben im Gefrierer (−18 °C), bis sie in die Fritteuse kommen.
- Kuehlschrank nicht in die Sonne stellen; Tueren so kurz wie moeglich oeffnen.

### Pflicht-Kuehlung
Torten und Kuchen mit nicht durcherhitzten Fuellungen, Milch- und Milcherzeugnisse,
Fleisch und Wurst (ausser Hartwurst), Fisch, Salate, Dressings, Sossen, belegte
Broetchen.
`,
};

/** @see BW-Leitfaden S. 7, 8, 10 */
const zubereitung: Topic = {
  id: 4,
  slug: 'zubereitung',
  title: 'Zubereitung & Kreuzkontamination',
  subtitle: 'Burger durchgaren, Pommes bei 175 °C, Rohes und Fertiges trennen.',
  sources: [7, 8, 10],
  summary: `
### Strikte Trennung
- Saubere und unsaubere Taetigkeiten trennen (siehe BW-Tabelle 1).
- **Getrennte Schneidebretter und Messer** fuer rohes Fleisch / Gefluegel und fuer
  verzehrfertige Lebensmittel.
- Eigene Spuel- oder Auftauvorrichtung fuer rohes Fleisch, damit Auftauwasser
  nicht andere Lebensmittel kontaminiert.

### Burger — Hackfleisch ist Hochrisiko
Erzeugnisse aus **Hackfleisch** duerfen auf Vereins- und Strassenfesten nur
abgegeben werden, wenn sie **vollstaendig durcherhitzt** sind (Kerntemperatur
mind. 70 °C, Richtwert). Roh- und Halbgares (z. B. medium) ist nicht zulaessig.
Salmonellen- und EHEC-Risiko.

### Pommes — Fritteuse-Regeln
- Fritteuse auf **maximal 175 °C** einstellen, um Acrylamidbildung zu vermeiden.
- Frittierfett regelmaessig wechseln, wenn es dunkelt oder schaeumt.
- Pommes goldgelb, nicht braun; keine verbrannten Reste abgeben.

### Allgemein
- Zu garende Lebensmittel **bis in den Kern** durcherhitzen.
- Warmgehaltene Speisen durchgaengig **ueber 65 °C** halten.
- Tiere fernhalten vom Speisenbereich.
`,
};

/** @see BW-Leitfaden S. 8 */
const ausgabe: Topic = {
  id: 5,
  slug: 'ausgabe',
  title: 'Ausgabe & verzehrfertige Lebensmittel',
  subtitle: 'Kein direkter Handkontakt — Zangen, Servietten, Handschuhe.',
  sources: [8],
  summary: `
### Goldene Regel
**Verzehrfertige Lebensmittel niemals mit blosser Hand anfassen.**
Das gilt fuer Burger-Broetchen, Beilagen, Brot, Backwaren — alles, was nicht
mehr erhitzt wird.

### Was stattdessen
- **Zangen, Loeffel, Spatel** verwenden.
- **Einmalhandschuhe** sind moeglich, ersetzen aber das Haendewaschen nicht.
- Servietten als Schutz beim Anreichen.

### Einmalhandschuhe regelmaessig wechseln
Handschuhe werden genauso schnell verschmutzt wie blosse Haende. Wechseln
**spaetestens** nach:
- Kontakt mit unsauberen Bereichen (Verpackung, Muell),
- Geldannahme (sofern nicht durch separate Person erledigt),
- jeder Pause.

### Hohe Sorgfalt
- Vor jeder Ausgabe Haende waschen.
- Saubere Arbeitsflaeche, keine schmutzigen Tuecher in Reichweite.
- Bei Sandwiches/Burgern: Beilagen und Sossen mit Loeffel, nicht mit Fingern.
`,
};

/** @see BW-Leitfaden S. 10 */
const getraenke: Topic = {
  id: 6,
  slug: 'getraenke',
  title: 'Getraenke & Eis',
  subtitle: 'Saubere Becher, Zapfanlagen reinigen, Eis nie mit Hand.',
  sources: [10],
  summary: `
### Glaeser und Mehrwegbecher
- Saubere Behaeltnisse verwenden, beschaedigte aussortieren.
- Mehrweg gruendlich spuelen (siehe Sektion 8: Zwei-Becken-Verfahren).

### Zapfanlagen
- Vor der Veranstaltung gemaess Hersteller / Verleiher **reinigen, ggf. desinfizieren**.
- Waehrend des Betriebs sauber halten, regelmaessig Tropfschalen leeren.
- Betriebssicherheit (Pruefpflicht) liegt bei Verleiher, Hygiene-Verantwortung
  beim Nutzer.

### Eis im Getraenk
- Eis, das Getraenke beruehrt, muss aus **Trinkwasser** hergestellt sein.
- **Eis niemals mit blosser Hand entnehmen** — Eisportionierer oder Loeffel.
- Eisportionierer in sauberem Wasser aufbewahren, das **mindestens halbstuendlich
  gewechselt** wird.

### Zitrusfruechte im Getraenk
Wenn Zitronen / Limetten ungeschaelt ins Getraenk kommen, **unbehandelte Ware**
verwenden, da Oberflaechenbehandlungsmittel sich nicht vollstaendig abwaschen
lassen.
`,
};

/** @see BW-Leitfaden S. 11, 12 */
const kennzeichnung: Topic = {
  id: 7,
  slug: 'kennzeichnung',
  title: 'Kennzeichnung & Allergene',
  subtitle: 'Allergene kennen — fuer Wohltaetigkeitsfeste gilt eine Ausnahme.',
  sources: [11, 12],
  summary: `
### 14 kennzeichnungspflichtige Allergene
1. Glutenhaltiges Getreide (Weizen, Dinkel, Roggen, Gerste, Hafer und Erzeugnisse)
2. Krebstiere und Erzeugnisse
3. Eier und Erzeugnisse
4. Fisch und Erzeugnisse
5. Erdnuesse und Erzeugnisse
6. Sojabohnen und Erzeugnisse
7. Milch und Erzeugnisse (einschliesslich Laktose)
8. Schalenfruechte (Mandeln, Haselnuesse, Walnuesse, Pistazien, Cashew, Pekan, Paranuesse, Macadamia)
9. Sellerie und Erzeugnisse
10. Senf und Erzeugnisse
11. Sesamsamen und Erzeugnisse
12. Schwefeldioxid und Sulfite (ab 10 mg/kg)
13. Lupinen und Erzeugnisse
14. Weichtiere und Erzeugnisse

### Wohltaetigkeitsausnahme
Der BW-Leitfaden nennt **Dorffeste** ausdruecklich als Beispiel fuer Veranstaltungen,
die nicht in den Anwendungsbereich der Lebensmittel­informations­verordnung (LMIV)
fallen — Voraussetzung: **gelegentlich**, **kleiner Rahmen**, **gemeinnuetzig**.

> Praxis: Eine schriftliche Allergenkennzeichnung ist beim KjG-Dorffest nicht
> Pflicht — eine **freiwillige Kennzeichnung** als Service ist aber ausdruecklich
> erlaubt und empfohlen. Bei Fragen die untere Lebensmittelueberwachungsbehoerde
> einbinden.

### Zusatzstoffe
Bei vorverpackter Ware Pflicht. Bei loser Ware mit Allergenkennzeichnung kombinieren.

### Preisauszeichnung
Preise gut sichtbar, deutlich lesbar. Bei Alkohol: mindestens ein alkoholfreies
Getraenk darf **nicht teurer** sein als das guenstigste alkoholische.
`,
};

/** @see BW-Leitfaden S. 5, 6, 7 */
const reinigung: Topic = {
  id: 8,
  slug: 'reinigung-abfall',
  title: 'Reinigung, Abfall & Schaedlinge',
  subtitle: 'Zwei-Becken-Verfahren, geschlossener Muell, abgedeckte Speisen.',
  sources: [5, 6, 7],
  summary: `
### Geschirrspuelen am Stand — Zwei-Becken-Verfahren
Wenn keine Spuelmaschine verfuegbar ist:
1. **Erstes Becken:** so heisses Wasser wie moeglich + **Spuelmittel**.
2. **Zweites Becken:** sauberes, **warmes Nachspuelwasser**.

Wasser regelmaessig wechseln, Trockentuecher regelmaessig austauschen. Sauberes
Geschirr **getrennt** vom Schmutzgeschirr lagern. Geschirr nicht feucht stapeln
(unghinderter Wasserabfluss). Beschaedigtes Geschirr aussortieren.

> Fuer Trinkglaeser ist alternativ ein Kaltwaschverfahren mit Reinigungstabletten
> erlaubt, sofern es gleichwertige Ergebnisse liefert und Rueckstaende sicher
> entfernt werden.

### Abfallentsorgung
- Muell ueber dichte, geschlossene Behaelter sammeln.
- Lebensmittelabfaelle **rasch entfernen**, separat von Lebensmittelbereichen.
- Speisereste **nicht** in die Biotonne — Abholung durch Entsorgungsunternehmen
  oder gemeinsame Loesung mit anderen Anbietern.
- Auch fuer Festbesucher reichlich Muellbehaelter in Standnaehe.

### Schaedlingspraevention
- Lebensmittel **stets abdecken**.
- Muellbehaelter **geschlossen** halten.
- Stand sauber halten, Krumen und Reste sofort entfernen.

### Reinigungsrhythmus
- Vor Beginn: Arbeitsflaechen, Geraete, Griffe wischen.
- Waehrend des Betriebs: Zwischenreinigung von Schneidebrettern, Messern,
  Arbeitsflaechen.
- Nach Schluss: Gruendliche Reinigung aller Geraete und Flaechen.
`,
};

export const topics: Topic[] = [
  personalhygiene,
  verkaufsstand,
  lagerung,
  zubereitung,
  ausgabe,
  getraenke,
  kennzeichnung,
  reinigung,
];

export function getTopicById(id: number): Topic | undefined {
  return topics.find((t) => t.id === id);
}

export function getTopicBySlug(slug: string): Topic | undefined {
  return topics.find((t) => t.slug === slug);
}
