/**
 * Texte der öffentlichen Website.
 *
 * Inhalt getrennt von Darstellung: Textänderungen fassen keine Komponente an.
 * Die Kernaussagen stammen wörtlich aus dem Briefing.
 */

export const NAV = [
  { to: '/problem', label: 'Problem' },
  { to: '/analysebereiche', label: 'Analysebereiche' },
  { to: '/funktionsweise', label: 'Funktionsweise' },
  { to: '/plattform', label: 'Plattform' },
  { to: '/angebot', label: 'Angebot' },
  { to: '/faq', label: 'FAQ' },
]

export const HERO = {
  eyebrow: 'Strategische Ursachenanalyse für Gesundheitsunternehmen',
  badge: 'SYMMEDIS Diagnosis OS',
  headline: 'Ihr Umsatz stagniert – und niemand kann klar sagen, warum?',
  text: 'SYMMEDIS identifiziert in 10–14 Tagen die drei größten Wachstumsbremsen Ihres Unternehmens und übersetzt sie in einen konkreten 90-Tage-Plan. Strukturiert durch unsere Software, bewertet und freigegeben durch Menschen.',
  ctaPrimary: '15-Minuten-Gespräch buchen',
  ctaSecondary: 'Beispiel-Ergebnis ansehen',
}

export const TRUST = [
  { wert: '10–14 Tage', text: 'bis zum Ergebnis' },
  { wert: '10', text: 'Analysebereiche je Projekt' },
  { wert: '3', text: 'größte Umsatzbremsen, klar benannt' },
  { wert: '90 Tage', text: 'konkreter Umsetzungsplan' },
  { wert: '100 %', text: 'menschlich geprüft, nie automatisch freigegeben' },
]

export const BRANCHEN = [
  'MedTech & Medizingeräte',
  'Diagnostik & Labor',
  'Premium-NEM & Vitalstoffe',
  'Therapie & Praxisketten',
  'Digital Health',
  'Pharma & Apotheke',
]

export const PROBLEM = {
  label: 'DAS EIGENTLICHE PROBLEM',
  headline: 'Warum gute Gesundheitsprodukte nicht automatisch erfolgreich sind',
  text: 'Erklärungsbedürftige Gesundheits-, MedTech- und Premium-Produkte scheitern selten an der Qualität. Sie scheitern daran, dass ihr Wert nicht schnell genug verstanden wird. Mehr Marketing verstärkt dann oft nur ein Problem, das an anderer Stelle entsteht. Wir setzen deshalb eine Ebene früher an: bei der Ursache.',
  karten: [
    {
      titel: 'Fehlende Positionierung',
      text: 'Das Angebot ist gut, aber der eigene, verteidigbare Platz im Markt bleibt unscharf und austauschbar.',
      symptom: 'Symptom: „Wir werden mit allen verglichen.“',
    },
    {
      titel: 'Mangelnde Verständlichkeit',
      text: 'Das Produkt wird fachlich korrekt, aber wirtschaftlich nicht nachvollziehbar erklärt.',
      symptom: 'Symptom: lange Gespräche ohne Abschluss.',
    },
    {
      titel: 'Unklare Differenzierung',
      text: 'Unterschiede zu Alternativen werden genannt, aber nicht belegt und nicht in Kundenvorteil übersetzt.',
      symptom: 'Symptom: Preisdiskussionen statt Nutzendiskussionen.',
    },
    {
      titel: 'Fehlende Marktaktivierung',
      text: 'Es gibt Aktivitäten, aber keine aufeinander aufbauende Sequenz, die Nachfrage systematisch erzeugt.',
      symptom: 'Symptom: Reichweite ohne Anfragen.',
    },
  ],
}

export const ANALYSEBEREICHE = {
  label: 'ANALYSEBEREICHE',
  headline: 'Zehn Bereiche, ein zusammenhängendes Bild',
  text: 'Jeder Bereich wird eigenständig bewertet und anschließend in Beziehung zu den übrigen gesetzt. Erst dieser Zusammenhang zeigt, welche Ursache welche Symptome erzeugt.',
}

