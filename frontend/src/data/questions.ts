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
 * Designprinzipien:
 *   - Alle 4 Optionen pro Frage haben vergleichbare Länge — keine
 *     Hinweise über offensichtlich kurze/lange korrekte Antwort.
 *   - Falsch-Antworten sind plausible Missverständnisse (häufig in der
 *     Praxis zu hören), keine offensichtlichen Nonsense-Aussagen.
 *   - Die korrekte Position ist gleichmäßig auf A/B/C/D verteilt (5/5/5/5).
 *   - Zielgruppe: Jugendliche ab 14 Jahre.
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
    text: 'Wann musst du dir während der Schicht die Hände waschen?',
    options: [
      'Einmal vor Schichtbeginn und einmal nach dem Mittagessen.',
      'Vor Arbeitsbeginn, nach Toilette, nach Rohwarekontakt, nach Niesen.',
      'Vor jedem neuen Burger und nach jedem Geldwechsel mit dem Gast.',
      'Beim Schichtwechsel und immer dann, wenn die Hände sichtbar dreckig sind.',
    ],
    correctIndex: 1,
    sourcePage: '13',
    explanation:
      'BW-Leitfaden S. 13: Hände waschen vor Arbeitsbeginn, nach jedem Toilettengang, nach Arbeiten mit rohem Fleisch/Fisch/Geflügel/Eiern und nach Husten/Niesen. "Sichtbar dreckig" reicht nicht — es geht um unsichtbare Keime.',
  },
  {
    // REVIEW: Florian
    id: 2,
    sectionId: 1,
    quality: 'extension',
    text: 'Was gilt am Burger-Stand für Rauchen und E-Zigaretten?',
    options: [
      'Erlaubt, wenn man danach gründlich die Hände wäscht.',
      'Erlaubt in den Pausen, solange man außerhalb des Standes raucht.',
      'Erlaubt nur für volljährige Helfer und nur abseits der Theke.',
      'Im gesamten Lebensmittelbereich grundsätzlich verboten.',
    ],
    correctIndex: 3,
    sourcePage: '13',
    explanation:
      'BW-Leitfaden S. 13: "Rauchen und Dampfen ist im Bereich der Lebensmittelherstellung und -behandlung nicht erlaubt." Auch Pausen außerhalb sind nur okay, wenn der Rauchbereich klar abseits liegt — am Stand selbst gar nichts.',
  },
  {
    // REVIEW: Florian
    id: 3,
    sectionId: 1,
    quality: 'extension',
    text: 'Du hast seit gestern Durchfall, fühlst dich aber heute schon besser. Was tust du?',
    options: [
      'Hände noch gründlicher waschen und nur an die Kasse, nicht in die Zubereitung.',
      'Mit Einmalhandschuhen weiterarbeiten — die schützen die Lebensmittel.',
      'Eine Maske aufsetzen und alles ist gut.',
      'Nicht mit Lebensmitteln arbeiten, auch nicht im Verkauf oder an der Theke.',
    ],
    correctIndex: 3,
    sourcePage: '13',
    explanation:
      'BW-Leitfaden S. 13: Personen mit Magen-Darm-Erkrankungen dürfen nicht mit Herstellung, Be- oder Verarbeitung von Lebensmitteln beschäftigt werden — Verkauf und Ausgabe zählen ebenfalls dazu, weil dabei verzehrfertige Speisen berührt werden.',
  },

  // ---- Sektion 2: Verkaufsstand & Ausstattung (2 Fragen) ----
  {
    // REVIEW: Florian
    id: 4,
    sectionId: 2,
    quality: 'core',
    text: 'Wie muss ein Verkaufsstand für Lebensmittel aufgebaut sein?',
    options: [
      'Überdacht, seitlich/hinten geschlossen, Spuckschutz an der Theke.',
      'Vorne offen, hinten ein Sichtschutz für die Helfer.',
      'Komplett offen, damit Wärme und Gerüche abziehen können.',
      'Nur überdacht — die Seiten werden durch die Verkaufstische gebildet.',
    ],
    correctIndex: 0,
    sourcePage: '5',
    explanation:
      'BW-Leitfaden S. 5: Stände sollten überdacht und seitlich/rückwärtig umschlossen sein; offene Lebensmittel an der Vorderseite durch Spuckschutz vor Husten/Niesen schützen. Tische als "Wände" reichen nicht — Staub und Spritzer kämen ungehindert dran.',
  },
  {
    // REVIEW: Florian
    id: 5,
    sectionId: 2,
    quality: 'extension',
    text: 'Welches Wasser darf für Eiswürfel in den Getränken verwendet werden?',
    options: [
      'Stilles Mineralwasser aus Flaschen, das ist am sichersten.',
      'Gefiltertes Brunnenwasser — der natürliche Geschmack ist beliebt.',
      'Abgekochtes Wasser aus dem Wasserkocher, das ist keimfrei.',
      'Trinkwasser in Trinkwasserqualität, anderes ist nicht zulässig.',
    ],
    correctIndex: 3,
    sourcePage: '10',
    explanation:
      'BW-Leitfaden S. 10: "Eis, das direkt mit Lebensmitteln in Berührung kommt oder in Getränke gegeben wird, muss aus Trinkwasser hergestellt sein." Mineralwasser oder Brunnenwasser haben andere Anforderungen und sind nicht das, was der Leitfaden verlangt.',
  },

  // ---- Sektion 3: Lagerung & Kühlkette (3 Fragen) ----
  {
    // REVIEW: Florian
    id: 6,
    sectionId: 3,
    quality: 'core',
    text: 'Welche maximale Lagertemperatur gilt für die tiefgefrorenen Hackfleisch-Patties?',
    options: [
      '0 °C — kalt genug für Fleisch.',
      '−5 °C — der gängige Wert für TK.',
      '−18 °C — Vorgabe für Tiefkühlware.',
      '−10 °C — Standard im Haushaltsgefrierer.',
    ],
    correctIndex: 2,
    sourcePage: '9',
    explanation:
      'BW-Leitfaden S. 9, Tabelle 2: Tiefkühlprodukte werden bei höchstens −18 °C gelagert — egal ob Industrie- oder Haushaltsgefrierer. Wärmer ist nicht erlaubt.',
  },
  {
    // REVIEW: Florian
    id: 7,
    sectionId: 3,
    quality: 'extension',
    text: 'Frisches Steak und Bratwurst lagern wir im Kühlschrank. Welche maximale Temperatur erlaubt der BW-Leitfaden?',
    options: [
      'Höchstens 4 °C — der Wert für Hackfleisch und Geflügel.',
      'Höchstens 7 °C — Wert für Frischfleisch und Fleischerzeugnisse.',
      'Höchstens 10 °C — wie für allgemeine Kühlware üblich.',
      'Höchstens 12 °C, wenn das Fleisch noch am gleichen Tag verbraucht wird.',
    ],
    correctIndex: 1,
    sourcePage: '9',
    explanation:
      'BW-Leitfaden S. 9, Tabelle 2: Frischfleisch und Fleischerzeugnisse höchstens 7 °C. 4 °C wäre die strengere Stufe für Hackfleisch/Geflügel — fürs Steak nicht erforderlich. 10 °C oder mehr wären zu warm.',
  },
  {
    // REVIEW: Florian
    id: 8,
    sectionId: 3,
    quality: 'extension',
    text: 'Wo lagerst du rohes Fleisch (Patties, Steak, Wurst) gegenüber verzehrfertigen Lebensmitteln?',
    options: [
      'Im selben Fach — Hauptsache, alles ist gekühlt.',
      'Rohes ganz oben, Fertiges unten, damit man es beim Greifen unterscheidet.',
      'Räumlich getrennt oder in dicht verschlossenen Behältern.',
      'Alles zusammen in Folie eingewickelt im gleichen Fach.',
    ],
    correctIndex: 2,
    sourcePage: '8',
    explanation:
      'BW-Leitfaden S. 8: Rohware muss von verzehrfertigen Lebensmitteln getrennt gelagert werden — räumlich oder durch verschlossene Behälter. Die alte Küchenregel "Rohes unten" stimmt für die Tropf-Richtung, ist im BW-Leitfaden aber nicht die Vorgabe — entscheidend ist die saubere Trennung.',
  },

  // ---- Sektion 4: Zubereitung & Kreuzkontamination (3 Fragen) ----
  {
    // REVIEW: Florian
    id: 9,
    sectionId: 4,
    quality: 'core',
    text: 'Wie müssen unsere Burger-Patties (Hackfleisch) zubereitet werden?',
    options: [
      'Außen scharf angebraten, innen leicht rosa — Restaurant-Stil.',
      'Vollständig durchgegart, mindestens 70 °C im Kern.',
      'Auf Wunsch des Gastes auch "medium" oder "rare".',
      'Außen kross, innen saftig-rosa wie bei einem guten Steak.',
    ],
    correctIndex: 1,
    sourcePage: '10',
    explanation:
      'BW-Leitfaden S. 10: Hackfleischerzeugnisse dürfen auf Vereins- und Straßenfesten nur durchgegart abgegeben werden (Kerntemperatur ~70 °C). Im Steak sitzen Bakterien nur an der Oberfläche — im Hackfleisch sind sie überall, weil das Fleisch zerkleinert wurde. "Medium" ist beim Hack nicht zulässig.',
  },
  {
    // REVIEW: Florian
    id: 10,
    sectionId: 4,
    quality: 'extension',
    text: 'Auf welcher maximalen Temperatur sollte die Pommes-Fritteuse laufen?',
    options: [
      '150 °C — das schont das Frittierfett am längsten.',
      '200 °C — Pommes werden so schneller knusprig.',
      '175 °C — Grenze gegen die Bildung von Acrylamid.',
      '220 °C — wie in vielen Schnellrestaurants üblich.',
    ],
    correctIndex: 2,
    sourcePage: '8',
    explanation:
      'BW-Leitfaden S. 8: Fritteuse auf maximal 175 °C einstellen, um die Acrylamidbildung zu reduzieren. Höher knusprigt nicht besser — es entstehen nur mehr gesundheitlich bedenkliche Stoffe.',
  },
  {
    // REVIEW: Florian
    id: 11,
    sectionId: 4,
    quality: 'extension',
    text: 'Du hast gerade rohes Fleisch (Patty, Steak, Wurst) geschnitten. Was machst du, bevor du das Burger-Brötchen schneidest?',
    options: [
      'Brett und Messer kurz mit kaltem Wasser abspülen.',
      'Mit dem Küchenkrepp einmal feucht abwischen.',
      'Egal — die Hitze beim Braten tötet alles ab.',
      'Anderes Brett und Messer nehmen oder beides gründlich abwaschen.',
    ],
    correctIndex: 3,
    sourcePage: '10',
    explanation:
      'BW-Leitfaden S. 10: Für rohes Fleisch/Geflügel separate Bereiche, Arbeitsgeräte und Schneidebretter — oder gründliche Reinigung dazwischen. Kaltes Wasser oder ein Wisch reichen nicht; das Brötchen wird ja nicht mehr erhitzt.',
  },

  // ---- Sektion 5: Ausgabe & verzehrfertige Lebensmittel (3 Fragen) ----
  {
    // REVIEW: Florian
    id: 12,
    sectionId: 5,
    quality: 'core',
    text: 'Wie reichst du einem Gast den fertigen Burger an?',
    options: [
      'Mit sauberer Hand am Brötchen — kurz reichen, kein Drama.',
      'Auf Backpapier ablegen, der Gast greift selbst zum Burger.',
      'Mit Zange, Servietten oder Einmalhandschuhen — kein direkter Handkontakt.',
      'Mit dem Burgerwender direkt vom Rost auf den Pappteller des Gastes.',
    ],
    correctIndex: 2,
    sourcePage: '8',
    explanation:
      'BW-Leitfaden S. 8: Verzehrfertige Lebensmittel sollten möglichst mit Besteck angefasst werden. "Saubere Hand" ist kein zuverlässiger Ersatz, weil Keime unsichtbar sind. Backpapier hilft nicht, wenn man trotzdem reingreift.',
  },
  {
    // REVIEW: Florian
    id: 13,
    sectionId: 5,
    quality: 'extension',
    text: 'Wann musst du die Einmalhandschuhe wechseln?',
    options: [
      'Wenn sie sichtbar verschmutzt oder beschädigt sind.',
      'Bei jedem Pausenende und beim Schichtwechsel.',
      'Nach Kontakt mit unsauberen Bereichen — Müll, Geld, Verpackungsmaterial.',
      'Einmal pro Tag — sonst sind es ja keine "Einmal"-Handschuhe.',
    ],
    correctIndex: 2,
    sourcePage: '8',
    explanation:
      'BW-Leitfaden S. 8: Einmalhandschuhe verschmutzen genauso schnell wie bloße Hände. Entscheidend ist der Auslöser — Kontakt mit unsauberen Dingen — nicht eine feste Zeitspanne. "Sichtbar verschmutzt" ist zu spät.',
  },
  {
    // REVIEW: Florian
    id: 14,
    sectionId: 5,
    quality: 'extension',
    text: 'Wie gibst du frisch frittierte Pommes an den Gast aus?',
    options: [
      'Mit Schaufel oder Zange direkt in die Tüte portionieren.',
      'Aus dem Frittierkorb auf einem Tablett abkühlen lassen, Gast greift selbst.',
      'Mit dem Korb direkt in die Tüte des Gastes kippen.',
      'Auf einem Stück Küchenpapier in der Auslage, Gast bedient sich.',
    ],
    correctIndex: 0,
    sourcePage: '8',
    explanation:
      'BW-Leitfaden S. 8: Verzehrfertige Lebensmittel möglichst mit Besteck (Zange, Schaufel, Löffel) anfassen. "Selbstbedienung" aus der Auslage führt zu Handkontakt durch wechselnde Gäste — das ist gerade nicht erlaubt.',
  },

  // ---- Sektion 6: Getränke & Eis (3 Fragen) ----
  {
    // REVIEW: Florian
    id: 15,
    sectionId: 6,
    quality: 'core',
    text: 'Wie entnimmst du Eiswürfel für eine Cola?',
    options: [
      'Mit dem sauberen Eisportionierer oder einem dafür reservierten Löffel.',
      'Mit dem Glas direkt durchs Eis ziehen — schneller geht\'s nicht.',
      'Mit einer sauberen Serviette greifen, das ist hygienisch.',
      'Mit der Hand, solange Einmalhandschuhe getragen werden.',
    ],
    correctIndex: 0,
    sourcePage: '10',
    explanation:
      'BW-Leitfaden S. 10: Das Eis soll nicht mit der bloßen Hand berührt werden — auch nicht mit Handschuh, weil der ebenso verschmutzt ist wie die Hand. Glas durchs Eis ziehen birgt das Risiko von Glasbruch direkt im Eis.',
  },
  {
    // REVIEW: Florian
    id: 16,
    sectionId: 6,
    quality: 'extension',
    text: 'Was machst du mit Trinkgläsern oder Bechern, die abgesplittert oder beschädigt sind?',
    options: [
      'Mit Klebeband flicken und weiter benutzen.',
      'Aussortieren und nicht mehr verwenden — Verletzungsgefahr.',
      'Nur noch für nicht-alkoholische Getränke verwenden.',
      'Aufheben und am Saisonende komplett entsorgen.',
    ],
    correctIndex: 1,
    sourcePage: '5',
    explanation:
      'BW-Leitfaden S. 5 + 6: Beschädigte oder gesplitterte Behältnisse dürfen nicht verwendet werden. Splitter können ins Getränk gelangen und Verletzungen verursachen — kein "weiter mit Klebeband" und auch nicht "nur Cola".',
  },
  {
    // REVIEW: Florian
    id: 17,
    sectionId: 6,
    quality: 'extension',
    text: 'Welche Anforderung gilt für das Wasser am Stand (für Getränke und zum Reinigen)?',
    options: [
      'Trinkwasserqualität — Gartenschläuche sind nicht zulässig.',
      'Mineralwasser aus Flaschen ist verpflichtend.',
      'Mit Filterkanne aufbereitetes Leitungswasser reicht.',
      'Klares Brunnenwasser ist erlaubt, wenn es vor Ort geprüft wurde.',
    ],
    correctIndex: 0,
    sourcePage: '6',
    explanation:
      'BW-Leitfaden S. 6: Wasser für Herstellung, Behandlung und Reinigung muss Trinkwasserqualität haben. Schläuche müssen lebensmittelgeeignet sein (KTW-A / DVGW W270). Gartenschläuche und Brunnenwasser sind nicht zulässig.',
  },

  // ---- Sektion 7: Reinigung, Abfall & Schädlinge (3 Fragen) ----
  {
    // REVIEW: Florian
    id: 18,
    sectionId: 7,
    quality: 'core',
    text: 'Welcher Reinigungsrhythmus gilt am Stand für Arbeitsflächen, Schneidebretter und Griffe?',
    options: [
      'Einmal vor Eröffnung und einmal am Abend reicht aus.',
      'Vor Beginn wischen, während des Betriebs zwischendurch, am Ende gründlich.',
      'Nur wenn Flächen sichtbar verschmutzt sind oder Gäste sich beschweren.',
      'Alle vier Stunden nach festem Zeitplan — der Anlass spielt keine Rolle.',
    ],
    correctIndex: 1,
    sourcePage: '5',
    explanation:
      'BW-Leitfaden S. 5 + KjG-Hygieneplan: Reinigung in drei Phasen — vor Beginn (Anfangsreinigung), während des Betriebs (Zwischenreinigung von Brettern, Messern, Flächen) und nach Schluss (Schlussreinigung). Nur "wenn sichtbar dreckig" ist zu lasch, ein fester 4-Stunden-Takt ohne Anlass ergibt keinen Sinn.',
  },
  {
    // REVIEW: Florian
    id: 19,
    sectionId: 7,
    quality: 'extension',
    text: 'Wie schützt du Lebensmittel und Stand vor Insekten und Vögeln?',
    options: [
      'Mit Insektenspray die Standumgebung am Morgen vorbeugend behandeln.',
      'Mit Klebefallen direkt neben den Lebensmitteln aufstellen.',
      'Mit Räucherstäbchen oder Duftkerzen am Stand — Insekten mögen das nicht.',
      'Lebensmittel abdecken, Müll geschlossen, Stand sauber und Krümel-frei halten.',
    ],
    correctIndex: 3,
    sourcePage: '7',
    explanation:
      'BW-Leitfaden S. 7 + KjG-Hygieneplan: Lebensmittel abdecken, Müll geschlossen lagern, Stand sauber halten — Hygiene statt Chemie. Insektizide gehören NICHT in den Lebensmittelbereich, Klebefallen erst recht nicht direkt neben Speisen.',
  },
  {
    // REVIEW: Florian
    id: 20,
    sectionId: 7,
    quality: 'extension',
    text: 'Wie werden Lebensmittelabfälle am Stand entsorgt?',
    options: [
      'In dicht schließenden Müllsammelbehältern, getrennt von Lebensmitteln; nicht in die Biotonne.',
      'In die normale Biotonne, das ist die klimafreundlichste Lösung.',
      'In offenen Eimern hinter dem Stand, am Ende einmal komplett geleert.',
      'Erst sammeln und dann gemeinsam mit den Speiseresten der Gäste in den Restmüll.',
    ],
    correctIndex: 0,
    sourcePage: '7',
    explanation:
      'BW-Leitfaden S. 7: Lebensmittelabfälle gehören in dicht schließende, ordnungsgemäße Müllsammelbehälter, räumlich getrennt von den Lebensmitteln. Eine Entsorgung über die Biotonne ist ausdrücklich NICHT zulässig — auch wenn es nachhaltig klingt.',
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
