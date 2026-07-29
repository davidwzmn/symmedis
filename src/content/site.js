/**
 * Sämtliche Website-Texte an einer Stelle – wörtlich aus dem Briefing
 * übernommen. Trennung von Inhalt und Darstellung, damit Textänderungen
 * keine Komponenten anfassen müssen.
 */

export const NAV_ITEMS = [
  { id: 'start', label: 'Start' },
  { id: 'problem', label: 'Das Problem' },
  { id: 'ursachenanalyse', label: 'Ursachenanalyse' },
  { id: 'fuer-wen', label: 'Für wen?' },
  { id: 'ueber-uns', label: 'Über uns' },
]

export const SECTION_IDS = [
  'start',
  'problem',
  'ursachenanalyse',
  'fuer-wen',
  'angebot',
  'ueber-uns',
  'termin',
]

export const HERO = {
  badge: 'SYMMEDIS Diagnosis OS · Strategische Ursachenanalyse',
  headline: 'Ihr Umsatz stockt – obwohl Produkt und Marketing stimmen?',
  text: 'Wir analysieren, was Ihr Wachstum tatsächlich bremst, und entwickeln daraus einen klaren 90-Tage-Plan. Keine Agenturfloskeln – eine strukturierte, menschlich geprüfte Ursachenanalyse.',
  ctaPrimary: '15-Minuten-Diagnosegespräch buchen',
  ctaSecondary: 'Demo der Ursachenanalyse ansehen',
}

export const URSACHEN = [
  { nummer: '01', titel: 'Fehlende Positionierung' },
  { nummer: '02', titel: 'Mangelnde Verständlichkeit' },
  { nummer: '03', titel: 'Unklare Differenzierung' },
  { nummer: '04', titel: 'Fehlende Marktaktivierung' },
]

export const KENNZAHLEN = [
  { wert: '10–14 Tage', text: 'bis zum Ergebnis' },
  { wert: '3', text: 'größte Umsatzbremsen, klar benannt' },
  { wert: '90 Tage', text: 'konkreter Umsetzungsplan' },
  { wert: 'Menschlich geprüft', text: 'nicht rein automatisiert' },
]

export const PROBLEM = {
  label: 'DAS EIGENTLICHE PROBLEM',
  headline: 'Warum gute Gesundheitsprodukte nicht automatisch erfolgreich sind',
  text: 'Erklärungsbedürftige Gesundheits-, MedTech- und Premium-Produkte scheitern selten an der Qualität. Sie scheitern daran, dass ihr Wert nicht schnell genug verstanden wird. Mehr Marketing verstärkt dann oft nur ein Problem, das an anderer Stelle entsteht. Wir setzen deshalb eine Ebene früher an: bei der Ursache.',
  karten: [
    {
      icon: 'target',
      titel: 'Fehlende Positionierung',
      text: 'Das Angebot ist gut, aber der eigene, verteidigbare Platz im Markt bleibt unscharf und austauschbar.',
    },
    {
      icon: 'speech',
      titel: 'Mangelnde Verständlichkeit',
      text: 'Das Produkt wird fachlich korrekt, aber wirtschaftlich nicht nachvollziehbar erklärt.',
    },
    {
      icon: 'compare',
      titel: 'Unklare Differenzierung',
      text: 'Unterschiede zu Alternativen werden genannt, aber nicht belegt und nicht in Kundenvorteil übersetzt.',
    },
    {
      icon: 'pulse',
      titel: 'Fehlende Marktaktivierung',
      text: 'Es gibt Aktivitäten, aber keine aufeinander aufbauende Sequenz, die Nachfrage systematisch erzeugt.',
    },
  ],
}

export const PROZESS = {
  label: 'SO FUNKTIONIERT DIE URSACHENANALYSE',
  headline: 'Ein strukturierter Weg von der Vermutung zur Klarheit',
  text: 'Unsere Software strukturiert den Analyseprozess und macht ihn nachvollziehbar. Die Bewertung und Einordnung nimmt jedoch immer unser Team vor – die Software ersetzt unsere strategische Prüfung nicht.',
  schritte: [
    {
      nummer: '1',
      titel: 'Unterlagen und Kontext sichten',
      text: 'Wir prüfen Angebotslogik, Kommunikation, Vertriebsmaterial und Marktumfeld strukturiert und vollständig.',
    },
    {
      nummer: '2',
      titel: 'Ursachen statt Symptome bestimmen',
      text: 'Wir unterscheiden, ob Marketing die Ursache oder nur ein Symptom eines tieferliegenden strategischen Problems ist.',
    },
    {
      nummer: '3',
      titel: 'Die drei größten Umsatzbremsen benennen',
      text: 'Wir priorisieren die Faktoren, die Ihr Wachstum tatsächlich blockieren – belegt, nicht vermutet.',
    },
    {
      nummer: '4',
      titel: '90-Tage-Plan und Ergebnispräsentation',
      text: 'Sie erhalten einen konkreten Umsetzungsplan und eine strategische Besprechung mit unserem Team.',
    },
  ],
}