export const FUNKTIONSWEISE = {
  label: 'SO FUNKTIONIERT DIE URSACHENANALYSE',
  headline: 'Ein strukturierter Weg von der Vermutung zur Klarheit',
  text: 'Unsere Software strukturiert den Analyseprozess und macht ihn nachvollziehbar. Die Bewertung und Einordnung nimmt jedoch immer unser Team vor – die Software ersetzt unsere strategische Prüfung nicht.',
  schritte: [
    {
      nummer: '1',
      titel: 'Unterlagen und Kontext sichten',
      text: 'Angebotslogik, Kommunikation, Vertriebsmaterial und Marktumfeld werden strukturiert und vollständig erfasst.',
      traeger: 'Software strukturiert · Team prüft',
    },
    {
      nummer: '2',
      titel: 'Ursachen statt Symptome bestimmen',
      text: 'Wir unterscheiden, ob Marketing die Ursache oder nur ein Symptom eines tieferliegenden strategischen Problems ist.',
      traeger: 'Team entscheidet',
    },
    {
      nummer: '3',
      titel: 'Die drei größten Umsatzbremsen benennen',
      text: 'Wir priorisieren die Faktoren, die Ihr Wachstum tatsächlich blockieren – belegt, nicht vermutet.',
      traeger: 'Team entscheidet',
    },
    {
      nummer: '4',
      titel: '90-Tage-Plan und Ergebnispräsentation',
      text: 'Sie erhalten einen konkreten Umsetzungsplan und eine strategische Besprechung mit unserem Team.',
      traeger: 'Gemeinsam mit Ihnen',
    },
  ],
}

export const PLATTFORM = {
  label: 'DIE PLATTFORM',
  headline: 'Analyse, Prüfung und Umsetzung an einem Ort',
  text: 'Diagnosis OS ist kein Berichtsversand per E-Mail. Analyse, Freigabeprozess, Aufgaben, Dokumente und Abstimmung laufen in einer Anwendung – für Sie und für uns.',
  module: [
    {
      titel: 'Ursachenanalyse',
      text: 'Zehn Dimensionen mit Reifegrad, Beobachtung, Ursache, Auswirkung, Empfehlung, Beleg und Priorität.',
    },
    {
      titel: 'Social-Media-Analyse',
      text: 'Kanalreife, Frequenz, Resonanz, Konsistenz und erkannte Lücken – aus öffentlich sichtbaren Beiträgen.',
    },
    {
      titel: 'Dokumentenanalyse',
      text: 'Vertriebsunterlagen, Kataloge und Studien mit Versionsstand, gesichtet und in die Bewertung überführt.',
    },
    {
      titel: 'Positionierung & Wettbewerb',
      text: 'Vergleich Ihrer Aussagen mit denen der wichtigsten Anbieter im Umfeld.',
    },
    {
      titel: '90-Tage-Plan',
      text: 'Drei Phasen von der Ursache über die Wirkung bis zur verankerten Nachfrage.',
    },
    {
      titel: 'Aufgaben & Zusammenarbeit',
      text: 'Klare Zuständigkeit je Maßnahme – SYMMEDIS oder Ihr Team – mit Fälligkeit und Messgröße.',
    },
  ],
}

export const KUNDENPORTAL = {
  label: 'KUNDENPORTAL',
  headline: 'Ihr Projekt, jederzeit im Blick',
  text: 'Sie sehen den Stand der Analyse, die freigegebenen Ergebnisse und den nächsten Schritt – ohne nachfragen zu müssen.',
  punkte: [
    'Projektstand, Fortschritt und Ergebnistermin auf einen Blick',
    'Die drei größten Umsatzbremsen mit Ursache und nächster Aktion',
    'Freigegebene Analyse mit Beleg zu jeder Bewertung',
    '90-Tage-Plan und Aufgaben mit klarer Zuständigkeit',
    'Dokumente, Berichte, Termine und Nachrichten an einem Ort',
    'Kein Zugriff auf interne Notizen oder andere Mandanten',
  ],
}

