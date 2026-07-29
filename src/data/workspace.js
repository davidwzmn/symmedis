/**
 * Demo-Datensatz der Plattform.
 *
 * Alle Inhalte sind fiktiv und ausschließlich für die Demo gedacht.
 * Aufbau: wenige Kennwerte je Kunde (Scores, Stammdaten) werden über
 * `baueKunde()` zu einem vollständigen Projektdatensatz expandiert – Analyse,
 * Umsatzbremsen, Aufgaben, 90-Tage-Plan, Dokumente, Termine und Aktivitäten.
 */

import { BEFUNDE, KATEGORIEN, PLATTFORMEN, stufeIndex } from './catalog.js'

export const TEAM = [
  { id: 'mr', name: 'M. Reinhardt', rolle: 'Lead Analystin', kuerzel: 'MR', auslastung: 82 },
  { id: 'jk', name: 'J. Krämer', rolle: 'Senior Analyst', kuerzel: 'JK', auslastung: 68 },
  { id: 'sb', name: 'S. Brandt', rolle: 'Social & Content', kuerzel: 'SB', auslastung: 74 },
  { id: 'tw', name: 'T. Weiler', rolle: 'Strategie', kuerzel: 'TW', auslastung: 55 },
]

export const TEAM_MAP = Object.fromEntries(TEAM.map((t) => [t.id, t]))

const PROJEKT_STATUS = {
  onboarding: { label: 'Onboarding', tone: 'neutral' },
  analyse: { label: 'Analyse läuft', tone: 'info' },
  pruefung: { label: 'Menschliche Prüfung', tone: 'warn' },
  bericht: { label: 'Bericht in Arbeit', tone: 'brand' },
  umsetzung: { label: 'Umsetzung', tone: 'accent' },
  abgeschlossen: { label: 'Abgeschlossen', tone: 'ok' },
}

export { PROJEKT_STATUS }

/* ------------------------------------------------------------------ Seeds */

