/**
 * Fachlicher Katalog: Analysedimensionen, Plattformen, Rollen.
 *
 * Aus diesen Definitionen und wenigen Kennwerten pro Kunde werden vollständige
 * Analysedatensätze erzeugt (siehe data/build.js). So bleibt jeder Datensatz
 * konsistent und trotzdem individuell – ohne tausende Zeilen Literale.
 */

export const KATEGORIEN = [
  {
    id: 'positionierung',
    label: 'Positionierung',
    kurz: 'Position',
    gruppe: 'Strategie',
    frage: 'Gibt es einen eigenen, verteidigbaren Platz im Markt?',
  },
  {
    id: 'verstaendlichkeit',
    label: 'Verständlichkeit',
    kurz: 'Verständ.',
    gruppe: 'Kommunikation',
    frage: 'Wird der wirtschaftliche Nutzen schnell nachvollziehbar?',
  },
  {
    id: 'differenzierung',
    label: 'Differenzierung',
    kurz: 'Differenz.',
    gruppe: 'Strategie',
    frage: 'Sind Unterschiede belegt und in Kundenvorteil übersetzt?',
  },
  {
    id: 'marktaktivierung',
    label: 'Marktaktivierung',
    kurz: 'Aktivierung',
    gruppe: 'Markt',
    frage: 'Erzeugt eine aufeinander aufbauende Sequenz Nachfrage?',
  },
  {
    id: 'website',
    label: 'Website',
    kurz: 'Website',
    gruppe: 'Kommunikation',
    frage: 'Führt die Website vom Interesse zur Anfrage?',
  },
  {
    id: 'vertrieb',
    label: 'Vertrieb',
    kurz: 'Vertrieb',
    gruppe: 'Markt',
    frage: 'Argumentiert der Vertrieb wie die Außenkommunikation?',
  },
  {
    id: 'social',
    label: 'Social Media',
    kurz: 'Social',
    gruppe: 'Kommunikation',
    frage: 'Erzeugen die Kanäle Nachfrage statt nur Reichweite?',
  },
  {
    id: 'zielgruppen',
    label: 'Zielgruppen',
    kurz: 'Zielgr.',
    gruppe: 'Strategie',
    frage: 'Ist klar, welche Zielgruppe zuerst bedient wird?',
  },
  {
    id: 'nutzenargumentation',
    label: 'Nutzenargumentation',
    kurz: 'Nutzen',
    gruppe: 'Kommunikation',
    frage: 'Ist der Nutzen wirtschaftlich statt nur fachlich formuliert?',
  },
  {
    id: 'wettbewerb',
    label: 'Wettbewerb',
    kurz: 'Wettbew.',
    gruppe: 'Markt',
    frage: 'Ist die Abgrenzung zu Alternativen belegt?',
  },
]

export const KATEGORIE_MAP = Object.fromEntries(KATEGORIEN.map((k) => [k.id, k]))

/**
 * Textbausteine je Kategorie und Bewertungsstufe.
 * Reihenfolge: kritisch (<40), auffällig (<58), solide (<75), stark (≥75)
 */
