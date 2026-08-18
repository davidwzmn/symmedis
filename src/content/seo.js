import { RECHTSSEITEN } from './legal.js'

export const SEO_ROUTES = {
  '/': {
    title: 'Strategische Ursachenanalyse für Wachstum | SYMMEDIS Diagnosis OS',
    description:
      'SYMMEDIS identifiziert die Ursachen, die Wachstum tatsächlich begrenzen, strukturiert die Evidenz und übersetzt die wichtigsten Erkenntnisse in klare Prioritäten und konkrete nächste Schritte.',
  },
  '/problem': {
    title: 'Warum gute Gesundheitsprodukte nicht wachsen | SYMMEDIS',
    description:
      'Erklärungsbedürftige Gesundheits- und MedTech-Produkte scheitern selten an der Qualität. Wir setzen eine Ebene früher an: bei der Ursache.',
  },
  '/analysebereiche': {
    title: '10 Analysebereiche für strategisches Wachstum | SYMMEDIS',
    description:
      'Positionierung, Verständlichkeit, Differenzierung, Marktaktivierung, Website, Vertrieb, Social, Zielgruppen, Nutzenargumentation und Wettbewerb als zusammenhängendes System.',
  },
  '/funktionsweise': {
    title: 'Von Evidenz zur Wachstumsdiagnose | SYMMEDIS',
    description:
      'Unterlagen und Kontext strukturieren, Ursachen priorisieren, menschlich prüfen und in einen konkreten 90-Tage-Plan übersetzen.',
  },
  '/plattform': {
    title: 'SYMMEDIS Diagnosis OS – Analyse, Evidenz, Freigabe & Umsetzung',
    description:
      'Ein sicherer Arbeitsraum für Ursachenanalyse, Evidenz, menschliche Freigaben, Dokumente, Reports, Aufgaben und Kundenkommunikation.',
  },
  '/angebot': {
    title: 'Strategische Ursachenanalyse – Leistungen & Investition | SYMMEDIS',
    description:
      'Eine strategische Ursachenanalyse in 10–14 Tagen mit Management-Report, drei priorisierten Wachstumsbremsen und einem konkreten 90-Tage-Plan.',
  },
  '/faq': {
    title: 'Häufige Fragen zu SYMMEDIS Diagnosis OS',
    description:
      'Dauer, Datensicherheit, menschliche Prüfung, Vorgehen und Zusammenarbeit – die wichtigsten Antworten zur SYMMEDIS Ursachenanalyse.',
  },
  '/termin': {
    title: '15-Minuten-Diagnosegespräch anfragen | SYMMEDIS',
    description:
      'Schildern Sie kurz Ihre aktuelle Wachstumsfrage. Wir prüfen persönlich, ob eine strategische Ursachenanalyse in Ihrer Situation sinnvoll ist.',
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
