/**
 * Fragenpool fuer die KjG-Hygieneschulung.
 *
 * 20 Multiple-Choice-Fragen, jede mit Quellverweis auf den BW-Leitfaden
 * "Leitfaden fuer den Umgang mit Lebensmitteln auf Vereins- und Strassenfesten",
 * Ministerium fuer Laendlichen Raum und Verbraucherschutz Baden-Wuerttemberg
 * (Stand Januar 2025).
 *
 * Verteilung: 4 dichte Sektionen (3, 4, 7, 8) je 3 Fragen,
 *             4 duenne Sektionen (1, 2, 5, 6) je 2 Fragen, Summe = 20.
 * Pro Sektion mindestens eine Frage mit quality="core" -- diese wird beim
 * stratifizierten Sampling garantiert gezogen.
 *
 * REVIEW: Alle 20 Fragen muessen vor Go-Live von Florian Straub fachlich
 * gegen den BW-Leitfaden gegengeprueft werden.
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
  // ---- Sektion 1: Personalhygiene & Handhygiene (2 Fragen) ----
  {
    // REVIEW: Florian
    id: 1,
    sectionId: 1,
    quality: 'core',
    text: 'Wann musst du deine Haende waschen? Welche Antwort ist am vollstaendigsten?',
    options: [
      'Nur vor Arbeitsbeginn.',
      'Nur nach dem Toilettengang.',
      'Vor Arbeitsbeginn, nach Toilettengang, nach Kontakt mit rohen Lebensmitteln, nach Niesen oder Husten.',
      'Nur am Ende der Schicht.',
    ],
    correctIndex: 2,
    sourcePage: '13',
    explanation:
      'BW-Leitfaden S. 13: Haendereinigung vor Arbeitsbeginn, nach jedem Toilettengang, nach Arbeiten mit rohem Fleisch / Fisch / Gefluegel / Eiern; zusaetzlich nach Husten / Niesen.',
  },
  {
    // REVIEW: Florian
    id: 2,
    sectionId: 1,
    quality: 'core',
    text: 'Was gilt am Burger-Stand fuer Rauchen und Dampfen?',
    options: [
      'Im Lebensmittelbereich nicht erlaubt.',
      'Erlaubt, wenn man danach die Haende waescht.',
      'Erlaubt in den Pausen am Stand.',
      'Erlaubt, wenn der Wind in die richtige Richtung weht.',
    ],
    correctIndex: 0,
    sourcePage: '13',
    explanation:
      'BW-Leitfaden S. 13: "Rauchen und Dampfen ist im Bereich der Lebensmittelherstellung und -behandlung nicht erlaubt."',
  },

  // ---- Sektion 2: Verkaufsstand & Ausstattung (2 Fragen) ----
  {
    // REVIEW: Florian
    id: 3,
    sectionId: 2,
    quality: 'core',
    text: 'Wie muss ein Verkaufsstand fuer Lebensmittel gestaltet sein?',
    options: [
      'Offen, damit die Gaeste alles gut sehen koennen.',
      'Ueberdacht, an drei Seiten geschlossen, mit Spuckschutz an der Vorderseite.',
      'Nur ueberdacht, Wuende sind nicht noetig.',
      'Mit einer Glasvitrine, die rundum offen ist.',
    ],
    correctIndex: 1,
    sourcePage: '5',
    explanation:
      'BW-Leitfaden S. 5: Staende sollten ueberdacht sowie seitlich und rueckwaerts umschlossen sein; offene Lebensmittel werden an der Vorderseite durch Spuckschutz vor Husten / Niesen geschuetzt.',
  },
  {
    // REVIEW: Florian
    id: 4,
    sectionId: 2,
    quality: 'core',
    text: 'Eis, das in Getraenke kommt — woraus muss es hergestellt sein?',
    options: [
      'Aus Quellwasser aus dem Brunnen.',
      'Aus Trinkwasser.',
      'Aus Mineralwasser ohne Kohlensaeure.',
      'Egal, solange es kalt ist.',
    ],
    correctIndex: 1,
    sourcePage: '10',
    explanation:
      'BW-Leitfaden S. 10: "Eis, das direkt mit Lebensmitteln in Beruehrung kommt oder in Getraenke gegeben wird, muss aus Trinkwasser hergestellt sein."',
  },

  // ---- Sektion 3: Lagerung & Kuehlkette (3 Fragen) ----
  {
    // REVIEW: Florian
    id: 5,
    sectionId: 3,
    quality: 'core',
    text: 'Welche Temperatur darf das Hackfleisch fuer die Burger maximal haben (DIN 10508 / BW-Tabelle 2)?',
    options: ['7 °C', '10 °C', '4 °C', '0 °C'],
    correctIndex: 2,
    sourcePage: '9',
    explanation:
      'BW-Leitfaden S. 9, Tabelle 2: Gefluegel- und Hackfleischerzeugnisse maximal 4 °C.',
  },
  {
    // REVIEW: Florian
    id: 6,
    sectionId: 3,
    quality: 'extension',
    text: 'Bei welcher Temperatur muessen TK-Pommes spaetestens gelagert werden?',
    options: ['−5 °C', '−10 °C', '−18 °C', '0 °C'],
    correctIndex: 2,
    sourcePage: '9',
    explanation:
      'BW-Leitfaden S. 9, Tabelle 2: Tiefkuehlprodukte werden bei mindestens −18 °C gelagert.',
  },
  {
    // REVIEW: Florian
    id: 7,
    sectionId: 3,
    quality: 'extension',
    text: 'Wie muessen rohe Lebensmittel gegenueber verzehrfertigen Lebensmitteln gelagert werden?',
    options: [
      'Im selben Behaelter, damit nichts verloren geht.',
      'Getrennt, raeumlich oder in verschlossenen Behaeltnissen.',
      'Egal, solange beides kalt ist.',
      'Verzehrfertiges unten, Rohes oben.',
    ],
    correctIndex: 1,
    sourcePage: '8',
    explanation:
      'BW-Leitfaden S. 8: Rohware muss getrennt von verzehrfertigen Lebensmitteln gelagert werden — raeumlich getrennt oder durch geeignete, verschlossene Behaelter.',
  },

  // ---- Sektion 4: Zubereitung & Kreuzkontamination (3 Fragen) ----
  {
    // REVIEW: Florian
    id: 8,
    sectionId: 4,
    quality: 'core',
    text: 'Wie muss das Hackfleisch fuer die Burger zubereitet werden?',
    options: [
      'Medium, mit rosa Kern.',
      'Vollstaendig durcherhitzt — keine Abgabe von rohem oder halbgarem Hackfleisch.',
      'Roh anbieten, der Gast brutzelt es selbst.',
      'Nur an der Oberflaeche angebraten.',
    ],
    correctIndex: 1,
    sourcePage: '10',
    explanation:
      'BW-Leitfaden S. 10: Erzeugnisse aus Hackfleisch duerfen auf Vereins- und Strassenfesten nur abgegeben werden, wenn sie vollstaendig durcherhitzt sind. Salmonellen- und EHEC-Risiko.',
  },
  {
    // REVIEW: Florian
    id: 9,
    sectionId: 4,
    quality: 'extension',
    text: 'Bei welcher Temperatur sollte die Fritteuse fuer die Pommes maximal eingestellt werden?',
    options: ['150 °C', '175 °C', '200 °C', '225 °C'],
    correctIndex: 1,
    sourcePage: '8',
    explanation:
      'BW-Leitfaden S. 8: Fritteuse auf maximal 175 °C einstellen, um die unerwuenschte Acrylamidbildung zu vermeiden.',
  },
  {
    // REVIEW: Florian
    id: 10,
    sectionId: 4,
    quality: 'extension',
    text: 'Du verarbeitest rohes Hackfleisch fuer die Burger. Was machst du mit Schneidebrett und Messer, bevor du das Burger-Broetchen schneidest?',
    options: [
      'Egal — die Hitze beim Braten toetet alles ab.',
      'Kurz mit dem Geschirrtuch abwischen reicht.',
      'Separates Schneidebrett und separates Messer verwenden bzw. vorher gruendlich reinigen.',
      'Mit kaltem Wasser kurz abspuelen.',
    ],
    correctIndex: 2,
    sourcePage: '10',
    explanation:
      'BW-Leitfaden S. 10: Fuer rohes Fleisch und Gefluegel separate Bereiche, Arbeitsgeraete und intakte Schneidebretter; Spuelmaschinen zur Reinigung und Bakterienabtoetung.',
  },

  // ---- Sektion 5: Ausgabe & verzehrfertige Lebensmittel (2 Fragen) ----
  {
    // REVIEW: Florian
    id: 11,
    sectionId: 5,
    quality: 'core',
    text: 'Du reichst einem Gast den Burger an. Was ist erlaubt?',
    options: [
      'Burger-Broetchen mit der blossen Hand greifen, wenn die Haende sauber sind.',
      'Mit Zange, Servietten oder Einmalhandschuhen anfassen — kein direkter Handkontakt.',
      'Mit dem Ellbogen schieben.',
      'Geld und Burger in derselben Bewegung uebergeben.',
    ],
    correctIndex: 1,
    sourcePage: '8',
    explanation:
      'BW-Leitfaden S. 8: Bei verzehrfertigen Lebensmitteln ist hohes Hygieneniveau gefordert; sofern moeglich Besteck verwenden, ansonsten sorgfaeltige Haendereinigung.',
  },
  {
    // REVIEW: Florian
    id: 12,
    sectionId: 5,
    quality: 'core',
    text: 'Wann musst du Einmalhandschuhe wechseln?',
    options: [
      'Erst, wenn sie sichtbar kaputt sind.',
      'Nach einer Stunde Tragezeit, sonst nie.',
      'Regelmaessig, spaetestens nach Kontakt mit unsauberen Bereichen wie Verpackung, Muell oder Geld.',
      'Gar nicht — Einmalhandschuhe ersetzen das Haendewaschen.',
    ],
    correctIndex: 2,
    sourcePage: '8',
    explanation:
      'BW-Leitfaden S. 8: Einmalhandschuhe verschmutzen genauso schnell wie blosse Haende und sind regelmaessig zu wechseln.',
  },

  // ---- Sektion 6: Getraenke & Eis (2 Fragen) ----
  {
    // REVIEW: Florian
    id: 13,
    sectionId: 6,
    quality: 'core',
    text: 'Wie entnimmst du Eiswuerfel fuer die Cola?',
    options: [
      'Mit der blossen Hand — geht am schnellsten.',
      'Mit dem Eisportionierer oder einem sauberen Loeffel; nicht mit der Hand.',
      'Mit dem Trinkglas selbst.',
      'Mit einer Serviette greifen.',
    ],
    correctIndex: 1,
    sourcePage: '10',
    explanation:
      'BW-Leitfaden S. 10: Das Eis soll nicht mit der blossen Hand beruehrt werden; saubere Portionier- und Aufbewahrungshilfen verwenden.',
  },
  {
    // REVIEW: Florian
    id: 14,
    sectionId: 6,
    quality: 'core',
    text: 'Wer ist fuer die Hygiene der Zapfanlage am Stand verantwortlich?',
    options: [
      'Nur der Verleiher.',
      'Niemand — die Zapfanlage reinigt sich selbst.',
      'Verleiher und Nutzer (Entleiher) gemeinsam; der Nutzer muss vor Betrieb Reinigung / ggf. Desinfektion sicherstellen.',
      'Nur die Brauerei.',
    ],
    correctIndex: 2,
    sourcePage: '10',
    explanation:
      'BW-Leitfaden S. 10: Fuer die Hygiene der Anlagen sind Verleiher und Entleiher verantwortlich; der Nutzer beschafft die Reinigungsanleitung und reinigt vor Betrieb.',
  },

  // ---- Sektion 7: Kennzeichnung & Allergene (3 Fragen) ----
  {
    // REVIEW: Florian
    id: 15,
    sectionId: 7,
    quality: 'core',
    text: 'Beim KjG-Dorffest 2026 — gilt die schriftliche Allergenkennzeichnungspflicht der LMIV?',
    options: [
      'Ja, immer, ohne Ausnahme.',
      'Nein — Dorffeste sind im BW-Leitfaden als Beispiel fuer die Wohltaetigkeitsausnahme genannt, sofern gelegentlich, kleiner Rahmen, gemeinnuetzig.',
      'Nur wenn mehr als 100 Burger verkauft werden.',
      'Nur, wenn der Stand laenger als 2 Stunden geoeffnet ist.',
    ],
    correctIndex: 1,
    sourcePage: '11',
    explanation:
      'BW-Leitfaden S. 11: Gelegentliche, gemeinnuetzige Veranstaltungen im kleinen Rahmen (genannt: Dorffeste, Kirchengemeindefeste, Schulfeste, ...) sind von der LMIV-Kennzeichnungspflicht ausgenommen.',
  },
  {
    // REVIEW: Florian
    id: 16,
    sectionId: 7,
    quality: 'extension',
    text: 'Wie viele Allergengruppen sind nach EU-Recht kennzeichnungspflichtig?',
    options: ['7', '10', '14', '20'],
    correctIndex: 2,
    sourcePage: '12',
    explanation:
      'BW-Leitfaden S. 12: Auflistung der 14 kennzeichnungspflichtigen Allergengruppen (glutenhaltiges Getreide, Krebstiere, Eier, Fisch, Erdnuesse, Soja, Milch, Schalenfruechte, Sellerie, Senf, Sesam, Schwefeldioxid/Sulfite, Lupinen, Weichtiere).',
  },
  {
    // REVIEW: Florian
    id: 17,
    sectionId: 7,
    quality: 'extension',
    text: 'Welche der folgenden Zutaten ist ein kennzeichnungspflichtiges Allergen?',
    options: ['Tomaten', 'Sellerie', 'Kartoffeln', 'Reis'],
    correctIndex: 1,
    sourcePage: '12',
    explanation:
      'BW-Leitfaden S. 12: Sellerie und Erzeugnisse daraus zaehlen zu den 14 kennzeichnungspflichtigen Allergenen. Tomaten, Kartoffeln und Reis nicht.',
  },

  // ---- Sektion 8: Reinigung, Abfall & Schaedlinge (3 Fragen) ----
  {
    // REVIEW: Florian
    id: 18,
    sectionId: 8,
    quality: 'core',
    text: 'Am KjG-Stand wird manuell gespuelt. Wie funktioniert das richtige Zwei-Becken-Verfahren?',
    options: [
      'Ein Becken kaltes Wasser, fertig.',
      'Erstes Becken: so heisses Wasser wie moeglich mit Spuelmittel — zweites Becken: sauberes, warmes Nachspuelwasser.',
      'Erstes Becken: Nachspuelwasser — zweites Becken: Spuelmittel.',
      'Beide Becken nur mit Spuelmittel ohne Klarspuelen.',
    ],
    correctIndex: 1,
    sourcePage: '6',
    explanation:
      'BW-Leitfaden S. 6: Manuelles Spuelen erfolgt in zwei Becken — eines mit heissem Wasser und Spuelmittel, eines mit sauberem, warmem Nachspuelwasser.',
  },
  {
    // REVIEW: Florian
    id: 19,
    sectionId: 8,
    quality: 'extension',
    text: 'Wie schuetzt du Lebensmittel und Stand vor Schaedlingen (Insekten, Voegel)?',
    options: [
      'Lebensmittel stets abdecken, Muell geschlossen halten, Stand sauber halten.',
      'Insektenspray direkt auf die Lebensmittel spruehen.',
      'Voegel mit der Hand verscheuchen, Reste sind ok.',
      'Tueren offen lassen, damit die Insekten auch wieder rauskommen.',
    ],
    correctIndex: 0,
    sourcePage: '7',
    explanation:
      'KjG-Hygieneplan + BW-Leitfaden S. 7: Lebensmittel abdecken, Muell geschlossen lagern, Stand sauber halten; Insektizide gehoeren nicht in den Lebensmittelbereich.',
  },
  {
    // REVIEW: Florian
    id: 20,
    sectionId: 8,
    quality: 'extension',
    text: 'Wie werden Lebensmittelabfaelle am Stand entsorgt?',
    options: [
      'In die Biotonne — geht am schnellsten.',
      'In Mehrwegbehaelter ohne Deckel, direkt neben den Lebensmitteln.',
      'In dicht schliessende Muellsammelbehaelter, raeumlich von Lebensmitteln getrennt; Speiseabfaelle nicht in die Biotonne.',
      'Auf dem Boden hinter dem Stand sammeln.',
    ],
    correctIndex: 2,
    sourcePage: '7',
    explanation:
      'BW-Leitfaden S. 7: Lebensmittelabfaelle in dicht schliessende, ordnungsgemaesse Muellsammelbehaelter; eine Entsorgung ueber die Biotonne ist nicht zulaessig.',
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
