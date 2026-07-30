import { RECHTSSEITEN } from './legal.js'

/**
 * Route-spezifische SEO-Angaben, adressiert über den Pfad (ohne Hash).
 * Die Rechtsseiten übernehmen ihre Angaben aus legal.js, damit Wortlaut und
 * Meta-Daten aus einer Quelle stammen.
 */
export const SEO_ROUTES = {
  '/': {
    title: 'Strategische Ursachenanalyse für Gesundheits- & MedTech-Produkte | SYMMEDIS',
    description:
      'Umsatz stagniert trotz guter Produkte? SYMMEDIS identifiziert in 10–14 Tagen die größten Wachstumsbremsen und entwickelt einen konkreten 90-Tage-Plan.',
  },
  '/problem': {
    title: 'Warum gute Gesundheitsprodukte nicht wachsen | SYMMEDIS',
    description:
      'Erklärungsbedürftige Gesundheits- und MedTech-Produkte scheitern selten an der Qualität. Wir setzen eine Ebene früher an: bei der Ursache.',
  },
  '/analysebereiche': {
    title: 'Analysebereiche der Ursachenanalyse | SYMMEDIS',
    description:
      'Zehn Bereiche, ein zusammenhängendes Bild: Wie SYMMEDIS Positionierung, Kommunikation, Vertrieb und Marktaktivierung untersucht.',
  },
  '/funktionsweise': {
    title: 'So funktioniert die Ursachenanalyse | SYMMEDIS',
    description:
      'Ein strukturierter Weg von der Vermutung zur Klarheit. Unsere Software strukturiert den Prozess, die Bewertung nimmt unser Team vor.',
  },
  '/plattform': {
    title: 'SYMMEDIS Diagnosis OS – Analyse, Prüfung, Umsetzung | SYMMEDIS',
    description:
      'Analyse, Freigabeprozess, Aufgaben und Zusammenarbeit in einer Anwendung. Die Software strukturiert, Menschen bewerten und geben frei.',
  },
  '/angebot': {
    title: 'SYMMEDIS Ursachenanalyse – Leistungen & Investition | SYMMEDIS',
    description:
      'Eine strategische Ursachenanalyse in 10–14 Tagen. Typischer Investitionsrahmen 7.500–10.000 € netto – strukturiert durch Software, geprüft durch unser Team.',
  },
  '/faq': {
    title: 'Häufige Fragen zur Ursachenanalyse | SYMMEDIS',
    description:
      'Von der Dauer über die Datentrennung bis zur Frage, für wen SYMMEDIS nicht geeignet ist – Antworten offen und ohne Verkaufston.',
  },
  '/termin': {
    title: '15-Minuten-Diagnosegespräch buchen | SYMMEDIS',
    description:
      'Beginnen Sie mit einem 15-minütigen Diagnosegespräch. Wir klären, ob eine Ursachenanalyse in Ihrer Situation sinnvoll ist – und sagen es auch, wenn nicht.',
  },
  '/impressum': { ...RECHTSSEITEN.impressum.seo, path: '/impressum' },
  '/datenschutz': { ...RECHTSSEITEN.datenschutz.seo, path: '/datenschutz' },
  '/agb': { ...RECHTSSEITEN.agb.seo, path: '/agb' },
}

export function seoFuerPfad(pathname) {
  const eintrag = SEO_ROUTES[pathname]
  if (!eintrag) return { path: pathname }
  return { path: pathname, ...eintrag }
}