export const MITARBEITERPORTAL = {
  label: 'MITARBEITERPORTAL',
  headline: 'Der interne Teil, den Sie nie zu sehen bekommen',
  text: 'Damit die Bewertung belastbar ist, braucht sie einen Ort, an dem geprüft, korrigiert und freigegeben wird. Genau das trennt eine geprüfte Analyse von einer automatisch erzeugten Auswertung.',
  punkte: [
    'Analyse-Editor für jede Dimension mit Beleg und Priorität',
    'Freigabeprozess: vorgeschlagen → in Prüfung → bearbeitet → intern → Kunde',
    'Interne Notizen, die den internen Bereich nie verlassen',
    'Prüfpfad: wer hat wann was geprüft und freigegeben',
    'Projektübergreifende Analysematrix und Portfolio-Muster',
    'Auslastung, Fristen und Posteingang für das gesamte Team',
  ],
}

export const SOCIAL = {
  label: 'SOCIAL-MEDIA-ANALYSE',
  headline: 'Reichweite ist kein Ergebnis',
  text: 'Wir bewerten Ihre Kanäle nicht nach Followerzahlen, sondern danach, ob sie Nachfrage erzeugen: Frequenz, Resonanz, Konsistenz der Kernaussage und der Anteil an Beiträgen mit tatsächlichem Anschluss.',
  kriterien: [
    { titel: 'Frequenz', text: 'Erscheint überhaupt regelmäßig genug etwas, um Wirkung zu entfalten?' },
    { titel: 'Resonanz', text: 'Reagieren die richtigen Menschen – oder nur irgendwelche?' },
    { titel: 'Konsistenz', text: 'Tragen Profil, Beiträge und Website dieselbe Kernaussage?' },
    { titel: 'Anschluss', text: 'Führt ein Beitrag zu einem nächsten Schritt oder endet er im Nichts?' },
  ],
}

export const PLAN = {
  label: '90-TAGE-PLAN',
  headline: 'Drei Phasen statt einer Maßnahmenliste',
  text: 'Ein Plan wirkt nur, wenn er eine Reihenfolge hat. Wir schließen zuerst die Ursache, stellen dann Wirkung her und verankern zuletzt die Nachfrage.',
  phasen: [
    {
      label: 'Tag 1–30',
      ziel: 'Ursache schließen',
      text: 'Positionierung und Kernaussage verbindlich festlegen, Zielgruppe priorisieren, Belege sichern.',
    },
    {
      label: 'Tag 31–60',
      ziel: 'Wirkung herstellen',
      text: 'Website, Vertriebsunterlagen und Kanäle auf die neue Kernaussage ausrichten.',
    },
    {
      label: 'Tag 61–90',
      ziel: 'Nachfrage verankern',
      text: 'Sequenz aufsetzen, Übergaben zwischen Marketing und Vertrieb definieren, Messgrößen festziehen.',
    },
  ],
}

export const ANGEBOT = {
  label: 'UNSER KERNANGEBOT',
  headline: 'SYMMEDIS Ursachenanalyse',
  text: 'Eine strategische Ursachenanalyse in 10–14 Tagen. Strukturiert durch unsere Software, bewertet durch unser Team.',
  leistungen: [
    'Strukturierte Analyse von Angebotslogik und Nutzenargumentation',
    'Prüfung, ob Marketing die Ursache oder nur ein Symptom ist',
    'Identifikation der drei größten Umsatzbremsen',
    'Social-Media- und Wettbewerbsauswertung',
    'Konkreter 90-Tage-Umsetzungsplan',
    'Strategische Ergebnispräsentation mit unserem Team',
    'Zugang zum Kundenportal während des gesamten Projekts',
    'Menschliche strategische Prüfung durch SYMMEDIS',
  ],
  fakten: [
    { label: 'Dauer', wert: '10–14 Tage' },
    { label: 'Ergebnis', wert: 'Strategiebericht + Plan' },
    { label: 'Bewertung', wert: 'Menschlich geprüft' },
    { label: 'Format', wert: 'Remote & vor Ort' },
  ],
}