export const ZIELGRUPPE = {
  label: 'FÜR WELCHE UNTERNEHMEN SYMMEDIS GEEIGNET IST',
  headline: 'Für erklärungsbedürftige Produkte mit echtem Substanzvorsprung',
  text: 'Wir arbeiten mit Unternehmen, deren Produkte gut sind – aber deren Wert im Markt nicht ankommt. Wenn Sie sich in mehreren dieser Punkte wiedererkennen, ist eine Ursachenanalyse sinnvoll.',
  checkliste: [
    'Ihr Produkt ist erklärungsbedürftig und hochwertig positioniert.',
    'Ihr Marketing läuft, aber der Umsatz entwickelt sich nicht entsprechend.',
    'Sie sprechen mehrere Zielgruppen an und sind unsicher, welche zuerst.',
    'Ihr Vertrieb argumentiert anders als Ihre Außenkommunikation.',
    'Sie haben Belege und Studien, aber sie werden im Markt nicht wirksam.',
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
    'Konkreter 90-Tage-Umsetzungsplan',
    'Strategische Ergebnispräsentation mit unserem Team',
    'Menschliche strategische Prüfung durch SYMMEDIS',
  ],
  fakten: [
    { label: 'Dauer', wert: '10–14 Tage' },
    { label: 'Ergebnis', wert: 'Strategiebericht + Plan' },
    { label: 'Bewertung', wert: 'Menschlich geprüft' },
    { label: 'Format', wert: 'Remote & vor Ort' },
  ],
  cta: 'Interaktive Demo öffnen',
}

export const UEBER_UNS = {
  label: 'ÜBER UNS',
  headline: 'Keine klassische Agentur. Eine strategische Analyseeinheit.',
  text: 'Wir sind ein spezialisiertes Team für erklärungsbedürftige Gesundheits-, MedTech-, Vitalstoff- und Premium-NEM-Produkte. Wir helfen Unternehmen, die tatsächlichen Ursachen für stagnierenden Umsatz zu erkennen – bevor weiteres Budget in Symptome fließt. Unsere Software strukturiert diesen Prozess. Die Verantwortung für Bewertung und Empfehlung bleibt bei uns.',
}

export const TERMIN = {
  label: 'NÄCHSTER SCHRITT',
  headline: 'Lassen Sie uns herausfinden, was Ihr Wachstum wirklich bremst.',
  text: 'Beginnen Sie mit einem 15-minütigen Diagnosegespräch – oder sehen Sie sich zunächst die interaktive Demo unserer Ursachenanalyse an.',
  ctaPrimary: '15-Minuten-Diagnosegespräch buchen',
  ctaSecondary: 'Demo ansehen',
}

export const FOOTER = {
  hinweis:
    'Interaktive Beta-Demo – alle Daten sind fiktiv. Keine echten Patienten- oder Gesundheitsdaten.',
  copyright: '© 2026 SYMMEDIS Diagnosis OS.',
  links: [
    { id: 'impressum', label: 'Impressum' },
    { id: 'datenschutz', label: 'Datenschutz' },
    { id: 'linkedin', label: 'LinkedIn' },
  ],
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
      'Für die Demo-Analyse und den Kundenchat werden Ihre Eingaben an eine Sprachmodell-Schnittstelle übermittelt, sofern ein Zugang konfiguriert ist. Bitte geben Sie keine echten Patienten-, Gesundheits- oder personenbezogenen Daten ein.',
      'Es werden keine Cookies zu Analyse- oder Werbezwecken gesetzt. Gespeichert wird ausschließlich Ihre Auswahl für den hellen oder dunklen Modus.',
    ],
  },
  linkedin: {
    titel: 'LinkedIn',
    absaetze: [
      'In dieser Beta-Demo ist kein echtes LinkedIn-Profil verknüpft – der Link führt bewusst ins Leere statt zu einer fremden Seite.',
      'In der finalen Version steht hier das Unternehmensprofil von SYMMEDIS.',
    ],
  },
}