const SEEDS = [
  {
    id: 'nordvita',
    unternehmen: 'Nordvita Vitalstoffe GmbH',
    kurz: 'Nordvita',
    branche: 'Premium-NEM & Vitalstoffe',
    ort: 'Hamburg',
    mitarbeitende: 64,
    ansprechpartner: {
      name: 'Dr. Katrin Ahlers',
      rolle: 'Geschäftsführung',
      email: 'k.ahlers@nordvita-demo.de',
      telefon: '+49 40 000000-12',
    },
    betreuerId: 'mr',
    status: 'pruefung',
    start: '2026-07-13',
    ergebnis: '2026-08-04',
    fortschritt: 72,
    scores: {
      positionierung: 34,
      verstaendlichkeit: 52,
      differenzierung: 29,
      marktaktivierung: 61,
      website: 48,
      vertrieb: 41,
      social: 44,
      zielgruppen: 38,
      nutzenargumentation: 45,
      wettbewerb: 33,
    },
    social: {
      plattformen: {
        linkedin: { verbunden: true, score: 58, frequenz: 3.2, engagement: 2.4, follower: 4180 },
        instagram: { verbunden: true, score: 41, frequenz: 1.8, engagement: 1.1, follower: 9240 },
        youtube: { verbunden: false, score: 0, frequenz: 0, engagement: 0, follower: 0 },
        facebook: { verbunden: true, score: 27, frequenz: 0.6, engagement: 0.4, follower: 2610 },
        fachpresse: { verbunden: true, score: 62, frequenz: 0.8, engagement: 3.1, follower: 0 },
      },
      luecken: [
        'Kein wiederkehrendes Format zur Erklärung der Rohstoffqualität',
        'Studienergebnisse werden auf keinem Kanal aufbereitet',
        'Keine Handlungsaufforderung in 8 von 10 Beiträgen',
      ],
      quickWins: [
        'Drei Belegposts aus vorhandener Analytik ableiten',
        'Profilbeschreibungen auf die Kernaussage vereinheitlichen',
        'Handlungsaufforderung als festen Bestandteil im Redaktionsplan verankern',
      ],
    },
  },
  {
    id: 'medisens',
    unternehmen: 'MediSens Diagnostics AG',
    kurz: 'MediSens',
    branche: 'Diagnostik & Labor',
    ort: 'Heidelberg',
    mitarbeitende: 128,
    ansprechpartner: {
      name: 'Tobias Herzog',
      rolle: 'Leitung Marketing',
      email: 't.herzog@medisens-demo.de',
      telefon: '+49 6221 00000-40',
    },
    betreuerId: 'jk',
    status: 'analyse',
    start: '2026-07-21',
    ergebnis: '2026-08-11',
    fortschritt: 45,
    scores: {
      positionierung: 51,
      verstaendlichkeit: 37,
      differenzierung: 58,
      marktaktivierung: 44,
      website: 55,
      vertrieb: 49,
      social: 36,
      zielgruppen: 31,
      nutzenargumentation: 42,
      wettbewerb: 60,
    },
    social: {
      plattformen: {
        linkedin: { verbunden: true, score: 49, frequenz: 2.1, engagement: 1.8, follower: 7350 },
        instagram: { verbunden: false, score: 0, frequenz: 0, engagement: 0, follower: 0 },
        youtube: { verbunden: true, score: 34, frequenz: 0.4, engagement: 2.9, follower: 1120 },
        facebook: { verbunden: false, score: 0, frequenz: 0, engagement: 0, follower: 0 },
        fachpresse: { verbunden: true, score: 71, frequenz: 1.2, engagement: 4.2, follower: 0 },
      },
      luecken: [
        'Zwei Zielgruppen werden mit identischen Inhalten bedient',
        'Anwendungsstudien erscheinen nur als PDF-Download',
      ],
      quickWins: [
        'Kanalprofile je Zielgruppe trennen',
        'Studien als Kurzformat für Fachpublikum aufbereiten',
      ],
    },
  },
  {
    id: 'kardiolink',
    unternehmen: 'KardioLink Systems',
    kurz: 'KardioLink',
    branche: 'MedTech & Medizingeräte',
    ort: 'Tuttlingen',
    mitarbeitende: 210,
    ansprechpartner: {
      name: 'Sabine Wolter',
      rolle: 'Vertriebsleitung',
      email: 's.wolter@kardiolink-demo.de',
      telefon: '+49 7461 00000-88',
    },
    betreuerId: 'mr',
    status: 'umsetzung',
    start: '2026-06-02',
    ergebnis: '2026-06-23',
    fortschritt: 96,
    scores: {
      positionierung: 66,
      verstaendlichkeit: 59,
      differenzierung: 44,
      marktaktivierung: 71,
      website: 68,
      vertrieb: 52,
      social: 55,
      zielgruppen: 63,
      nutzenargumentation: 47,
      wettbewerb: 58,
    },
    social: {
      plattformen: {
        linkedin: { verbunden: true, score: 67, frequenz: 4.1, engagement: 3.2, follower: 12400 },
        instagram: { verbunden: false, score: 0, frequenz: 0, engagement: 0, follower: 0 },
        youtube: { verbunden: true, score: 58, frequenz: 1.1, engagement: 4.8, follower: 3480 },
        facebook: { verbunden: false, score: 0, frequenz: 0, engagement: 0, follower: 0 },
        fachpresse: { verbunden: true, score: 64, frequenz: 1.5, engagement: 3.6, follower: 0 },
      },
      luecken: ['Belege aus zwei Anwendungsstudien bleiben ungenutzt'],
      quickWins: ['Studienergebnisse in die Vertriebsargumentation überführen'],
    },
  },
  {
    id: 'frequentis',
    unternehmen: 'Frequentis Therapie GmbH',
    kurz: 'Frequentis',
    branche: 'Frequenzmedizin & Therapie',
    ort: 'Freiburg',
    mitarbeitende: 38,
    ansprechpartner: {
      name: 'Dr. Malte Sieber',
      rolle: 'Inhaber',
      email: 'm.sieber@frequentis-demo.de',
      telefon: '+49 761 00000-21',
    },
    betreuerId: 'tw',
    status: 'onboarding',
    start: '2026-07-27',
    ergebnis: '2026-08-18',
    fortschritt: 12,
    scores: {
      positionierung: 42,
      verstaendlichkeit: 28,
      differenzierung: 35,
      marktaktivierung: 39,
      website: 44,
      vertrieb: 46,
      social: 31,
      zielgruppen: 40,
      nutzenargumentation: 30,
      wettbewerb: 37,
    },
    social: {
      plattformen: {
        linkedin: { verbunden: false, score: 0, frequenz: 0, engagement: 0, follower: 0 },
        instagram: { verbunden: true, score: 38, frequenz: 2.4, engagement: 2.2, follower: 5120 },
        youtube: { verbunden: true, score: 29, frequenz: 0.3, engagement: 1.6, follower: 640 },
        facebook: { verbunden: true, score: 33, frequenz: 1.2, engagement: 0.9, follower: 3300 },
        fachpresse: { verbunden: false, score: 0, frequenz: 0, engagement: 0, follower: 0 },
      },
      luecken: [
        'Wirkprinzip wird ausschließlich fachlich erklärt',
        'Kein Kanal für Fachpublikum vorhanden',
      ],
      quickWins: ['Wirkprinzip in drei Alltagssätze übersetzen'],
    },
  },
  {
    id: 'orthoflex',
    unternehmen: 'OrthoFlex Medical',
    kurz: 'OrthoFlex',
    branche: 'MedTech & Medizingeräte',
    ort: 'Leipzig',
    mitarbeitende: 92,
    ansprechpartner: {
      name: 'Nina Baumann',
      rolle: 'Head of Marketing',
      email: 'n.baumann@orthoflex-demo.de',
      telefon: '+49 341 00000-15',
    },
    betreuerId: 'jk',
    status: 'bericht',
    start: '2026-07-06',
    ergebnis: '2026-07-31',
    fortschritt: 88,
    scores: {
      positionierung: 57,
      verstaendlichkeit: 63,
      differenzierung: 51,
      marktaktivierung: 48,
      website: 72,
      vertrieb: 38,
      social: 60,
      zielgruppen: 55,
      nutzenargumentation: 58,
      wettbewerb: 49,
    },
    social: {
      plattformen: {
        linkedin: { verbunden: true, score: 62, frequenz: 3.6, engagement: 2.8, follower: 8900 },
        instagram: { verbunden: true, score: 57, frequenz: 3.1, engagement: 3.4, follower: 14200 },
        youtube: { verbunden: false, score: 0, frequenz: 0, engagement: 0, follower: 0 },
        facebook: { verbunden: true, score: 44, frequenz: 1.4, engagement: 1.2, follower: 6100 },
        fachpresse: { verbunden: false, score: 0, frequenz: 0, engagement: 0, follower: 0 },
      },
      luecken: ['Vertriebsunterlagen weichen von der Website ab'],
      quickWins: ['Vertriebsunterlagen auf die Website-Kernaussage angleichen'],
    },
  },
  {
    id: 'vitalcare',
    unternehmen: 'VitalCare Pharma',
    kurz: 'VitalCare',
    branche: 'Pharma & Apotheke',
    ort: 'Ingelheim',
    mitarbeitende: 340,
    ansprechpartner: {
      name: 'Andreas Pohl',
      rolle: 'Geschäftsführung',
      email: 'a.pohl@vitalcare-demo.de',
      telefon: '+49 6132 00000-70',
    },
    betreuerId: 'tw',
    status: 'abgeschlossen',
    start: '2026-05-04',
    ergebnis: '2026-05-26',
    fortschritt: 100,
    scores: {
      positionierung: 74,
      verstaendlichkeit: 69,
      differenzierung: 66,
      marktaktivierung: 78,
      website: 71,
      vertrieb: 64,
      social: 58,
      zielgruppen: 72,
      nutzenargumentation: 67,
      wettbewerb: 70,
    },
    social: {
      plattformen: {
        linkedin: { verbunden: true, score: 71, frequenz: 4.8, engagement: 3.6, follower: 21500 },
        instagram: { verbunden: true, score: 54, frequenz: 2.2, engagement: 1.9, follower: 11800 },
        youtube: { verbunden: true, score: 61, frequenz: 0.9, engagement: 4.1, follower: 5400 },
        facebook: { verbunden: true, score: 49, frequenz: 1.8, engagement: 1.4, follower: 18200 },
        fachpresse: { verbunden: true, score: 68, frequenz: 2.1, engagement: 3.9, follower: 0 },
      },
      luecken: [],
      quickWins: ['Bestehende Sequenz auf das zweite Produktsegment übertragen'],
    },
  },
]