export const ZIELGRUPPE = {
  label: 'FÜR WEN',
  headline: 'Für Unternehmen, die keine weitere Maßnahme ohne klare Diagnose starten wollen',
  text: 'Eine Ursachenanalyse lohnt sich, wenn ein marktfähiges Produkt vorhanden ist und trotzdem nicht die erwartete Wirkung erzielt. Wir sagen offen, wann sie passt – und wann nicht.',
  geeignet: [
    'Gesundheitsmarkt, MedTech und Diagnostik',
    'Vitalstoffe, Premium-NEM und erklärungsbedürftige Produkte',
    'Digital Health, Therapie- und Praxiskonzepte',
    'Unternehmen mit Marketinginvestitionen und unklarer Wirkung',
    'Geschäftsführung, Inhaber und Entscheider',
  ],
  wenigerPassend: [
    'Es geht nur um einzelne Social-Media-Posts.',
    'Gewünscht ist ausschließlich eine Website-Erstellung.',
    'Es gibt noch kein marktfähiges Produkt.',
    'Gewünscht ist eine vollständig automatische KI-Auswertung.',
  ],
}

export const TEAM = {
  label: 'TEAM & VERTRAUEN',
  headline: 'Strategische Erfahrung trifft auf digitale Umsetzung',
  einleitung:
    'SYMMEDIS verbindet jahrzehntelange Kommunikations- und Gesundheitsmarkt-Erfahrung mit moderner Software, KI und digitaler Umsetzung.',
  positionierung: 'Wir kommunizieren nicht nur. Wir entwickeln Märkte.',
  personen: [
    {
      name: 'Alfred Michael Waizmann',
      rolle: 'Strategische Kommunikation & Marktentwicklung',
      text: '30 Jahre Kommunikation und 15 Jahre Gesundheitssektor. Alfred Michael Waizmann verantwortet die strategische Analyse, Positionierung und Marktentwicklung. Seine Erfahrung umfasst die Zusammenarbeit mit Ärzten, Professoren, Heilpraktikern, Therapeuten und Herstellern.',
      linkedin: 'https://www.linkedin.com/in/alfred-michael-waizmann-b7698644/',
      // Interner Bildname: alfred-michael-waizmann.png (Datei liegt noch nicht vor).
      bild: null,
      alt: 'Alfred Michael Waizmann, Experte für strategische Kommunikation und Marktentwicklung bei SYMMEDIS',
    },
    {
      name: 'David Constantin Waizmann',
      rolle: 'Digitale Strategie, Software & KI',
      text: 'David Constantin Waizmann verantwortet die digitale Struktur und technologische Umsetzung von SYMMEDIS. Seine Schwerpunkte liegen in E-Commerce, Marketing, Webdesign, KI und der Entwicklung der SYMMEDIS-Software.',
      linkedin: 'https://www.linkedin.com/in/david-waizmann-aab19b220/',
      // Interner Bildname: david-constantin-waizmann.png (Datei liegt noch nicht vor).
      bild: null,
      alt: 'David Constantin Waizmann, verantwortlich für digitale Strategie, Software und KI bei SYMMEDIS',
    },
  ],
}

/**
 * Redaktionelle Bild-Slots. `bild` bleibt null, bis die freigegebene Datei in
 * src/assets/marketing/ vorliegt und hier importiert zugewiesen wird – dann
 * erscheint das Visual automatisch mit korrektem Alt-Text und Bildunterschrift
 * (siehe MarketingBild in parts.jsx). Bis dahin wird nichts dargestellt.
 */
