/**
 * Fragenpool für die KjG-Hygieneschulung.
 *
 * 20 Multiple-Choice-Fragen, jede mit Quellverweis auf den BW-Leitfaden
 * "Leitfaden für den Umgang mit Lebensmitteln auf Vereins- und Straßenfesten",
 * Ministerium für Ländlichen Raum und Verbraucherschutz Baden-Württemberg
 * (Stand Januar 2025).
 *
 * Sortiment am KjG-Stand:
 *   - Burger (Hackfleisch-Patties tiefgefroren)
 *   - Steak (frisches Fleisch, Kühlschrank)
 *   - Wurst (Kühlschrank)
 *   - Pommes (aus dem Kühlschrank)
 *   - Getränke
 * Spülmaschine + Zwei-Becken-Setup am Stand.
 *
 * Verteilung über 7 Sektionen — Summe = 20:
 *   1 Personalhygiene:  3 Fragen
 *   2 Verkaufsstand:    2 Fragen
 *   3 Lagerung:         3 Fragen
 *   4 Zubereitung:      3 Fragen
 *   5 Ausgabe:          3 Fragen
 *   6 Getränke:         3 Fragen
 *   7 Reinigung:        3 Fragen
 *
 * Pro Sektion mindestens eine Frage mit quality="core" — diese wird beim
 * stratifizierten Sampling garantiert gezogen.
 *
 * REVIEW: Alle 20 Fragen müssen vor Go-Live von Florian Straub fachlich
 * gegen den BW-Leitfaden gegengeprüft werden.
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

/** Internal pool — never sent to the client. */
export const questions: Question[] = [
  // ---- Sektion 1: Personalhygiene & Handhygiene (3 Fragen) ----
  {
    // REVIEW: Florian
    id: 1,
    sectionId: 1,
    quality: 'core',
    text: 'Wann musst du deine Hände waschen? Welche Antwort ist am vollständigsten?',
    options: [
      'Nur vor Arbeitsbeginn.',
      'Nur nach dem Toilettengang.',
      'Vor Arbeitsbeginn, nach Toilettengang, nach Kontakt mit rohen Lebensmitteln, nach Niesen oder Husten.',
      'Nur am Ende der Schicht.',
    ],
    correctIndex: 2,
    sourcePage: '13',
    explanation:
      'BW-Leitfaden S. 13: Händereinigung vor Arbeitsbeginn, nach jedem Toilettengang, nach Arbeiten mit rohem Fleisch / Fisch / Geflügel / Eiern; zusätzlich nach Husten / Niesen.',
  },
  {
    // REVIEW: Florian
    id: 2,
    sectionId: 1,
    quality: 'extension',
    text: 'Was gilt am Burger-Stand für Rauchen und Dampfen?',
    options: [
      'Im Lebensmittelbereich nicht erlaubt.',
      'Erlaubt, wenn man danach die Hände wäscht.',
      'Erlaubt in den Pausen am Stand.',
      'Erlaubt, wenn der Wind in die richtige Richtung weht.',
    ],
    correctIndex: 0,
    sourcePage: '13',
    explanation:
      'BW-Leitfaden S. 13: "Rauchen und Dampfen ist im Bereich der Lebensmittelherstellung und -behandlung nicht erlaubt."',
  },
  {
    // REVIEW: Florian
    id: 3,
    sectionId: 1,
    quality: 'extension',
    text: 'Du hast Magen-Darm-Beschwerden. Was tust du?',
    options: [
      'Trotzdem helfen — die Beschwerden sind ja nicht stark.',
      'Erst die Hände waschen und dann ganz normal weiterarbeiten.',
      'Nicht mit Lebensmitteln arbeiten — Magen-Darm-Erkrankungen können über Lebensmittel übertragen werden.',
      'Nur in den Verkauf gehen, nicht in die Zubereitung.',
    ],
    correctIndex: 2,
    sourcePage: '13',
    explanation:
      'BW-Leitfaden S. 13: Personen mit Magen-Darm-Erkrankungen (auch Salmonellenausscheider) dürfen nicht mit der Herstellung, Be- und Verarbeitung von Lebensmitteln beschäftigt werden.',
  },

  // ---- Sektion 2: Verkaufsstand & Ausstattung (2 Fragen) ----
  {
    // REVIEW: Florian
    id: 4,
    sectionId: 2,
    quality: 'core',
    text: 'Wie muss ein Verkaufsstand für Lebensmittel gestaltet sein?',
    options: [
      'Offen, damit die Gäste alles gut sehen können.',
      'Überdacht, an drei Seiten geschlossen, mit Spuckschutz an der Vorderseite.',
      'Nur überdacht, Wände sind nicht nötig.',
      'Mit einer Glasvitrine, die rundum offen ist.',
    ],
    correctIndex: 1,
    sourcePage: '5',
    explanation:
      'BW-Leitfaden S. 5: Stände sollten überdacht sowie seitlich und rückwärts umschlossen sein; offene Lebensmittel werden an der Vorderseite durch Spuckschutz vor Husten / Niesen geschützt.',
  },
  {
    // REVIEW: Florian
    id: 5,
    sectionId: 2,
    quality: 'extension',
    text: 'Eis, das in Getränke kommt — woraus muss es hergestellt sein?',
    options: [
      'Aus Quellwasser aus dem Brunnen.',
      'Aus Trinkwasser.',
      'Aus Mineralwasser ohne Kohlensäure.',
      'Egal, solange es kalt ist.',
    ],
    correctIndex: 1,
    sourcePage: '10',
    explanation:
      'BW-Leitfaden S. 10: "Eis, das direkt mit Lebensmitteln in Berührung kommt oder in Getränke gegeben wird, muss aus Trinkwasser hergestellt sein."',
  },

  // ---- Sektion 3: Lagerung & Kühlkette (3 Fragen) ----
  {
    // REVIEW: Florian
    id: 6,
    sectionId: 3,
    quality: 'core',
    text: 'Bei welcher Temperatur müssen die tiefgefrorenen Hackfleisch-Patties spätestens gelagert werden?',
    options: ['−5 °C', '−10 °C', '−18 °C', '0 °C'],
    correctIndex: 2,
    sourcePage: '9',
    explanation:
      'BW-Leitfaden S. 9, Tabelle 2: Tiefkühlprodukte werden bei mindestens −18 °C gelagert. Das gilt auch für unsere TK-Hackfleisch-Patties — die bleiben bis zur Verwendung im Gefrierer.',
  },
  {
    // REVIEW: Florian
    id: 7,
    sectionId: 3,
    quality: 'extension',
    text: 'Steak und Wurst lagern wir im Kühlschrank. Welche maximale Lagertemperatur gilt laut DIN 10508 / BW-Leitfaden für Frischfleisch und Fleischerzeugnisse?',
    options: ['4 °C', '7 °C', '10 °C', '15 °C'],
    correctIndex: 1,
    sourcePage: '9',
    explanation:
      'BW-Leitfaden S. 9, Tabelle 2: Frischfleisch und Fleischerzeugnisse höchstens 7 °C. Hackfleisch / Geflügel ist strenger (4 °C), Tiefkühlware noch strenger (−18 °C).',
  },
  {
    // REVIEW: Florian
    id: 8,
    sectionId: 3,
    quality: 'extension',
    text: 'Wie müssen rohe Lebensmittel (Patties, Steak, Wurst) gegenüber verzehrfertigen Lebensmitteln gelagert werden?',
    options: [
      'Im selben Behälter, damit nichts verloren geht.',
      'Getrennt, räumlich oder in verschlossenen Behältnissen.',
      'Egal, solange beides kalt ist.',
      'Verzehrfertiges unten, Rohes oben.',
    ],
    correctIndex: 1,
    sourcePage: '8',
    explanation:
      'BW-Leitfaden S. 8: Rohware muss getrennt von verzehrfertigen Lebensmitteln gelagert werden — räumlich getrennt oder durch geeignete, verschlossene Behälter.',
  },

  // ---- Sektion 4: Zubereitung & Kreuzkontamination (3 Fragen) ----
  {
    // REVIEW: Florian
    id: 9,
    sectionId: 4,
    quality: 'core',
    text: 'Wie müssen unsere Hackfleisch-Patties zubereitet werden?',
    options: [
      'Medium, mit rosa Kern.',
      'Vollständig durcherhitzt — keine Abgabe von rohen oder halbgaren Patties.',
      'Roh anbieten, der Gast brutzelt sie selbst.',
      'Nur an der Oberfläche angebraten.',
    ],
    correctIndex: 1,
    sourcePage: '10',
    explanation:
      'BW-Leitfaden S. 10: Erzeugnisse aus Hackfleisch dürfen auf Vereins- und Straßenfesten nur abgegeben werden, wenn sie vollständig durcherhitzt sind. Salmonellen- und EHEC-Risiko.',
  },
  {
    // REVIEW: Florian
    id: 10,
    sectionId: 4,
    quality: 'extension',
    text: 'Bei welcher Temperatur sollte die Fritteuse für die Pommes maximal eingestellt werden?',
    options: ['150 °C', '175 °C', '200 °C', '225 °C'],
    correctIndex: 1,
    sourcePage: '8',
    explanation:
      'BW-Leitfaden S. 8: Fritteuse auf maximal 175 °C einstellen, um die unerwünschte Acrylamidbildung zu vermeiden.',
  },
  {
    // REVIEW: Florian
    id: 11,
    sectionId: 4,
    quality: 'extension',
    text: 'Du hast rohe Patties / Steak / Wurst verarbeitet. Was machst du, bevor du das Burger-Brötchen schneidest?',
    options: [
      'Egal — die Hitze beim Braten tötet alles ab.',
      'Kurz mit dem Geschirrtuch abwischen reicht.',
      'Separates Schneidebrett und Messer verwenden bzw. das benutzte vorher gründlich reinigen.',
      'Mit kaltem Wasser kurz abspülen.',
    ],
    correctIndex: 2,
    sourcePage: '10',
    explanation:
      'BW-Leitfaden S. 10: Für rohes Fleisch und Geflügel separate Bereiche, Arbeitsgeräte und intakte Schneidebretter; Spülmaschinen zur Reinigung und Bakterienabtötung.',
  },

  // ---- Sektion 5: Ausgabe & verzehrfertige Lebensmittel (3 Fragen) ----
  {
    // REVIEW: Florian
    id: 12,
    sectionId: 5,
    quality: 'core',
    text: 'Du reichst einem Gast den fertigen Burger an. Was ist erlaubt?',
    options: [
      'Burger-Brötchen mit der bloßen Hand greifen, wenn die Hände sauber sind.',
      'Mit Zange, Servietten oder Einmalhandschuhen anfassen — kein direkter Handkontakt.',
      'Mit dem Ellbogen schieben.',
      'Geld und Burger in derselben Bewegung übergeben.',
    ],
    correctIndex: 1,
    sourcePage: '8',
    explanation:
      'BW-Leitfaden S. 8: Bei verzehrfertigen Lebensmitteln ist hohes Hygieneniveau gefordert; sofern möglich Besteck verwenden, ansonsten sorgfältige Händereinigung.',
  },
  {
    // REVIEW: Florian
    id: 13,
    sectionId: 5,
    quality: 'extension',
    text: 'Wann musst du Einmalhandschuhe wechseln?',
    options: [
      'Erst, wenn sie sichtbar kaputt sind.',
      'Nach einer Stunde Tragezeit, sonst nie.',
      'Regelmäßig, spätestens nach Kontakt mit unsauberen Bereichen wie Verpackung, Müll oder Geld.',
      'Gar nicht — Einmalhandschuhe ersetzen das Händewaschen.',
    ],
    correctIndex: 2,
    sourcePage: '8',
    explanation:
      'BW-Leitfaden S. 8: Einmalhandschuhe verschmutzen genauso schnell wie bloße Hände und sind regelmäßig zu wechseln.',
  },
  {
    // REVIEW: Florian
    id: 14,
    sectionId: 5,
    quality: 'extension',
    text: 'Wie gibst du Pommes nach dem Frittieren an den Gast aus?',
    options: [
      'Mit der bloßen Hand in die Tüte fallen lassen.',
      'Mit Zange oder Schaufel.',
      'Aus der Fritteuse direkt in die Hand des Gastes kippen.',
      'Auf einem Stück Küchenpapier auf der Theke abkühlen lassen und der Gast greift selbst.',
    ],
    correctIndex: 1,
    sourcePage: '8',
    explanation:
      'BW-Leitfaden S. 8: Verzehrfertige Lebensmittel sollten möglichst mit Besteck (Zange, Schaufel, Löffel) angefasst werden — kein bloßer Handkontakt.',
  },

  // ---- Sektion 6: Getränke & Eis (3 Fragen) ----
  {
    // REVIEW: Florian
    id: 15,
    sectionId: 6,
    quality: 'core',
    text: 'Wie entnimmst du Eiswürfel für die Cola?',
    options: [
      'Mit der bloßen Hand — geht am schnellsten.',
      'Mit dem Eisportionierer oder einem sauberen Löffel; nicht mit der Hand.',
      'Mit dem Trinkglas selbst.',
      'Mit einer Serviette greifen.',
    ],
    correctIndex: 1,
    sourcePage: '10',
    explanation:
      'BW-Leitfaden S. 10: Das Eis soll nicht mit der bloßen Hand berührt werden; saubere Portionier- und Aufbewahrungshilfen verwenden.',
  },
  {
    // REVIEW: Florian
    id: 16,
    sectionId: 6,
    quality: 'extension',
    text: 'Wer ist für die Hygiene der Zapfanlage am Stand verantwortlich?',
    options: [
      'Nur der Verleiher.',
      'Niemand — die Zapfanlage reinigt sich selbst.',
      'Verleiher und Nutzer (Entleiher) gemeinsam; der Nutzer muss vor Betrieb Reinigung / ggf. Desinfektion sicherstellen.',
      'Nur die Brauerei.',
    ],
    correctIndex: 2,
    sourcePage: '10',
    explanation:
      'BW-Leitfaden S. 10: Für die Hygiene der Anlagen sind Verleiher und Entleiher verantwortlich; der Nutzer beschafft die Reinigungsanleitung und reinigt vor Betrieb.',
  },
  {
    // REVIEW: Florian
    id: 17,
    sectionId: 6,
    quality: 'extension',
    text: 'Welche Anforderung gilt für das Wasser, das wir am Stand für Getränke und zum Reinigen nutzen?',
    options: [
      'Es muss Trinkwasserqualität haben.',
      'Gartenschlauch-Wasser reicht aus.',
      'Regenwasser ist auch in Ordnung.',
      'Beliebiges Leitungswasser, egal welcher Schlauch verwendet wird.',
    ],
    correctIndex: 0,
    sourcePage: '6',
    explanation:
      'BW-Leitfaden S. 6: Wasser für Herstellung, Behandlung und Reinigung muss Trinkwasserqualität haben. Schläuche müssen lebensmittelgeeignet sein (KTW-A / DVGW W270). Gartenschläuche sind nicht zulässig.',
  },

  // ---- Sektion 7: Reinigung, Abfall & Schädlinge (3 Fragen) ----
  {
    // REVIEW: Florian
    id: 18,
    sectionId: 7,
    quality: 'core',
    text: 'Am KjG-Stand haben wir eine Spülmaschine. Wenn sie ausfällt oder ein Topf von Hand gespült werden muss, wie funktioniert das richtige Zwei-Becken-Verfahren?',
    options: [
      'Ein Becken kaltes Wasser, fertig.',
      'Erstes Becken: so heißes Wasser wie möglich mit Spülmittel — zweites Becken: sauberes, warmes Nachspülwasser.',
      'Erstes Becken: Nachspülwasser — zweites Becken: Spülmittel.',
      'Beide Becken nur mit Spülmittel ohne Klarspülen.',
    ],
    correctIndex: 1,
    sourcePage: '6',
    explanation:
      'BW-Leitfaden S. 6: Manuelles Spülen erfolgt in zwei Becken — eines mit heißem Wasser und Spülmittel, eines mit sauberem, warmem Nachspülwasser. Die Spülmaschine ist die erste Wahl, das Zwei-Becken-Verfahren der Backup-Plan.',
  },
  {
    // REVIEW: Florian
    id: 19,
    sectionId: 7,
    quality: 'extension',
    text: 'Wie schützt du Lebensmittel und Stand vor Schädlingen (Insekten, Vögel)?',
    options: [
      'Lebensmittel stets abdecken, Müll geschlossen halten, Stand sauber halten.',
      'Insektenspray direkt auf die Lebensmittel sprühen.',
      'Vögel mit der Hand verscheuchen, Reste sind ok.',
      'Türen offen lassen, damit die Insekten auch wieder rauskommen.',
    ],
    correctIndex: 0,
    sourcePage: '7',
    explanation:
      'KjG-Hygieneplan + BW-Leitfaden S. 7: Lebensmittel abdecken, Müll geschlossen lagern, Stand sauber halten; Insektizide gehören nicht in den Lebensmittelbereich.',
  },
  {
    // REVIEW: Florian
    id: 20,
    sectionId: 7,
    quality: 'extension',
    text: 'Wie werden Lebensmittelabfälle am Stand entsorgt?',
    options: [
      'In die Biotonne — geht am schnellsten.',
      'In Mehrwegbehälter ohne Deckel, direkt neben den Lebensmitteln.',
      'In dicht schließende Müllsammelbehälter, räumlich von Lebensmitteln getrennt; Speiseabfälle nicht in die Biotonne.',
      'Auf dem Boden hinter dem Stand sammeln.',
    ],
    correctIndex: 2,
    sourcePage: '7',
    explanation:
      'BW-Leitfaden S. 7: Lebensmittelabfälle in dicht schließende, ordnungsgemäße Müllsammelbehälter; eine Entsorgung über die Biotonne ist nicht zulässig.',
  },
];

export function getQuestionById(id: number): Question | undefined {
  return questions.find((q) => q.id === id);
}

/** Strip server-only fields before sending to client. */
export function toPublic(q: Question): QuestionPublic {
  return {
    id: q.id,
    sectionId: q.sectionId,
    text: q.text,
    options: q.options,
  };
}