export const BEFUNDE = {
  positionierung: {
    beobachtung: [
      'Das Angebot wird über Produkteigenschaften beschrieben, nicht über einen Platz im Markt.',
      'Eine Positionierung existiert, ist aber so breit formuliert, dass sie auf mehrere Wettbewerber passt.',
      'Die Position ist tragfähig, verliert an den Rändern der Zielgruppen aber an Schärfe.',
      'Klare, verteidigbare Position, die in Kommunikation und Vertrieb konsistent gespiegelt wird.',
    ],
    ursache: [
      'Es wurde nie entschieden, für wen das Angebot zuerst gedacht ist.',
      'Die Positionierung wurde aus dem Produkt abgeleitet statt aus der Entscheidungssituation des Kunden.',
      'Die Kernaussage ist gesetzt, wird aber je Kanal unterschiedlich ausgelegt.',
      'Positionierung ist dokumentiert und wird aktiv gepflegt.',
    ],
    auswirkung: [
      'Das Angebot wird über den Preis verglichen, obwohl es das nicht sein müsste.',
      'Interessenten ordnen das Angebot falsch ein und steigen früh aus.',
      'In Randsegmenten entstehen längere Entscheidungswege.',
      'Die Position stützt Preis und Argumentation.',
    ],
    empfehlung: [
      'Primäre Zielgruppe verbindlich festlegen und Positionierungssatz neu formulieren.',
      'Positionierung auf ein Segment zuspitzen und in allen Kanälen vereinheitlichen.',
      'Randsegmente separat adressieren, Kernaussage unverändert lassen.',
      'Position halten und bei Sortimentserweiterungen erneut prüfen.',
    ],
  },
  verstaendlichkeit: {
    beobachtung: [
      'Das Produkt wird fachlich korrekt, aber wirtschaftlich nicht nachvollziehbar erklärt.',
      'Der Nutzen erschließt sich erst nach Erklärung – zu spät für die erste Entscheidung.',
      'Die Nutzenlogik steht, die Übersetzung in Entscheidersprache ist unvollständig.',
      'Der wirtschaftliche Nutzen wird ohne Vorwissen schnell verstanden.',
    ],
    ursache: [
      'Die Kommunikation ist aus der Entwicklungsperspektive geschrieben.',
      'Fachbegriffe werden vorausgesetzt, die die Zielgruppe nicht teilt.',
      'Der Einstieg ist verständlich, die Tiefe springt zu schnell ins Fachliche.',
      'Texte wurden gegen Entscheiderfragen geprüft.',
    ],
    auswirkung: [
      'Entscheider steigen aus, bevor die Substanz überhaupt sichtbar wird.',
      'Der Vertrieb muss Grundlagen erklären, statt zu verkaufen.',
      'Vereinzelt entstehen Rückfragen, die den Abschluss verzögern.',
      'Gespräche starten auf der richtigen Ebene.',
    ],
    empfehlung: [
      'Nutzenargumentation in Entscheidersprache übersetzen und Erklärstrecke aufbauen.',
      'Einstiegsseiten auf eine Kernaussage reduzieren, Fachtiefe nachlagern.',
      'Fachliche Passagen mit wirtschaftlicher Einordnung ergänzen.',
      'Verständlichkeit bei neuen Inhalten weiter prüfen.',
    ],
  },
  differenzierung: {
    beobachtung: [
      'Unterschiede werden behauptet, aber weder belegt noch in Kundenvorteil übersetzt.',
      'Belege sind vorhanden, wirken im Markt aber nicht, weil sie nicht eingesetzt werden.',
      'Differenzierung ist erkennbar, hält dem direkten Preisvergleich noch nicht stand.',
      'Belegte Unterschiede, konsequent als Kundenvorteil formuliert.',
    ],
    ursache: [
      'Es fehlt eine Übersetzung von Eigenschaft zu Konsequenz für den Kunden.',
      'Studien und Prüfberichte liegen vor, sind aber nicht aufbereitet.',
      'Der Vorteil ist formuliert, aber nicht quantifiziert.',
      'Belege sind Teil der Standardargumentation.',
    ],
    auswirkung: [
      'Am Ende entscheidet der Preis.',
      'Der Substanzvorsprung bleibt unsichtbar.',
      'In Ausschreibungen fehlt das entscheidende Argument.',
      'Preisdruck wird abgefedert.',
    ],
    empfehlung: [
      'Vorhandene Belege sichten und in drei belastbare Vorteilsaussagen überführen.',
      'Studienergebnisse in Vertriebsmaterial und Website einarbeiten.',
      'Vorteil mit einer Kennzahl hinterlegen.',
      'Belege regelmäßig aktualisieren.',
    ],
  },
  marktaktivierung: {
    beobachtung: [
      'Es gibt Aktivitäten, aber keine aufeinander aufbauende Sequenz.',
      'Einzelmaßnahmen laufen parallel, ohne sich gegenseitig zu verstärken.',
      'Die Sequenz steht, die Übergabe an den Vertrieb verliert Substanz.',
      'Aufeinander aufbauende Aktivierung mit messbarer Nachfrage.',
    ],
    ursache: [
      'Maßnahmen werden nach Kanal geplant, nicht nach Entscheidungsweg.',
      'Es fehlt ein definierter nächster Schritt nach dem Erstkontakt.',
      'Die Übergabepunkte sind nicht dokumentiert.',
      'Der Aktivierungsplan ist verbindlich.',
    ],
    auswirkung: [
      'Sichtbarkeit entsteht, Nachfrage nicht.',
      'Kontakte versanden zwischen Marketing und Vertrieb.',
      'Ein Teil der Anfragen wird zu spät bearbeitet.',
      'Der Funnel ist durchgängig.',
    ],
    empfehlung: [
      'Kanäle zu einer Sequenz verbinden und Nachfassschritte definieren.',
      'Übergabe zwischen Marketing und Vertrieb schriftlich festlegen.',
      'Reaktionszeiten messen und verbindlich machen.',
      'Sequenz beibehalten, quartalsweise nachschärfen.',
    ],
  },
  website: {
    beobachtung: [
      'Die Website beschreibt das Unternehmen, führt aber zu keiner klaren Handlung.',
      'Der Einstieg ist stark, der Weg zur Anfrage bricht in der Mitte ab.',
      'Die Struktur trägt, einzelne Unterseiten fallen inhaltlich ab.',
      'Klare Führung vom Einstieg bis zur Anfrage.',
    ],
    ursache: [
      'Es fehlt eine definierte Zielhandlung je Seite.',
      'Zu viele gleichwertige Handlungsaufforderungen konkurrieren.',
      'Einzelne Seiten wurden nachträglich ergänzt und nicht eingepasst.',
      'Seitenziele sind dokumentiert.',
    ],
    auswirkung: [
      'Besucher informieren sich und verschwinden ohne Kontakt.',
      'Die Anfragequote bleibt unter dem Möglichen.',
      'Einzelne Themen erzeugen keine Anschlusshandlung.',
      'Anfragen kommen qualifiziert herein.',
    ],
    empfehlung: [
      'Je Seite eine Zielhandlung definieren und Einstiegsseite neu strukturieren.',
      'Handlungsaufforderungen auf eine pro Seite reduzieren.',
      'Schwache Unterseiten überarbeiten oder zusammenführen.',
      'Struktur halten, Inhalte turnusmäßig prüfen.',
    ],
  },
  vertrieb: {
    beobachtung: [
      'Der Vertrieb argumentiert deutlich anders als die Außenkommunikation.',
      'Es gibt Vertriebsunterlagen, sie werden aber unterschiedlich ausgelegt.',
      'Die Argumentation ist stimmig, Einwandbehandlung ist uneinheitlich.',
      'Vertrieb und Kommunikation nutzen dieselbe Argumentation.',
    ],
    ursache: [
      'Es existiert kein gemeinsames Argumentationsgerüst.',
      'Unterlagen sind veraltet und werden individuell ergänzt.',
      'Für typische Einwände fehlen abgestimmte Antworten.',
      'Regelmäßige Abstimmung ist etabliert.',
    ],
    auswirkung: [
      'Interessenten hören zwei verschiedene Versprechen.',
      'Der Abschluss hängt stark von der einzelnen Person ab.',
      'Verhandlungen dauern länger als nötig.',
      'Der Prozess ist reproduzierbar.',
    ],
    empfehlung: [
      'Gemeinsames Argumentationsgerüst erstellen und mit dem Vertrieb testen.',
      'Vertriebsunterlagen auf die aktuelle Kernaussage aktualisieren.',
      'Einwandbehandlung für die fünf häufigsten Fälle festlegen.',
      'Abstimmung fortführen.',
    ],
  },
  social: {
    beobachtung: [
      'Die Kanäle erzeugen Reichweite, aber keinen erkennbaren Kaufanlass.',
      'Die Frequenz ist unregelmäßig, die Bildsprache uneinheitlich.',
      'Die Kanäle sind konsistent, es fehlt die Verbindung zum Angebot.',
      'Kanäle zahlen erkennbar auf Nachfrage ein.',
    ],
    ursache: [
      'Inhalte entstehen anlassbezogen statt aus einem Themenplan.',
      'Es fehlt eine Redaktionsplanung mit festen Formaten.',
      'Handlungsaufforderungen fehlen weitgehend.',
      'Redaktionsplan und Zielsetzung sind etabliert.',
    ],
    auswirkung: [
      'Aufwand entsteht ohne messbaren Beitrag.',
      'Die Marke wirkt weniger professionell als das Produkt.',
      'Interessierte finden keinen nächsten Schritt.',
      'Kanäle liefern qualifizierte Kontakte.',
    ],
    empfehlung: [
      'Drei feste Formate definieren und mit Handlungsaufforderung versehen.',
      'Redaktionsplan mit fester Frequenz aufsetzen.',
      'Jeden Beitrag mit einem nächsten Schritt verknüpfen.',
      'Formate beibehalten, Themen quartalsweise planen.',
    ],
  },
  zielgruppen: {
    beobachtung: [
      'Mehrere Zielgruppen werden parallel und gleichwertig angesprochen.',
      'Eine Priorisierung existiert auf dem Papier, nicht in der Kommunikation.',
      'Die Hauptzielgruppe ist gesetzt, Nebengruppen sind unscharf.',
      'Klare Priorität mit passender Ansprache je Gruppe.',
    ],
    ursache: [
      'Die Entscheidung, wen man zuerst gewinnen will, wurde vermieden.',
      'Ressourcen werden gleichmäßig verteilt statt fokussiert.',
      'Für Nebengruppen fehlt eigenes Material.',
      'Priorisierung ist verbindlich.',
    ],
    auswirkung: [
      'Keine Gruppe wird vollständig überzeugt.',
      'Botschaften bleiben allgemein.',
      'Nebengruppen erzeugen Aufwand ohne Ertrag.',
      'Mittel wirken dort, wo sie den größten Hebel haben.',
    ],
    empfehlung: [
      'Primäre Zielgruppe festlegen und Kommunikation zuerst darauf ausrichten.',
      'Ressourcen für zwei Quartale auf die Hauptgruppe konzentrieren.',
      'Für Nebengruppen eigene, schlanke Strecke aufbauen.',
      'Priorisierung jährlich überprüfen.',
    ],
  },
  nutzenargumentation: {
    beobachtung: [
      'Der Nutzen wird als Produkteigenschaft formuliert, nicht als Ergebnis.',
      'Nutzenaussagen sind vorhanden, aber nicht quantifiziert.',
      'Die Argumentation trägt, der wirtschaftliche Bezug fehlt teilweise.',
      'Nutzen ist als messbares Ergebnis formuliert.',
    ],
    ursache: [
      'Es fehlt die Übersetzung von Eigenschaft zu Konsequenz.',
      'Kennzahlen aus Projekten werden nicht erhoben.',
      'Der Bezug zur Kostenseite fehlt.',
      'Ergebnisse werden systematisch erfasst.',
    ],
    auswirkung: [
      'Der Wert wird nicht in Zahlungsbereitschaft übersetzt.',
      'Argumente wirken austauschbar.',
      'In der Freigabe fehlt die wirtschaftliche Begründung.',
      'Preisgespräche verlaufen sachlich.',
    ],
    empfehlung: [
      'Nutzen in messbare Ergebnisgrößen überführen.',
      'Drei Referenzergebnisse erheben und einsetzen.',
      'Wirtschaftliche Einordnung ergänzen.',
      'Kennzahlen weiter pflegen.',
    ],
  },
  wettbewerb: {
    beobachtung: [
      'Die Abgrenzung zu Alternativen ist nicht dokumentiert.',
      'Wettbewerber sind bekannt, die Abgrenzung ist aber nicht belegt.',
      'Die Abgrenzung steht, wird im Vertrieb aber selten genutzt.',
      'Belegte Abgrenzung, im Vertrieb verankert.',
    ],
    ursache: [
      'Es findet keine strukturierte Wettbewerbsbeobachtung statt.',
      'Vergleiche entstehen ad hoc im Einzelgespräch.',
      'Das Vergleichsmaterial ist nicht griffbereit.',
      'Wettbewerbsbeobachtung ist etabliert.',
    ],
    auswirkung: [
      'Im direkten Vergleich fehlt das entscheidende Argument.',
      'Preisverhandlungen starten aus der Defensive.',
      'Chancen im Vergleich werden nicht genutzt.',
      'Der Vergleich wird aktiv gesucht.',
    ],
    empfehlung: [
      'Wettbewerbsvergleich für die drei relevantesten Alternativen aufbauen.',
      'Vergleichsargumentation für den Vertrieb bereitstellen.',
      'Vergleichsmaterial in den Angebotsprozess einbinden.',
      'Beobachtung quartalsweise fortschreiben.',
    ],
  },
}

export const PLATTFORMEN = [
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'fachpresse', label: 'Fachmedien' },
]

export const DOKUMENT_TYPEN = {
  pdf: { label: 'PDF', tone: 'danger' },
  docx: { label: 'Word', tone: 'info' },
  xlsx: { label: 'Excel', tone: 'ok' },
  pptx: { label: 'Präsentation', tone: 'warn' },
  bild: { label: 'Bild', tone: 'neutral' },
}

/** Stufe 0–3 aus einem Score – Index in die Textbausteine. */
export function stufeIndex(score) {
  if (score < 40) return 0
  if (score < 58) return 1
  if (score < 75) return 2
  return 3
}
