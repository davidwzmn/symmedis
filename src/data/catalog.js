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
      'Interessenten müssen selbst einordnen, warum das Angebot relevant ist.',
      'Der Einstieg in Gespräche bleibt erklärungsintensiv.',
      'Die Wirkung variiert zwischen Kanälen.',
      'Die Position erleichtert Auswahl und Verkauf.',
    ],
    empfehlung: [
      'Entscheidungskontext und primäre Zielgruppe festlegen.',
      'Positionierung auf eine konkrete Kaufsituation zuspitzen.',
      'Kernaussage kanalübergreifend vereinheitlichen.',
      'Positionierung regelmäßig gegen Marktveränderungen prüfen.',
    ],
  },
  verstaendlichkeit: {
    beobachtung: [
      'Die Kommunikation setzt Fachwissen voraus und beginnt mit Produktmerkmalen.',
      'Der Nutzen ist erkennbar, wird aber erst spät konkret.',
      'Die Hauptaussage ist verständlich, einzelne Touchpoints bleiben technisch.',
      'Nutzen und Relevanz werden unmittelbar verständlich.',
    ],
    ursache: [
      'Interne Produktsprache dominiert die Außenkommunikation.',
      'Die Botschaft wurde nicht konsequent aus Kundensicht aufgebaut.',
      'Einzelne Inhalte wurden nicht an die zentrale Narrative angepasst.',
      'Kommunikation wird aus Kundensicht redaktionell geführt.',
    ],
    auswirkung: [
      'Relevante Interessenten brechen ab, bevor der Nutzen klar wird.',
      'Die Conversion bleibt unter Potenzial.',
      'Einzelne Kanäle verlieren Wirkung.',
      'Interessenten verstehen schnell, warum sie weiterlesen sollten.',
    ],
    empfehlung: [
      'Einstieg konsequent auf Problem, Folge und Nutzen ausrichten.',
      'Botschaftshierarchie aus Kundensicht neu ordnen.',
      'Technische Touchpoints redaktionell vereinheitlichen.',
      'Verständlichkeit mit echten Zielgruppen regelmäßig testen.',
    ],
  },
  differenzierung: {
    beobachtung: [
      'Aussagen ähneln denen des Wettbewerbs und bleiben generisch.',
      'Unterschiede werden genannt, aber selten belegt.',
      'Differenzierungsmerkmale sind vorhanden, werden jedoch nicht überall genutzt.',
      'Die Abgrenzung ist klar, relevant und belegt.',
    ],
    ursache: [
      'Vergleichsmaßstab und relevante Alternativen wurden nicht systematisch erhoben.',
      'Belege sind intern vorhanden, aber nicht in Kommunikation und Vertrieb übersetzt.',
      'Die Argumentation ist nicht in allen Assets aktualisiert.',
      'Wettbewerbsbeobachtung und Belegführung sind etabliert.',
    ],
    auswirkung: [
      'Kaufentscheidungen verlagern sich auf Preis oder Bekanntheit.',
      'Der Mehrwert wird in Vergleichen zu wenig sichtbar.',
      'Potenzial bleibt an einzelnen Touchpoints liegen.',
      'Die Kaufentscheidung wird auf relevante Unterschiede gelenkt.',
    ],
    empfehlung: [
      'Relevante Alternativen und Entscheidungskriterien systematisch erfassen.',
      'Unterschiede mit nachvollziehbaren Belegen verbinden.',
      'Differenzierungsargumente in allen Kernassets synchronisieren.',
      'Belege und Wettbewerbsvergleich regelmäßig aktualisieren.',
    ],
  },
  marktaktivierung: {
    beobachtung: [
      'Maßnahmen laufen isoliert und erzeugen keine wiedererkennbare Nachfragebewegung.',
      'Es gibt Kampagnen, aber wenig Verbindung zwischen den Kontaktpunkten.',
      'Aktivitäten bauen teilweise aufeinander auf.',
      'Die Aktivierung folgt einer klaren Sequenz vom Bedarf zur Anfrage.',
    ],
    ursache: [
      'Kanäle und Maßnahmen werden einzeln geplant.',
      'Es fehlt eine gemeinsame Journey mit definierten Übergängen.',
      'Sequenzen sind vorhanden, aber nicht überall operationalisiert.',
      'Journey, Trigger und Übergänge sind klar gesteuert.',
    ],
    auswirkung: [
      'Reichweite erzeugt wenig qualifizierte Nachfrage.',
      'Interessenten verlieren zwischen Touchpoints den Faden.',
      'Conversion hängt stark vom Einstiegskanal ab.',
      'Kontaktpunkte verstärken sich gegenseitig.',
    ],
    empfehlung: [
      'Kernsequenz vom Problemimpuls bis zur Anfrage definieren.',
      'Kanäle entlang einer gemeinsamen Journey verbinden.',
      'Übergänge und CTAs vereinheitlichen.',
      'Sequenzen anhand realer Conversion-Daten optimieren.',
    ],
  },
  website: {
    beobachtung: [
      'Die Website informiert, führt aber nicht klar zur nächsten Handlung.',
      'CTAs sind vorhanden, konkurrieren jedoch miteinander.',
      'Die Nutzerführung ist grundsätzlich schlüssig, einzelne Seiten bremsen.',
      'Die Website führt klar vom Interesse zur qualifizierten Anfrage.',
    ],
    ursache: [
      'Seitenstruktur und Conversion-Ziel wurden getrennt entwickelt.',
      'Zu viele gleichrangige Handlungsoptionen schwächen die Führung.',
      'Einzelne Seiten folgen noch älteren Mustern.',
      'Informationsarchitektur und Conversion-Ziel werden gemeinsam optimiert.',
    ],
    auswirkung: [
      'Besucher verlassen die Seite ohne klaren nächsten Schritt.',
      'Qualifizierte Nachfrage wird nicht konsequent abgeholt.',
      'Conversion variiert zwischen Seiten.',
      'Interessenten werden zuverlässig zur passenden Aktion geführt.',
    ],
    empfehlung: [
      'Pro Seitentyp ein klares Conversion-Ziel definieren.',
      'CTA-Hierarchie vereinfachen und priorisieren.',
      'Bremsende Seitentypen gezielt überarbeiten.',
      'Conversion-Pfade kontinuierlich messen und verbessern.',
    ],
  },
  vertrieb: {
    beobachtung: [
      'Vertrieb und Marketing verwenden unterschiedliche Nutzenargumente.',
      'Kernaussagen stimmen teilweise überein, Belege variieren jedoch.',
      'Die Argumentation ist weitgehend konsistent.',
      'Vertrieb und Marketing arbeiten mit derselben belegten Narrative.',
    ],
    ursache: [
      'Es gibt keinen gemeinsamen Messaging-Standard.',
      'Materialien und Gesprächsleitfäden werden getrennt gepflegt.',
      'Einzelne Altunterlagen sind noch im Umlauf.',
      'Messaging und Sales Enablement werden gemeinsam geführt.',
    ],
    auswirkung: [
      'Interessenten erleben Brüche zwischen Außenkommunikation und Gespräch.',
      'Belege werden nicht konsistent genutzt.',
      'Einzelne Gespräche verlieren an Klarheit.',
      'Der Kaufprozess wirkt konsistent und vertrauenswürdig.',
    ],
    empfehlung: [
      'Gemeinsames Messaging-Framework für Marketing und Vertrieb etablieren.',
      'Vertriebsunterlagen und Gesprächsleitfäden synchronisieren.',
      'Altmaterial bereinigen und zentrale Assets versionieren.',
      'Messaging regelmäßig mit Einwänden aus echten Gesprächen aktualisieren.',
    ],
  },
  social: {
    beobachtung: [
      'Social Media erzeugt Aktivität, aber wenig erkennbare Nachfrage.',
      'Themen sind relevant, führen jedoch selten zu einem nächsten Schritt.',
      'Content und CTA greifen überwiegend ineinander.',
      'Social Media unterstützt systematisch Nachfrage und Vertriebsdialoge.',
    ],
    ursache: [
      'Content wird nach Veröffentlichungsrhythmus statt nach Journey geplant.',
      'CTAs und Anschlusswege sind nicht konsequent definiert.',
      'Einzelne Formate sind noch nicht in die Journey integriert.',
      'Content, CTA und Anschlussprozess sind gemeinsam gesteuert.',
    ],
    auswirkung: [
      'Reichweite lässt sich kaum in Geschäftswirkung übersetzen.',
      'Interessierte Personen bleiben ohne nächsten Schritt.',
      'Einzelne Beiträge verlieren Conversion-Potenzial.',
      'Relevante Reichweite wird gezielt in Gespräche überführt.',
    ],
    empfehlung: [
      'Content entlang der Kaufreise statt nur nach Themen planen.',
      'Pro Format einen klaren Anschlussweg definieren.',
      'Schwache Formate mit Journey und CTA verbinden.',
      'Content anhand von Nachfrage- und Gesprächssignalen optimieren.',
    ],
  },
  zielgruppen: {
    beobachtung: [
      'Mehrere Zielgruppen werden gleichzeitig und ähnlich angesprochen.',
      'Segmente sind benannt, aber nicht klar priorisiert.',
      'Primärsegmente sind definiert, einzelne Botschaften bleiben breit.',
      'Priorisierte Zielgruppen haben eigene, relevante Entscheidungslogiken.',
    ],
    ursache: [
      'Historisches Wachstum hat zu einem breiten Zielgruppenbild geführt.',
      'Segmentierung wurde nicht mit wirtschaftlicher Priorität verbunden.',
      'Die Priorisierung ist neuer als Teile der Kommunikation.',
      'Segmentierung und Priorisierung werden datenbasiert gepflegt.',
    ],
    auswirkung: [
      'Botschaften verlieren Relevanz und Mediabudgets streuen.',
      'Vertrieb und Marketing setzen unterschiedliche Prioritäten.',
      'Einzelne Touchpoints bleiben zu allgemein.',
      'Ressourcen konzentrieren sich auf die attraktivsten Chancen.',
    ],
    empfehlung: [
      'Primäre Zielgruppe anhand Attraktivität und Abschlusswahrscheinlichkeit festlegen.',
      'Segmente mit klarer wirtschaftlicher Priorität versehen.',
      'Botschaften je Primärsegment nachschärfen.',
      'Priorisierung regelmäßig gegen Pipeline- und Marktdaten prüfen.',
    ],
  },
  nutzenargumentation: {
    beobachtung: [
      'Der Nutzen wird vor allem fachlich und funktional beschrieben.',
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
  csv: { label: 'CSV', tone: 'ok' },
  txt: { label: 'Text', tone: 'neutral' },
  png: { label: 'PNG-Bild', tone: 'neutral' },
  jpg: { label: 'JPG-Bild', tone: 'neutral' },
  jpeg: { label: 'JPEG-Bild', tone: 'neutral' },
  bild: { label: 'Bild', tone: 'neutral' },
}

/** Stufe 0–3 aus einem Score – Index in die Textbausteine. */
export function stufeIndex(score) {
  if (score < 40) return 0
  if (score < 58) return 1
  if (score < 75) return 2
  return 3
}