/* ------------------------------------------------------------- Generatoren */

/** Stabiler Pseudo-Zufall: gleiche Eingabe → gleiches Ergebnis. */
function hash(text) {
  let h = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

function pick(liste, seed) {
  return liste[hash(seed) % liste.length]
}

function tagePlus(basis, tage) {
  const d = new Date(basis)
  d.setDate(d.getDate() + tage)
  return d.toISOString().slice(0, 10)
}

const FREIGABE_NACH_STATUS = {
  onboarding: ['vorgeschlagen'],
  analyse: ['vorgeschlagen', 'pruefung'],
  pruefung: ['pruefung', 'bearbeitet', 'intern'],
  bericht: ['bearbeitet', 'intern', 'kunde'],
  umsetzung: ['kunde'],
  abgeschlossen: ['kunde'],
}

function baueAnalyse(seed) {
  const stufen = FREIGABE_NACH_STATUS[seed.status]
  return KATEGORIEN.map((kategorie, index) => {
    const score = seed.scores[kategorie.id]
    const stufe = stufeIndex(score)
    const texte = BEFUNDE[kategorie.id]
    const freigabe = stufen[(hash(seed.id + kategorie.id) + index) % stufen.length]

    return {
      kategorieId: kategorie.id,
      score,
      beobachtung: texte.beobachtung[stufe],
      ursache: texte.ursache[stufe],
      auswirkung: texte.auswirkung[stufe],
      empfehlung: texte.empfehlung[stufe],
      beleg: pick(
        [
          'Website-Analyse, 14 Unterseiten',
          'Vertriebsunterlagen (Stand Q2)',
          'Interview Vertriebsleitung',
          'Wettbewerbsvergleich, 4 Anbieter',
          'Kanalauswertung der letzten 90 Tage',
          'Angebotsdokumente, 6 Vorgänge',
        ],
        seed.id + kategorie.id + 'beleg',
      ),
      prioritaet: score < 40 ? 'hoch' : score < 58 ? 'mittel' : 'niedrig',
      freigabe,
      sichtbarKunde: freigabe === 'kunde',
      internNotiz:
        score < 45
          ? pick(
              [
                'Im Ergebnisgespräch als Erstes ansprechen – Kunde unterschätzt den Hebel.',
                'Datenlage dünn, vor Freigabe mit dem Vertrieb gegenprüfen.',
                'Formulierung entschärfen, Geschäftsführung reagiert sensibel auf das Thema.',
              ],
              seed.id + kategorie.id + 'notiz',
            )
          : '',
      kommentar: '',
    }
  })
}

function baueBremsen(seed, analyse) {
  return [...analyse]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((eintrag, i) => {
      const kategorie = KATEGORIEN.find((k) => k.id === eintrag.kategorieId)
      return {
        id: `${seed.id}-bremse-${i + 1}`,
        rang: i + 1,
        titel: kategorie.label,
        kategorieId: kategorie.id,
        prioritaet: i === 0 ? 'hoch' : i === 1 ? 'hoch' : 'mittel',
        beschreibung: eintrag.auswirkung,
        ursache: eintrag.ursache,
        score: eintrag.score,
        naechsteAktion: eintrag.empfehlung,
        status: seed.status === 'umsetzung' || seed.status === 'abgeschlossen' ? 'in-arbeit' : 'offen',
      }
    })
}

const PHASEN = [
  { id: 'p1', label: 'Tag 1–30', ziel: 'Ursache schließen' },
  { id: 'p2', label: 'Tag 31–60', ziel: 'Wirkung herstellen' },
  { id: 'p3', label: 'Tag 61–90', ziel: 'Nachfrage verankern' },
]

function baueAufgaben(seed, bremsen) {
  const aufgaben = []
  const vorlagen = [
    { titel: 'Positionierungssatz final abstimmen', verantwortlich: 'symmedis', kpi: 'Freigabe GF' },
    { titel: 'Primäre Zielgruppe verbindlich festlegen', verantwortlich: 'kunde', kpi: 'Beschluss dokumentiert' },
    { titel: 'Vertriebsunterlagen auf Kernaussage anpassen', verantwortlich: 'kunde', kpi: '4 Dokumente' },
    { titel: 'Belege in Vorteilsaussagen überführen', verantwortlich: 'symmedis', kpi: '3 Aussagen' },
    { titel: 'Einstiegsseite neu strukturieren', verantwortlich: 'kunde', kpi: 'Anfragequote' },
    { titel: 'Redaktionsplan mit fester Frequenz aufsetzen', verantwortlich: 'symmedis', kpi: '12 Wochen' },
    { titel: 'Übergabe Marketing → Vertrieb definieren', verantwortlich: 'kunde', kpi: 'SLA 24 h' },
    { titel: 'Wettbewerbsvergleich aufbauen', verantwortlich: 'symmedis', kpi: '3 Anbieter' },
    { titel: 'Einwandbehandlung für Top-5-Fälle festlegen', verantwortlich: 'kunde', kpi: '5 Antworten' },
  ]

  vorlagen.forEach((vorlage, i) => {
    const phase = PHASEN[Math.floor(i / 3)]
    const seedKey = seed.id + vorlage.titel
    const erledigt = seed.fortschritt > (i + 1) * 11
    const faellig = tagePlus(seed.ergebnis, i * 9 + 4)
    aufgaben.push({
      id: `${seed.id}-task-${i + 1}`,
      titel: vorlage.titel,
      phaseId: phase.id,
      kategorieId: bremsen[i % bremsen.length].kategorieId,
      verantwortlich: vorlage.verantwortlich,
      zustaendig: vorlage.verantwortlich === 'kunde' ? seed.ansprechpartner.name : TEAM_MAP[seed.betreuerId].name,
      prioritaet: i < 2 ? 'hoch' : i < 6 ? 'mittel' : 'niedrig',
      status: erledigt ? 'erledigt' : hash(seedKey) % 3 === 0 ? 'in-arbeit' : 'offen',
      faellig,
      kpi: vorlage.kpi,
    })
  })

  return aufgaben
}

function bauePlan(seed, aufgaben) {
  return PHASEN.map((phase) => ({
    ...phase,
    aufgaben: aufgaben.filter((a) => a.phaseId === phase.id),
  }))
}

function baueDokumente(seed) {
  const vorlagen = [
    { name: 'Vertriebspräsentation Q2', typ: 'pptx', groesse: 4_820_000, von: 'kunde' },
    { name: 'Produktkatalog 2026', typ: 'pdf', groesse: 12_400_000, von: 'kunde' },
    { name: 'Anwendungsstudie Rohstoffqualität', typ: 'pdf', groesse: 2_180_000, von: 'kunde' },
    { name: 'Website-Struktur Export', typ: 'xlsx', groesse: 340_000, von: 'symmedis' },
    { name: 'Analysebericht Entwurf', typ: 'docx', groesse: 880_000, von: 'symmedis' },
    { name: 'Wettbewerbsvergleich', typ: 'xlsx', groesse: 520_000, von: 'symmedis' },
  ]
  return vorlagen.map((vorlage, i) => ({
    id: `${seed.id}-doc-${i + 1}`,
    ...vorlage,
    version: hash(seed.id + vorlage.name) % 3 === 0 ? 2 : 1,
    hochgeladen: tagePlus(seed.start, i * 2 + 1),
    status: i < 4 ? 'geprueft' : 'neu',
  }))
}

function baueTermine(seed) {
  return [
    {
      id: `${seed.id}-termin-1`,
      titel: 'Zwischenstand Ursachenanalyse',
      datum: `${tagePlus(seed.ergebnis, -6)}T10:00:00`,
      dauer: 30,
      typ: 'video',
      teilnehmer: [TEAM_MAP[seed.betreuerId].name, seed.ansprechpartner.name],
    },
    {
      id: `${seed.id}-termin-2`,
      titel: 'Ergebnispräsentation und 90-Tage-Plan',
      datum: `${seed.ergebnis}T14:00:00`,
      dauer: 90,
      typ: 'vor-ort',
      teilnehmer: [TEAM_MAP[seed.betreuerId].name, 'T. Weiler', seed.ansprechpartner.name],
    },
  ]
}

function baueBerichte(seed) {
  const fertig = seed.status === 'umsetzung' || seed.status === 'abgeschlossen'
  return [
    {
      id: `${seed.id}-bericht-1`,
      titel: 'Strategiebericht Ursachenanalyse',
      typ: 'Hauptbericht',
      seiten: 24,
      stand: fertig ? 'final' : 'entwurf',
      datum: fertig ? seed.ergebnis : tagePlus(seed.ergebnis, -3),
      autor: TEAM_MAP[seed.betreuerId].name,
    },
    {
      id: `${seed.id}-bericht-2`,
      titel: 'Social-Media-Auswertung',
      typ: 'Teilbericht',
      seiten: 9,
      stand: seed.fortschritt > 50 ? 'final' : 'entwurf',
      datum: tagePlus(seed.start, 12),
      autor: 'S. Brandt',
    },
    {
      id: `${seed.id}-bericht-3`,
      titel: '90-Tage-Umsetzungsplan',
      typ: 'Plan',
      seiten: 6,
      stand: fertig ? 'final' : 'entwurf',
      datum: fertig ? seed.ergebnis : tagePlus(seed.ergebnis, -1),
      autor: TEAM_MAP[seed.betreuerId].name,
    },
  ]
}

function baueAktivitaet(seed) {
  const eintraege = [
    { titel: 'Analyse gestartet', tone: 'info', tage: 0, actor: TEAM_MAP[seed.betreuerId].name },
    { titel: 'Unterlagen vollständig gesichtet', tone: 'neutral', tage: 3, actor: TEAM_MAP[seed.betreuerId].name },
    { titel: 'Social-Media-Auswertung abgeschlossen', tone: 'accent', tage: 6, actor: 'S. Brandt' },
    { titel: 'Erste Ursachenbewertung erstellt', tone: 'brand', tage: 9, actor: 'Diagnosis OS' },
    { titel: 'Menschliche Prüfung begonnen', tone: 'warn', tage: 12, actor: TEAM_MAP[seed.betreuerId].name },
    { titel: 'Drei Umsatzbremsen priorisiert', tone: 'ok', tage: 15, actor: TEAM_MAP[seed.betreuerId].name },
  ]
  const sichtbar = Math.max(2, Math.round((seed.fortschritt / 100) * eintraege.length))
  return eintraege.slice(0, sichtbar).reverse().map((e, i) => ({
    id: `${seed.id}-akt-${i}`,
    titel: e.titel,
    actor: e.actor,
    tone: e.tone,
    zeit: `${tagePlus(seed.start, e.tage)}T09:${String(20 + i * 7).padStart(2, '0')}:00`,
  }))
}

const WETTBEWERBER_NAMEN = [
  ['Nordis Health', 'BioCare Nord', 'Vitalis Group'],
  ['LabOne Systems', 'Diagnostica Plus', 'Prüfwerk Medical'],
  ['CardioNorm', 'Pulsar Medizintechnik', 'Herzwerk Systeme'],
  ['ResonanzMed', 'Feldtherapie Süd', 'Vitalfrequenz AG'],
  ['OrthoPrime', 'Bewegungswerk', 'FlexMedica'],
  ['PharmaNord Zentral', 'Apotheker Allianz', 'MediDirekt'],
]

/**
 * Wettbewerbsvergleich über vier Dimensionen.
 * Demo-Daten: die Wettbewerber sind fiktiv und als solche gekennzeichnet.
 */
function baueWettbewerb(seed, index) {
  const namen = WETTBEWERBER_NAMEN[index % WETTBEWERBER_NAMEN.length]
  const dimensionen = ['positionierung', 'verstaendlichkeit', 'differenzierung', 'marktaktivierung']

  return {
    dimensionen,
    anbieter: [
      {
        id: 'eigen',
        name: seed.kurz,
        eigen: true,
        werte: dimensionen.map((d) => seed.scores[d]),
      },
      ...namen.map((name, i) => ({
        id: `w${i + 1}`,
        name,
        eigen: false,
        werte: dimensionen.map((d) => {
          const basis = seed.scores[d]
          const versatz = (hash(seed.id + name + d) % 46) - 18
          return Math.max(12, Math.min(94, basis + versatz))
        }),
      })),
    ],
    beobachtung: pick(
      [
        'Zwei Anbieter besetzen dieselbe Aussage wie Sie – ohne sie zu belegen. Der Unterschied entsteht dort, wo Sie Ihre Belege sichtbar machen.',
        'Der Markt argumentiert überwiegend über Technik. Ein wirtschaftlich formulierter Nutzen ist derzeit unbesetzt.',
        'Ihr stärkster Wettbewerber ist in der Aktivierung deutlich konsequenter, inhaltlich aber austauschbar.',
      ],
      seed.id + 'wettbewerb',
    ),
  }
}

function baueChat(seed) {
  return [
    {
      id: `${seed.id}-msg-1`,
      from: 'kunde',
      author: seed.ansprechpartner.name,
      text: 'Guten Tag, wir haben die angeforderten Vertriebsunterlagen hochgeladen. Reicht das so für den nächsten Schritt?',
      zeit: `${tagePlus(seed.start, 2)}T08:41:00`,
    },
    {
      id: `${seed.id}-msg-2`,
      from: 'symmedis',
      via: 'team',
      author: TEAM_MAP[seed.betreuerId].name,
      text: 'Guten Tag, vielen Dank – die Unterlagen sind vollständig. Wir starten mit der Sichtung und melden uns mit ersten Beobachtungen.',
      zeit: `${tagePlus(seed.start, 2)}T09:52:00`,
    },
    {
      id: `${seed.id}-msg-3`,
      from: 'kunde',
      author: seed.ansprechpartner.name,
      text: 'Sehr gern. Eine Frage vorab: Sehen Sie unsere Positionierung als Hauptproblem oder eher die Website?',
      zeit: `${tagePlus(seed.start, 4)}T10:07:00`,
    },
  ]
}

/* ------------------------------------------------------------ Zusammenbau */

export function baueKunde(seed, index = 0) {
  const analyse = baueAnalyse(seed)
  const bremsen = baueBremsen(seed, analyse)
  const aufgaben = baueAufgaben(seed, bremsen)

  const gesamtScore = Math.round(
    KATEGORIEN.reduce((sum, k) => sum + seed.scores[k.id], 0) / KATEGORIEN.length,
  )

  const plattformen = PLATTFORMEN.map((p) => ({
    ...p,
    ...seed.social.plattformen[p.id],
    verlauf: Array.from({ length: 8 }, (_, i) => {
      const basis = seed.social.plattformen[p.id].score
      if (!basis) return 0
      return Math.max(5, Math.round(basis - 12 + ((hash(seed.id + p.id + i) % 18) + i * 1.4)))
    }),
  }))

  const verbunden = plattformen.filter((p) => p.verbunden)
  const socialGesamt = verbunden.length
    ? Math.round(verbunden.reduce((s, p) => s + p.score, 0) / verbunden.length)
    : 0

  return {
    ...seed,
    gesamtScore,
    analyse,
    bremsen,
    aufgaben,
    plan: bauePlan(seed, aufgaben),
    dokumente: baueDokumente(seed),
    termine: baueTermine(seed),
    berichte: baueBerichte(seed),
    aktivitaet: baueAktivitaet(seed),
    chat: baueChat(seed),
    wettbewerb: baueWettbewerb(seed, index),
    social: {
      gesamt: socialGesamt,
      plattformen,
      luecken: seed.social.luecken,
      quickWins: seed.social.quickWins,
      frequenz: Number(
        (verbunden.reduce((s, p) => s + p.frequenz, 0) / (verbunden.length || 1)).toFixed(1),
      ),
      engagement: Number(
        (verbunden.reduce((s, p) => s + p.engagement, 0) / (verbunden.length || 1)).toFixed(1),
      ),
      konsistenz: Math.max(20, Math.min(92, socialGesamt + (hash(seed.id) % 16) - 6)),
      ctaNutzung: Math.max(10, Math.min(80, socialGesamt - 12 + (hash(seed.id + 'cta') % 20))),
    },
    notizenIntern: [
      {
        id: `${seed.id}-note-1`,
        autor: TEAM_MAP[seed.betreuerId].name,
        zeit: `${tagePlus(seed.start, 5)}T16:20:00`,
        text: 'Geschäftsführung ist offen für klare Ansagen, Marketing eher defensiv. Ergebnispräsentation entsprechend aufbauen.',
      },
      {
        id: `${seed.id}-note-2`,
        autor: 'S. Brandt',
        zeit: `${tagePlus(seed.start, 8)}T11:05:00`,
        text: 'Social-Daten nur teilweise verfügbar – Auswertung basiert auf öffentlich sichtbaren Beiträgen der letzten 90 Tage.',
      },
    ],
  }
}

/** Vollständiger Demo-Datenbestand. */
export function createWorkspace() {
  return SEEDS.map((seed, index) => baueKunde(seed, index))
}

export { PHASEN, SEEDS }