export const VISUALS = {
  prozess: {
    // Interner Bildname: symmedis-diagnosis-process.png
    bild: null,
    alt: 'Dreistufiger SYMMEDIS-Analyseprozess: Ursache erkennen, strategisch einordnen und priorisieren, Maßnahmen und 90-Tage-Plan ableiten',
    caption: 'Von der Ursache zum 90-Tage-Plan',
    phasen: [
      'Ursache erkennen',
      'Strategisch einordnen und priorisieren',
      'Maßnahmen und 90-Tage-Plan ableiten',
    ],
  },
  plattform: {
    // Interner Bildname: symmedis-diagnosis-dashboard.png
    bild: null,
    alt: 'Symbolische Darstellung der SYMMEDIS Diagnosis-OS-Oberfläche',
    caption: 'Diagnosis OS – symbolische, redaktionelle Darstellung, keine reale Plattformaufnahme',
  },
  netzwerk: {
    // Interner Bildname: symmedis-healthtech-network.png
    bild: null,
    alt: 'SYMMEDIS Health-Tech-Netzwerk aus Kommunikations- und Analyseknoten',
    caption: null,
  },
}

export const INVESTITION = {
  label: 'INVESTITION & ABLAUF',
  headline: 'Ein transparenter Investitionsrahmen',
  rahmen: '7.500–10.000 € netto',
  rahmenLabel: 'Typischer Investitionsrahmen einer Ursachenanalyse',
  zusatz:
    'Der konkrete Umfang richtet sich nach Unternehmensgröße, Datenlage und Anzahl der zu untersuchenden Märkte oder Produktbereiche.',
  hinweis:
    'Keine Rabatte, keine Timer, keine künstliche Verknappung. Den genauen Rahmen legen wir gemeinsam im Diagnosegespräch fest.',
}

export const UEBER_UNS = {
  label: 'ÜBER SYMMEDIS',
  headline: 'Keine klassische Agentur. Eine strategische Analyseeinheit.',
  text: 'Wir sind ein spezialisiertes Team für erklärungsbedürftige Gesundheits-, MedTech-, Vitalstoff- und Premium-NEM-Produkte. Wir helfen Unternehmen, die tatsächlichen Ursachen für stagnierenden Umsatz zu erkennen – bevor weiteres Budget in Symptome fließt. Unsere Software strukturiert diesen Prozess. Die Verantwortung für Bewertung und Empfehlung bleibt bei uns.',
  prinzipien: [
    {
      titel: 'Ursache vor Symptom',
      text: 'Wir verkaufen keine Maßnahme, bevor klar ist, ob sie an der richtigen Stelle ansetzt.',
    },
    {
      titel: 'Belegt statt behauptet',
      text: 'Jede Bewertung nennt ihren Beleg – Quelle, Umfang und Zeitraum.',
    },
    {
      titel: 'Software strukturiert, Menschen entscheiden',
      text: 'Kein Ergebnis wird automatisch freigegeben oder versendet.',
    },
  ],
}

export const FAQ = [
  {
    frage: 'Ist das eine KI-Analyse?',
    antwort:
      'Die Software strukturiert den Prozess, wertet Unterlagen und Kanäle aus und bereitet Bewertungsvorschläge vor. Die Bewertung selbst prüft und verantwortet unser Team. Kein Ergebnis geht ungeprüft an Sie – der Freigabeprozess ist Teil des Produkts, nicht ein nachträglicher Schritt.',
  },
  {
    frage: 'Wie lange dauert eine Ursachenanalyse?',
    antwort:
      'In der Regel 10 bis 14 Arbeitstage ab dem Zeitpunkt, an dem die Unterlagen vollständig vorliegen. Der Ergebnistermin steht von Beginn an im Portal.',
  },
  {
    frage: 'Was brauchen Sie von uns?',
    antwort:
      'Vertriebsunterlagen, Produktkatalog, Website-Zugang zur Struktur, vorhandene Studien oder Belege sowie ein Gespräch mit Vertrieb und Geschäftsführung. Mehr ist nicht nötig.',
  },
  {
    frage: 'Übernehmen Sie danach auch die Umsetzung?',
    antwort:
      'Der 90-Tage-Plan ist so geschrieben, dass Ihr Team ihn eigenständig umsetzen kann. Wo Sie Unterstützung wollen, begleiten wir einzelne Maßnahmen – das ist aber nie Voraussetzung für die Analyse.',
  },
  {
    frage: 'Sehen andere Kunden unsere Daten?',
    antwort:
      'Nein. Jedes Projekt ist ein eigener Mandant. Das Kundenportal zeigt ausschließlich das eigene Projekt und darin ausschließlich freigegebene Inhalte. Interne Notizen unseres Teams erscheinen dort grundsätzlich nicht.',
  },
  {
    frage: 'Für welche Unternehmen ist das nicht geeignet?',
    antwort:
      'Für austauschbare Produkte ohne Substanzvorsprung und für Unternehmen, die eine Bestätigung ihrer bisherigen Strategie suchen. Eine Ursachenanalyse liefert regelmäßig unbequeme Ergebnisse.',
  },
]

