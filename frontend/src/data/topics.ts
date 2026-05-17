/**
 * Themenübersicht der KjG-Hygieneschulung.
 *
 * Inhalte zitieren bzw. paraphrasieren den BW-Leitfaden
 * "Leitfaden für den Umgang mit Lebensmitteln auf Vereins- und Straßenfesten"
 * (Ministerium für Ländlichen Raum und Verbraucherschutz Baden-Württemberg,
 *  Stand Januar 2025).
 *
 * Sortiment am KjG-Stand:
 *   - Burger (Hackfleisch-Patties tiefgefroren)
 *   - Steak (frisches Fleisch, Kühlschrank)
 *   - Wurst (Kühlschrank)
 *   - Pommes (aus dem Kühlschrank)
 *   - Getränke
 * Manuelles Spülen am Stand. Kühlschrank + Gefrierer vorhanden.
 */

export interface Topic {
  /** Stable id 1..7, used for routing and as section reference in questions. */
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
  subtitle: 'Sauber kleiden, gründlich Hände waschen, nicht rauchen.',
  sources: [13],
  summary: `
### Wer darf am Stand mithelfen?
Personen mit **Magen-Darm-Erkrankungen, Hauterkrankungen oder eitrigen Wunden an Händen
oder Armen** dürfen nicht mit Lebensmitteln arbeiten. Kleinere Schnittwunden wasserdicht
mit Pflaster + Einmalhandschuh abdecken.

### Kleidung
- Saubere Arbeitskleidung, ggf. Schürze.
- **Haare zusammenbinden** oder Kopfbedeckung tragen.
- **Kein Schmuck** an Händen oder Armen.

### Hände waschen — Pflicht-Zeitpunkte
- vor Arbeitsbeginn,
- nach jedem Toilettengang,
- nach Kontakt mit rohen Lebensmitteln (Hackfleisch-Patties, Steak, Wurst),
- nach Husten / Niesen / Nase putzen,
- nach Geld- oder Müll-Kontakt.

Mit Seife und fließendem Wasser, abtrocknen mit **Einmalhandtüchern**.

### Einmalhandschuhe
Sind kein Ersatz fürs Händewaschen. Regelmäßig wechseln, spätestens nach Kontakt
mit unsauberen Bereichen (Verpackung, Müll, Geld).

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
  subtitle: 'Geschützt aufstellen, Trinkwasser sichern, Eis nur aus Trinkwasser.',
  sources: [5, 6, 10],
  summary: `
### Bauliche Voraussetzungen
- Fester, sauberer Boden; **überdacht**, an drei Seiten geschlossen.
- Offene Lebensmittel an der Vorderseite durch **Spuckschutz** vor Husten / Niesen / Staub schützen.
- Bereich für offene Lebensmittel mindestens 1,5 m vom Publikumsverkehr abschirmen.

### Handwaschgelegenheit
- Leicht erreichbar, mit ausreichend Wasser, **Flüssigseife** und **Einmalhandtüchern**.
- Bei Umgang mit leicht verderblichen Lebensmitteln: warmes Wasser, z. B. Glühweinkocher mit Zapfhahn.

### Trinkwasser
- Wasser für Lebensmittel, Reinigung und Geschirr muss **Trinkwasserqualität** haben.
- Schläuche und Vorratsbehälter müssen lebensmittelgeeignet sein (z. B. **KTW-A / DVGW W270**).
- Handelsübliche Gartenschläuche sind nicht zulässig.
- Bei temporärer Wasserverteilung Gesundheitsamt informieren.

### Eis aus Trinkwasser
Eis, das Lebensmittel oder Getränke berührt, muss **aus Trinkwasser** hergestellt sein.
Saubere Aufbewahrungs- und Portionierhilfen verwenden — **nicht mit bloßer Hand**.
`,
};

/** @see BW-Leitfaden S. 8, 9 (Tabelle 2) */
const lagerung: Topic = {
  id: 3,
  slug: 'lagerung-kuehlkette',
  title: 'Lagerung & Kühlkette',
  subtitle: 'Kühlkette einhalten — Tabelle 2 kennen.',
  sources: [8, 9],
  summary: `
### Grundregeln
- Rohe Lebensmittel **getrennt** von verzehrfertigen lagern (räumlich oder durch
  verschlossene Behältnisse).
- Kühlgeräte vor Befüllen ausreichend vorkühlen.
- Mindesthaltbarkeitsdatum und Verbrauchsdatum prüfen.
- Vorratsgefäße vor Wiederbefüllen reinigen.

### Tabelle 2 — Maximale Lagertemperaturen (DIN 10508)

| Erzeugnis                                          | max. Temperatur |
|----------------------------------------------------|-----------------|
| Geflügel- und Hackfleischerzeugnisse               | **4 °C**        |
| Frischfleisch, Fleischerzeugnisse, Sahnetorten, Salate | **7 °C**    |
| Milchprodukte                                      | **10 °C**       |
| Tiefkühlprodukte                                   | **−18 °C**      |

### Sortiment am KjG-Stand — wo gehört was hin?

| Produkt                       | Lagerung         | max. Temperatur |
|-------------------------------|------------------|-----------------|
| Hackfleisch-Patties (gefroren)| **Gefrierer**    | **−18 °C**      |
| Steak (frisches Fleisch)      | **Kühlschrank**  | **7 °C**        |
| Wurst (Fleischerzeugnis)      | **Kühlschrank**  | **7 °C**        |
| Pommes (gekühlt / vorgegart)  | **Kühlschrank**  | **7 °C**        |
| Getränke gekühlt              | Kühlschrank      | nach Bedarf     |

### Praxis-Tipps
- **Gefrierer** nicht in die Sonne stellen; Tür so kurz wie möglich öffnen.
- **Hackfleisch-Patties auftauen** nur im Kühlschrank, **nie bei Raumtemperatur**.
- Steak und Wurst nach Anbruch zügig verarbeiten.
- Pommes erst kurz vor dem Frittieren aus dem Kühlschrank nehmen.

### Pflicht-Kühlung
Torten und Kuchen mit nicht durcherhitzten Füllungen, Milch- und Milcherzeugnisse,
Fleisch und Wurst (außer Hartwurst), Fisch, Salate, Dressings, Soßen, belegte
Brötchen.
`,
};

/** @see BW-Leitfaden S. 7, 8, 10 */
const zubereitung: Topic = {
  id: 4,
  slug: 'zubereitung',
  title: 'Zubereitung & Kreuzkontamination',
  subtitle: 'Patties durchgaren, Pommes bei 175 °C, Rohes und Fertiges trennen.',
  sources: [7, 8, 10],
  summary: `
### Strikte Trennung
- Saubere und unsaubere Tätigkeiten trennen (siehe BW-Tabelle 1).
- **Getrennte Schneidebretter und Messer** für rohes Fleisch (Patties, Steak, Wurst-
  Anschnitt) und für verzehrfertige Lebensmittel.
- Eigene Spül- oder Auftauvorrichtung für rohes Fleisch, damit Auftauwasser
  nicht andere Lebensmittel kontaminiert.

### Hackfleisch-Patties — Hochrisiko
Erzeugnisse aus **Hackfleisch** dürfen auf Vereins- und Straßenfesten nur
abgegeben werden, wenn sie **vollständig durcherhitzt** sind (Kerntemperatur
mindestens 70 °C). Roh- und Halbgares (z. B. medium) ist nicht zulässig.
Salmonellen- und EHEC-Risiko.

> **Auftauen**: gefrorene Patties am besten direkt aus dem Gefrierer in die Pfanne /
> auf den Grill. Wenn vorher aufgetaut wird, dann **nur im Kühlschrank** —
> niemals bei Raumtemperatur, weil die Außentemperatur dann zu lange im kritischen
> Bereich 8 – 60 °C liegt.

### Steak und Wurst
- **Steak**: ganzes Muskelstück — Außenflächen müssen vollständig durchgebraten
  sein. Die Hygienesicherheit ist hier hauptsächlich eine Frage der **Oberflächen-
  Durcherhitzung**, da Bakterien praktisch nur außen sitzen.
- **Brüh- und Bratwurst**: durcherhitzen, bis der Saft klar austritt.
- Nach Kontakt mit rohem Fleisch / Wurst: Schneidebrett, Messer und Hände
  gründlich reinigen, bevor man fertige Speisen anfasst.

### Pommes — Fritteuse-Regeln
- Fritteuse auf **maximal 175 °C** einstellen, um Acrylamidbildung zu vermeiden.
- Frittierfett regelmäßig wechseln, wenn es dunkelt oder schäumt.
- Pommes goldgelb, nicht braun; keine verbrannten Reste abgeben.
- Vor dem Frittieren: Pommes aus dem Kühlschrank nehmen, kurz abtropfen lassen,
  vorsichtig in das heiße Fett geben (Spritzgefahr).

### Allgemein
- Zu garende Lebensmittel **bis in den Kern** durcherhitzen.
- Warmgehaltene Speisen durchgängig **über 65 °C** halten.
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
**Verzehrfertige Lebensmittel niemals mit bloßer Hand anfassen.**
Das gilt für Burger-Brötchen, fertige Patties auf dem Rost, Pommes nach dem
Frittieren, aufgeschnittenes Steak, fertige Wurst — alles, was nicht mehr
erhitzt wird.

### Was stattdessen
- **Zangen, Löffel, Spatel** verwenden.
- **Einmalhandschuhe** sind möglich, ersetzen aber das Händewaschen nicht.
- Servietten als Schutz beim Anreichen.

### Einmalhandschuhe regelmäßig wechseln
Handschuhe werden genauso schnell verschmutzt wie bloße Hände. Wechseln
**spätestens** nach:
- Kontakt mit unsauberen Bereichen (Verpackung, Müll),
- Geldannahme (sofern nicht durch separate Person erledigt),
- jeder Pause.

### Hohe Sorgfalt
- Vor jeder Ausgabe Hände waschen.
- Saubere Arbeitsfläche, keine schmutzigen Tücher in Reichweite.
- Bei Burgern: Beilagen und Soßen mit Löffel, nicht mit Fingern.
- Pommes mit Schaufel oder Zange in die Tüte / den Teller geben.
`,
};

/** @see BW-Leitfaden S. 10 */
const getraenke: Topic = {
  id: 6,
  slug: 'getraenke',
  title: 'Getränke & Eis',
  subtitle: 'Saubere Becher, sortierte Gläser, Eis nie mit Hand.',
  sources: [10],
  summary: `
### Gläser und Mehrwegbecher
- Saubere Behältnisse verwenden.
- **Beschädigte oder gesplitterte Gläser/Becher konsequent aussortieren** —
  Splitter können ins Getränk gelangen.
- Mehrweg gründlich spülen (siehe Sektion „Reinigung": Spülmaschine bzw.
  Zwei-Becken-Verfahren).

### Eis im Getränk
- Eis, das Getränke berührt, muss aus **Trinkwasser** hergestellt sein.
- **Eis niemals mit bloßer Hand entnehmen** — Eisportionierer oder Löffel.
- Eisportionierer in sauberem Wasser aufbewahren, das **mindestens halbstündlich
  gewechselt** wird.

### Zitrusfrüchte im Getränk
Wenn Zitronen / Limetten ungeschält ins Getränk kommen, **unbehandelte Ware**
verwenden, da Oberflächenbehandlungsmittel sich nicht vollständig abwaschen
lassen.
`,
};

/** @see BW-Leitfaden S. 5, 6, 7 */
const reinigung: Topic = {
  id: 7,
  slug: 'reinigung-abfall',
  title: 'Reinigung, Abfall & Schädlinge',
  subtitle: 'Zwei-Becken-Verfahren, geschlossener Müll, abgedeckte Speisen.',
  sources: [5, 6, 7],
  summary: `
### Geschirrspülen am KjG-Stand — Spülmaschine + Zwei-Becken-Verfahren
Wir haben am Stand eine **Spülmaschine** — die ist die erste Wahl, weil sie heiß
genug spült, um Keime zuverlässig abzutöten.

Falls die Spülmaschine ausfällt oder bei einzelnem Geschirr (z. B. großen
Töpfen): **Zwei-Becken-Verfahren** anwenden.
1. **Erstes Becken:** so heißes Wasser wie möglich + **Spülmittel**.
2. **Zweites Becken:** sauberes, **warmes Nachspülwasser**.

Wasser regelmäßig wechseln, Trockentücher regelmäßig austauschen. Sauberes
Geschirr **getrennt** vom Schmutzgeschirr lagern. Geschirr nicht feucht stapeln
(ungehinderter Wasserabfluss). Beschädigtes Geschirr aussortieren.

> Für Trinkgläser ist alternativ ein Kaltwaschverfahren mit Reinigungstabletten
> erlaubt, sofern es gleichwertige Ergebnisse liefert und Rückstände sicher
> entfernt werden.

### Abfallentsorgung
- Müll über dichte, geschlossene Behälter sammeln.
- Lebensmittelabfälle **rasch entfernen**, separat von Lebensmittelbereichen.
- Speisereste **nicht** in die Biotonne — Abholung durch Entsorgungsunternehmen
  oder gemeinsame Lösung mit anderen Anbietern.
- Auch für Festbesucher reichlich Müllbehälter in Standnähe.

### Schädlingsprävention
- Lebensmittel **stets abdecken**.
- Müllbehälter **geschlossen** halten.
- Stand sauber halten, Krümel und Reste sofort entfernen.

### Reinigungsrhythmus
- Vor Beginn: Arbeitsflächen, Geräte, Griffe wischen.
- Während des Betriebs: Zwischenreinigung von Schneidebrettern, Messern,
  Arbeitsflächen.
- Nach Schluss: Gründliche Reinigung aller Geräte und Flächen.
`,
};

export const topics: Topic[] = [
  personalhygiene,
  verkaufsstand,
  lagerung,
  zubereitung,
  ausgabe,
  getraenke,
  reinigung,
];

export function getTopicById(id: number): Topic | undefined {
  return topics.find((t) => t.id === id);
}

export function getTopicBySlug(slug: string): Topic | undefined {
  return topics.find((t) => t.slug === slug);
}
