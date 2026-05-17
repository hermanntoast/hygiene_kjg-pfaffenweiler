export function DatenschutzNotice() {
  return (
    <details className="card text-sm">
      <summary className="font-medium cursor-pointer">Datenschutzhinweis (DSGVO)</summary>
      <div className="mt-3 space-y-2 text-slate-700 leading-relaxed">
        <p>
          Wir speichern fuer diese Schulung deinen <strong>Vor- und Nachnamen</strong>{' '}
          sowie optional deine <strong>E-Mail-Adresse</strong>, deine Quiz-Antworten,
          dein Ergebnis und — bei Bestehen — das PDF-Zertifikat.
        </p>
        <p>
          Aufbewahrungsdauer: <strong>36 Monate</strong> (analog Belehrungspraxis nach
          Infektionsschutzgesetz § 43). Danach werden die Daten automatisch geloescht.
        </p>
        <p>
          Bestehst du, wird ein <strong>Verifikations-Hash</strong> erzeugt. Unter der
          Verify-URL sind <em>nur Initialen + Datum + Status</em> oeffentlich abrufbar
          — kein voller Name.
        </p>
        <p>
          Recht auf vorzeitige Loeschung: per E-Mail an die KjG-Vorstandschaft.
        </p>
      </div>
    </details>
  );
}