export const TERMIN = {
  label: 'NÄCHSTER SCHRITT',
  headline: 'Lassen Sie uns herausfinden, was Ihr Wachstum wirklich bremst.',
  text: 'Beginnen Sie mit einem 15-minütigen Diagnosegespräch. Wir klären, ob eine Ursachenanalyse in Ihrer Situation sinnvoll ist – und sagen es auch, wenn nicht.',
  ablauf: [
    'Kurze Schilderung Ihrer Situation und Ihrer Zahlen',
    'Erste Einschätzung, ob Ursache oder Symptom vorliegt',
    'Klare Aussage, ob und wie wir helfen können',
  ],
}

export const FOOTER = {
  hinweis:
    'Interaktive Beta-Demo – alle Daten sind fiktiv. Keine echten Patienten- oder Gesundheitsdaten.',
  copyright: '© 2026 SYMMEDIS Diagnosis OS.',
}

/** Kurztexte der Rechts-Dialoge (Demo-Inhalte). */
export const RECHTSTEXTE = {
  impressum: {
    titel: 'Impressum',
    absaetze: [
      'Diese Seite ist eine interaktive Beta-Demo. Die folgenden Angaben sind Platzhalter und beschreiben kein real existierendes Unternehmen.',
      'SYMMEDIS Diagnosis OS (Demo) · Musterstraße 1 · 00000 Musterstadt · kontakt@example.com',
      'Verantwortlich für den Inhalt dieser Demo-Darstellung: Demo-Betrieb. Es werden keine Leistungen angeboten und keine Verträge geschlossen.',
    ],
  },
  datenschutz: {
    titel: 'Datenschutz',
    absaetze: [
      'In dieser Demo werden keine personenbezogenen Daten dauerhaft gespeichert. Eingaben aus Formular und Chat existieren ausschließlich im Arbeitsspeicher Ihres Browsers und sind nach dem Neuladen der Seite verschwunden.',
      'Für den Kundenchat werden Ihre Eingaben an eine Sprachmodell-Schnittstelle übermittelt, sofern ein Zugang konfiguriert ist. Bitte geben Sie keine echten Patienten-, Gesundheits- oder personenbezogenen Daten ein.',
      'Es werden keine Cookies zu Analyse- oder Werbezwecken gesetzt. Gespeichert wird ausschließlich Ihre Auswahl für den hellen oder dunklen Modus.',
    ],
  },
  barrierefreiheit: {
    titel: 'Barrierefreiheit',
    absaetze: [
      'Diese Anwendung ist auf Tastaturbedienung ausgelegt: alle Bedienelemente sind erreichbar, Dialoge halten den Fokus und geben ihn beim Schließen zurück.',
      'Farbkontraste erfüllen mindestens WCAG AA. Statusinformationen werden nie allein über Farbe vermittelt, sondern zusätzlich über Text, Icon oder Beschriftung.',
      'Bewegung ist zurückhaltend eingesetzt und wird bei aktivierter Systemeinstellung „Bewegung reduzieren“ weitgehend abgeschaltet.',
    ],
  },
}
