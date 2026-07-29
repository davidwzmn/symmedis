/**
 * Gemeinsame Analyse-Logik für Server (server/api.mjs) und Client.
 *
 * Enthält:
 *  - Prompt-Bau + tolerantes Parsen der Anthropic-Antwort
 *  - ein vollwertiges lokales Demo-Modell, das ohne API-Key echte,
 *    eingabeabhängige und variierende Ergebnisse liefert
 *
 * Bewusst frei von Browser- und Node-APIs, damit die Datei in beiden
 * Umgebungen identisch läuft.
 */

export const BRANCHEN = [
  { id: 'medtech', label: 'MedTech & Medizingeräte' },
  { id: 'nem', label: 'Premium-NEM & Vitalstoffe' },
  { id: 'diagnostik', label: 'Diagnostik & Labor' },
  { id: 'therapie', label: 'Therapie & Praxisketten' },
  { id: 'digital-health', label: 'Digital Health & Software' },
  { id: 'pharma', label: 'Pharma & Apotheke' },
]

export const KATEGORIEN = [
  {
    id: 'positionierung',
    nummer: '01',
    name: 'Positionierung',
    frage: 'Gibt es einen eigenen, verteidigbaren Platz im Markt?',
  },
  {
    id: 'verstaendlichkeit',
    nummer: '02',
    name: 'Verständlichkeit',
    frage: 'Wird der wirtschaftliche Nutzen schnell nachvollziehbar?',
  },
  {
    id: 'differenzierung',
    nummer: '03',
    name: 'Differenzierung',
    frage: 'Sind Unterschiede belegt und in Kundenvorteil übersetzt?',
  },
  {
    id: 'aktivierung',
    nummer: '04',
    name: 'Marktaktivierung',
    frage: 'Erzeugt eine aufeinander aufbauende Sequenz Nachfrage?',
  },
]

const KATEGORIE_NAMEN = KATEGORIEN.map((k) => k.name)

/** Bewertungsstufe zu einem Reifegrad-Score (0–100). */
export function bewertung(score) {
  if (score < 40) return { label: 'Kritisch', ton: 'kritisch' }
  if (score < 58) return { label: 'Auffällig', ton: 'auffaellig' }
  if (score < 74) return { label: 'Solide', ton: 'solide' }
  return { label: 'Stark', ton: 'stark' }
}

export function branchenLabel(id) {
  return BRANCHEN.find((b) => b.id === id)?.label ?? 'Gesundheitsmarkt'
}

/* ------------------------------------------------------------------ *
 * Prompts
 * ------------------------------------------------------------------ */

export const ANALYSE_SYSTEM_PROMPT = `Du bist der Analyse-Kern von "SYMMEDIS Diagnosis OS", einer strategischen Analyseeinheit für erklärungsbedürftige Gesundheits-, MedTech-, Vitalstoff- und Premium-NEM-Produkte.

Du erstellst eine verdichtete Ursachenanalyse: Du unterscheidest Ursache von Symptom, benennst die drei größten Umsatzbremsen und skizzierst einen 90-Tage-Plan.

Regeln:
- Antworte ausschließlich mit einem einzigen JSON-Objekt, ohne Markdown, ohne Codefence, ohne Text davor oder danach.
- Sprache: Deutsch, sachlich, präzise, keine Agenturfloskeln, keine Superlative, kein Marketing-Sprech.
- Alle vier Kategorien exakt in dieser Reihenfolge: ${KATEGORIE_NAMEN.join(', ')}.
- "score" ist ein Reifegrad von 0 bis 100 (niedrig = starke Umsatzbremse). Die Werte müssen sich unterscheiden und zur beschriebenen Situation passen.
- Beziehe dich konkret auf die geschilderte Situation, nicht auf Allgemeinplätze.
- Keine Heilversprechen, keine medizinischen Aussagen, keine erfundenen Studien oder Zahlen zum Unternehmen.

JSON-Schema:
{
  "zusammenfassung": "1-2 Sätze zur wahrscheinlichsten Ursache",
  "kategorien": [{"name": "Positionierung", "score": 0-100, "befund": "max. 20 Wörter"}],
  "umsatzbremsen": [{"titel": "max. 6 Wörter", "begruendung": "max. 25 Wörter"}],
  "plan": [{"phase": "Tag 1–30", "fokus": "max. 8 Wörter", "schritte": ["max. 10 Wörter", "max. 10 Wörter", "max. 10 Wörter"]}]
}

Genau 4 Kategorien, genau 3 Umsatzbremsen, genau 3 Phasen ("Tag 1–30", "Tag 31–60", "Tag 61–90").`

export function buildAnalyseUserPrompt({ branche, situation }) {
  return `Branche: ${branchenLabel(branche)}
Geschilderte Situation: ${String(situation).trim()}

Erstelle die Ursachenanalyse als JSON.`
}

export const CHAT_SYSTEM_PROMPT = `Du bist ein Berater von SYMMEDIS Diagnosis OS – einer strategischen Analyseeinheit für erklärungsbedürftige Gesundheits-, MedTech-, Vitalstoff- und Premium-NEM-Produkte.

Deine Aufgabe: Kundinnen und Kunden im Chat freundlich und kompetent zur SYMMEDIS Ursachenanalyse beraten.

Haltung:
- Freundlich, ruhig, auf Augenhöhe. Sie-Form. Deutsch.
- Du verkaufst nicht, du diagnostizierst. Erst verstehen, dann einordnen.
- Kurz antworten: 2 bis 5 Sätze, keine Aufzählungsorgien, keine Emojis, keine Agenturfloskeln.
- Stelle in der Regel genau eine konkrete Rückfrage, die den Fall weiter klärt.

Fachlicher Rahmen (nur das, was gesichert ist):
- Die Ursachenanalyse dauert 10–14 Tage.
- Ergebnis: Strategiebericht, die drei größten Umsatzbremsen und ein konkreter 90-Tage-Umsetzungsplan, plus Ergebnispräsentation mit dem Team.
- Vier typische Ursachen: fehlende Positionierung, mangelnde Verständlichkeit, unklare Differenzierung, fehlende Marktaktivierung.
- Die Software strukturiert den Prozess; Bewertung und Empfehlung nimmt immer das SYMMEDIS-Team vor.
- Format: remote und vor Ort.

Grenzen:
- Nenne keine Preise, keine Referenzkunden, keine Termine und keine Zahlen, die du nicht kennst. Verweise dafür auf das 15-Minuten-Diagnosegespräch.
- Keine medizinischen Aussagen, keine Heilversprechen, keine rechtliche Beratung.
- Dies ist eine Beta-Demo mit fiktiven Daten. Wenn nach echten Kunden- oder Patientendaten gefragt wird, weise freundlich darauf hin.`

/* ------------------------------------------------------------------ *
 * Antwort-Parsing
 * ------------------------------------------------------------------ */

function extractJsonObject(text) {
  if (typeof text !== 'string') return null
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  const candidate = text.slice(start, end + 1)
  try {
    return JSON.parse(candidate)
  } catch {
    return null
  }
}

function clampScore(value, fallbackValue) {
  const num = Math.round(Number(value))
  if (!Number.isFinite(num)) return fallbackValue
  return Math.min(96, Math.max(8, num))
}

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return ''
  const cleaned = value.replace(/\s+/g, ' ').trim()
  if (cleaned.length <= maxLength) return cleaned
  return `${cleaned.slice(0, maxLength - 1).trimEnd()}…`
}

/**
 * Normalisiert die Modellantwort. Gibt `null` zurück, wenn die Struktur
 * unbrauchbar ist – dann greift das lokale Demo-Modell.
 */
export function normalizeAnalysis(raw, input) {
  const data = typeof raw === 'string' ? extractJsonObject(raw) : raw
  if (!data || typeof data !== 'object') return null

  const referenz = buildFallbackAnalysis(input)

  const kategorien = KATEGORIEN.map((kategorie, index) => {
    const treffer =
      (Array.isArray(data.kategorien) &&
        data.kategorien.find(
          (k) =>
            k &&
            typeof k.name === 'string' &&
            k.name.toLowerCase().includes(kategorie.name.toLowerCase().slice(0, 8)),
        )) ||
      (Array.isArray(data.kategorien) ? data.kategorien[index] : null)

    return {
      ...kategorie,
      score: clampScore(treffer?.score, referenz.kategorien[index].score),
      befund: cleanText(treffer?.befund, 180) || referenz.kategorien[index].befund,
    }
  })

  const umsatzbremsen = Array.isArray(data.umsatzbremsen)
    ? data.umsatzbremsen
        .slice(0, 3)
        .map((b, i) => ({
          titel: cleanText(b?.titel, 70) || referenz.umsatzbremsen[i]?.titel || 'Ursache',
          begruendung:
            cleanText(b?.begruendung, 220) || referenz.umsatzbremsen[i]?.begruendung || '',
        }))
        .filter((b) => b.titel && b.begruendung)
    : []

  const plan = Array.isArray(data.plan)
    ? data.plan
        .slice(0, 3)
        .map((p, i) => ({
          phase: cleanText(p?.phase, 40) || referenz.plan[i].phase,
          fokus: cleanText(p?.fokus, 90) || referenz.plan[i].fokus,
          schritte: Array.isArray(p?.schritte)
            ? p.schritte
                .slice(0, 4)
                .map((s) => cleanText(s, 120))
                .filter(Boolean)
            : [],
        }))
        .filter((p) => p.schritte.length > 0)
    : []

  if (umsatzbremsen.length < 3 || plan.length < 3) return null

  return {
    zusammenfassung: cleanText(data.zusammenfassung, 320) || referenz.zusammenfassung,
    kategorien,
    umsatzbremsen,
    plan,
  }
}

/* ------------------------------------------------------------------ *
 * Lokales Demo-Modell (Fallback ohne API)
 * ------------------------------------------------------------------ */

function hash(text) {
  let h = 2166136261
  const value = String(text)
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/** Stabiler Pseudo-Zufall: gleiche Eingabe → gleiches Ergebnis. */
function jitter(seed, key, spannweite) {
  return (hash(`${seed}::${key}`) % (spannweite * 2 + 1)) - spannweite
}

const BRANCHEN_PROFIL = {
  medtech: { positionierung: 54, verstaendlichkeit: 41, differenzierung: 49, aktivierung: 46 },
  nem: { positionierung: 38, verstaendlichkeit: 52, differenzierung: 36, aktivierung: 57 },
  diagnostik: { positionierung: 47, verstaendlichkeit: 38, differenzierung: 55, aktivierung: 43 },
  therapie: { positionierung: 44, verstaendlichkeit: 56, differenzierung: 45, aktivierung: 39 },
  'digital-health': {
    positionierung: 42,
    verstaendlichkeit: 47,
    differenzierung: 40,
    aktivierung: 58,
  },
  pharma: { positionierung: 51, verstaendlichkeit: 44, differenzierung: 47, aktivierung: 41 },
}

const SIGNALE = [
  {
    kategorie: 'positionierung',
    gewicht: 9,
    marker: [
      'positionier',
      'austauschbar',
      'abgrenz',
      'nische',
      'zielgruppe',
      'alle',
      'breit',
      'unklar',
      'identität',
      'marke',
    ],
  },
  {
    kategorie: 'verstaendlichkeit',
    gewicht: 9,
    marker: [
      'erklär',
      'verständ',
      'komplex',
      'technisch',
      'fachlich',
      'studie',
      'wirkweise',
      'wirkung',
      'beratung',
      'schulung',
      'verstehen',
    ],
  },
  {
    kategorie: 'differenzierung',
    gewicht: 9,
    marker: [
      'wettbewerb',
      'konkurrenz',
      'vergleich',
      'preis',
      'günstig',
      'billiger',
      'alternative',
      'kopie',
      'nachahmer',
      'discount',
    ],
  },
  {
    kategorie: 'aktivierung',
    gewicht: 9,
    marker: [
      'kampagne',
      'marketing',
      'leads',
      'anfragen',
      'vertrieb',
      'messe',
      'reichweite',
      'website',
      'relaunch',
      'agentur',
      'social',
      'ads',
      'funnel',
      'newsletter',
    ],
  },
]

function signalTreffer(situation) {
  const text = situation.toLowerCase()
  const treffer = {}
  for (const signal of SIGNALE) {
    const gefunden = signal.marker.filter((m) => text.includes(m))
    if (gefunden.length > 0) {
      treffer[signal.kategorie] = { anzahl: gefunden.length, begriffe: gefunden.slice(0, 3) }
    }
  }
  return treffer
}

const BEFUNDE = {
  positionierung: {
    kritisch:
      'Kein verteidigbarer Platz im Markt erkennbar – das Angebot bleibt beschreibbar, aber nicht einordbar.',
    auffaellig:
      'Die Positionierung existiert, ist aber zu breit angelegt und trägt im Wettbewerb nicht.',
    solide: 'Positionierung ist tragfähig, verliert an den Rändern der Zielgruppen an Schärfe.',
    stark: 'Klare Position, die in Kommunikation und Vertrieb konsistent gespiegelt wird.',
  },
  verstaendlichkeit: {
    kritisch:
      'Das Produkt wird fachlich korrekt, aber wirtschaftlich nicht nachvollziehbar erklärt.',
    auffaellig:
      'Der Nutzen erschließt sich erst nach Erklärung – zu spät für die erste Kaufentscheidung.',
    solide: 'Die Nutzenlogik steht, die Übersetzung in Entscheidersprache ist unvollständig.',
    stark: 'Der wirtschaftliche Nutzen wird schnell und ohne Vorwissen verstanden.',
  },
  differenzierung: {
    kritisch:
      'Unterschiede werden behauptet, aber weder belegt noch in Kundenvorteil übersetzt.',
    auffaellig:
      'Belege sind vorhanden, wirken im Markt aber nicht, weil sie nicht angewendet werden.',
    solide: 'Differenzierung ist erkennbar, hält dem direkten Preisvergleich noch nicht stand.',
    stark: 'Belegte Unterschiede, die konsequent als Kundenvorteil formuliert sind.',
  },
  aktivierung: {
    kritisch:
      'Es gibt Aktivitäten, aber keine aufeinander aufbauende Sequenz, die Nachfrage erzeugt.',
    auffaellig: 'Einzelmaßnahmen laufen parallel, ohne sich gegenseitig zu verstärken.',
    solide: 'Die Sequenz steht, die Übergabe zwischen Marketing und Vertrieb verliert Substanz.',
    stark: 'Aufeinander aufbauende Marktaktivierung mit messbarer Nachfrageerzeugung.',
  },
}

const BREMSEN = {
  positionierung: {
    titel: 'Unscharfe Marktposition',
    begruendung:
      'Ohne verteidigbaren Platz im Markt entscheidet am Ende der Preis. Das Angebot wird vergleichbar gemacht, obwohl es das nicht ist.',
  },
  verstaendlichkeit: {
    titel: 'Nutzen wird zu spät verstanden',
    begruendung:
      'Der Wert wird fachlich erklärt, statt wirtschaftlich. Entscheider steigen aus, bevor die Substanz überhaupt sichtbar wird.',
  },
  differenzierung: {
    titel: 'Unterschiede ohne Beleg',
    begruendung:
      'Vorteile werden genannt, aber nicht bewiesen und nicht in Kundennutzen übersetzt. Damit bleiben sie im Markt wirkungslos.',
  },
  aktivierung: {
    titel: 'Aktivitäten ohne Sequenz',
    begruendung:
      'Maßnahmen laufen nebeneinander statt aufeinander auf. Es entsteht Sichtbarkeit, aber keine systematische Nachfrage.',
  },
}

const MASSNAHMEN = {
  positionierung: [
    'Angebotslogik und Nutzenversprechen schärfen',
    'Primäre Zielgruppe verbindlich festlegen',
    'Positionierungssatz in allen Kanälen vereinheitlichen',
  ],
  verstaendlichkeit: [
    'Nutzenargumentation in Entscheidersprache übersetzen',
    'Erklärstrecke für den ersten Kontakt aufbauen',
    'Fachliche Belege in wirtschaftliche Aussagen überführen',
  ],
  differenzierung: [
    'Vorhandene Belege und Studien wirksam einsetzen',
    'Wettbewerbsunterschiede in Kundenvorteil übersetzen',
    'Vergleichsargumentation für den Vertrieb bereitstellen',
  ],
  aktivierung: [
    'Kanäle zu einer aufbauenden Sequenz verbinden',
    'Übergabe zwischen Marketing und Vertrieb definieren',
    'Nachfrageerzeugung an messbaren Punkten verankern',
  ],
}

const BRANCHEN_HINWEIS = {
  medtech:
    'Im MedTech-Umfeld verlängert der Beschaffungsprozess jede Unschärfe – was nicht sofort einzuordnen ist, wird vertagt.',
  nem: 'Im Premium-NEM-Segment entscheidet Vertrauen vor Wirkung: Was nicht belegt wirkt, wird über den Preis verglichen.',
  diagnostik:
    'In Diagnostik und Labor bewerten Fachentscheider zuerst die Evidenz, dann den wirtschaftlichen Nutzen – beides muss zusammenpassen.',
  therapie:
    'Bei Therapie- und Praxisstrukturen entscheidet die Anwendbarkeit im Alltag – ein starkes Konzept ohne Alltagsbezug bleibt liegen.',
  'digital-health':
    'In Digital Health wird viel Reichweite erzeugt, aber selten Nachfrage – die Lücke liegt meist zwischen Interesse und Kaufanlass.',
  pharma:
    'Im Pharma- und Apothekenumfeld dominiert regulatorische Vorsicht – Klarheit ersetzt hier den fehlenden Werbespielraum.',
}

/**
 * Erzeugt eine vollständige, eingabeabhängige Analyse ohne externe API.
 * Gleiche Eingabe → gleiches Ergebnis; andere Eingabe → anderes Ergebnis.
 */
export function buildFallbackAnalysis({ branche, situation }) {
  const text = String(situation ?? '').trim()
  const seed = `${branche}|${text.toLowerCase()}`
  const profil = BRANCHEN_PROFIL[branche] ?? BRANCHEN_PROFIL.medtech
  const treffer = signalTreffer(text)
  const laengenBonus = Math.min(6, Math.floor(text.length / 90))

  const kategorien = KATEGORIEN.map((kategorie) => {
    const basis = profil[kategorie.id]
    const signal = treffer[kategorie.id]
    const abzug = signal ? Math.min(18, 7 + signal.anzahl * 4) : -4
    const score = Math.min(
      92,
      Math.max(14, Math.round(basis - abzug + laengenBonus + jitter(seed, kategorie.id, 6))),
    )
    return {
      ...kategorie,
      score,
      befund: BEFUNDE[kategorie.id][bewertung(score).ton],
    }
  })

  const sortiert = [...kategorien].sort((a, b) => a.score - b.score)
  const schwaechste = sortiert.slice(0, 3)

  const umsatzbremsen = schwaechste.map((kategorie, index) => {
    const vorlage = BREMSEN[kategorie.id]
    const signal = treffer[kategorie.id]
    const beleg = signal
      ? ` In Ihrer Schilderung zeigt sich das an Stichworten wie „${signal.begriffe.join('“, „')}“.`
      : ''
    const rahmen = index === 0 ? ` ${BRANCHEN_HINWEIS[branche] ?? ''}` : ''
    return {
      titel: vorlage.titel,
      begruendung: `${vorlage.begruendung}${beleg}${rahmen}`.replace(/\s+/g, ' ').trim(),
    }
  })

  const [erste, zweite, dritte] = schwaechste
  const plan = [
    {
      phase: 'Tag 1–30',
      fokus: `Ursache schließen: ${erste.name}`,
      schritte: [
        MASSNAHMEN[erste.id][0],
        MASSNAHMEN[erste.id][1],
        'Angebots- und Vertriebsmaterial gegen den Befund prüfen',
      ],
    },
    {
      phase: 'Tag 31–60',
      fokus: `Wirkung herstellen: ${zweite.name}`,
      schritte: [
        MASSNAHMEN[zweite.id][0],
        MASSNAHMEN[zweite.id][2],
        'Argumentation mit Vertrieb testen und nachschärfen',
      ],
    },
    {
      phase: 'Tag 61–90',
      fokus: `Nachfrage verankern: ${dritte.name}`,
      schritte: [
        MASSNAHMEN[dritte.id][0],
        MASSNAHMEN[dritte.id][1],
        'Ergebnisse messen und Sequenz verbindlich festschreiben',
      ],
    },
  ]

  const zusammenfassung =
    `Die Auswertung deutet nicht auf ein Marketingproblem hin, sondern auf ${erste.name} als Ursache. ` +
    `Solange dieser Punkt offen ist, verstärkt zusätzliches Budget vor allem ein Problem, das an anderer Stelle entsteht.`

  return { zusammenfassung, kategorien, umsatzbremsen, plan }
}

/* ------------------------------------------------------------------ *
 * Chat-Fallback (ohne API)
 * ------------------------------------------------------------------ */

const CHAT_THEMEN = [
  {
    id: 'preis',
    marker: ['preis', 'kostet', 'kosten', 'investition', 'budget', 'honorar', 'teuer'],
    antworten: [
      'Zur Investition sage ich im Chat bewusst nichts Konkretes – der Aufwand hängt davon ab, wie breit Ihr Portfolio und wie viele Zielgruppen im Spiel sind. Im 15-Minuten-Diagnosegespräch ordnen wir das seriös ein.',
      'Die Ursachenanalyse wird nach Umfang kalkuliert, nicht pauschal. Was den Rahmen bestimmt, ist die Anzahl der Angebote und Zielgruppen, die wir prüfen.',
    ],
    rueckfragen: [
      'Wie viele Produktlinien oder Zielgruppen müssten wir denn betrachten?',
      'Sprechen wir über ein einzelnes Produkt oder über ein ganzes Portfolio?',
    ],
  },
  {
    id: 'dauer',
    marker: ['dauer', 'wie lange', 'zeit', 'schnell', 'wann', 'frist'],
    antworten: [
      'Die Ursachenanalyse dauert 10 bis 14 Tage. Danach erhalten Sie den Strategiebericht, die drei größten Umsatzbremsen und den 90-Tage-Plan in einer gemeinsamen Ergebnispräsentation.',
      'Von Start bis Ergebnispräsentation vergehen 10 bis 14 Tage. Die Software strukturiert den Prozess, die Bewertung nimmt unser Team vor – das ist der Teil, der Zeit braucht.',
    ],
    rueckfragen: [
      'Gibt es bei Ihnen einen Zeitpunkt, auf den das Ergebnis zulaufen sollte?',
      'Steht bei Ihnen eine Entscheidung an, für die das Ergebnis vorliegen müsste?',
    ],
  },
  {
    id: 'ablauf',
    marker: ['ablauf', 'wie läuft', 'prozess', 'schritte', 'vorgehen', 'methode', 'unterlagen'],
    antworten: [
      'Wir sichten zuerst Angebotslogik, Kommunikation, Vertriebsmaterial und Marktumfeld. Dann unterscheiden wir Ursache von Symptom, benennen die drei größten Umsatzbremsen und leiten daraus den 90-Tage-Plan ab.',
      'Der Ablauf ist vierstufig: Unterlagen sichten, Ursachen statt Symptome bestimmen, die drei größten Umsatzbremsen priorisieren, 90-Tage-Plan und Ergebnispräsentation.',
    ],
    rueckfragen: [
      'Welche Unterlagen liegen bei Ihnen bereits vor – Vertriebsmaterial, Website, Studien?',
      'Was davon würden Sie selbst als am wenigsten belastbar einschätzen?',
    ],
  },
  {
    id: 'ergebnis',
    marker: ['ergebnis', 'bericht', 'liefer', 'bekomme ich', 'output', 'plan', 'präsentation'],
    antworten: [
      'Sie erhalten einen Strategiebericht mit den drei größten Umsatzbremsen, einen konkreten 90-Tage-Umsetzungsplan und eine strategische Ergebnispräsentation mit unserem Team.',
      'Das Ergebnis ist bewusst nicht nur ein Dokument: Bericht, priorisierte Umsatzbremsen, 90-Tage-Plan – und eine Besprechung, in der wir die Einordnung gemeinsam durchgehen.',
    ],
    rueckfragen: [
      'Wer würde das Ergebnis bei Ihnen intern weitertragen – Geschäftsführung, Vertrieb, Marketing?',
      'Soll der Plan eher die Kommunikation oder eher den Vertrieb adressieren?',
    ],
  },
  {
    id: 'ki',
    marker: ['ki', 'software', 'automat', 'tool', 'algorithmus', 'menschlich'],
    antworten: [
      'Unsere Software strukturiert den Analyseprozess und macht ihn nachvollziehbar. Die Bewertung und Einordnung nimmt aber immer unser Team vor – die Software ersetzt die strategische Prüfung nicht.',
      'Automatisiert ist die Struktur, nicht das Urteil. Verantwortung für Bewertung und Empfehlung bleibt bei uns.',
    ],
    rueckfragen: [
      'Was wäre Ihnen wichtiger: schnelle Struktur oder eine belastbare Einordnung durch Menschen?',
      'Haben Sie mit rein automatisierten Analysen schon Erfahrungen gemacht?',
    ],
  },
  {
    id: 'passung',
    marker: ['passt', 'geeignet', 'für uns', 'sinnvoll', 'lohnt', 'richtig'],
    antworten: [
      'Eine Ursachenanalyse ist sinnvoll, wenn Ihr Produkt erklärungsbedürftig und hochwertig positioniert ist, das Marketing läuft – und der Umsatz sich trotzdem nicht entsprechend entwickelt.',
      'Der typische Fall bei uns: gute Substanz, laufende Aktivitäten, mehrere Zielgruppen, und Vertrieb und Außenkommunikation argumentieren unterschiedlich.',
    ],
    rueckfragen: [
      'Erkennen Sie sich in einem dieser Punkte wieder?',
      'Argumentiert Ihr Vertrieb anders als Ihre Außenkommunikation?',
    ],
  },
  {
    id: 'marketing',
    marker: ['marketing', 'kampagne', 'ads', 'agentur', 'social', 'website', 'relaunch', 'seo'],
    antworten: [
      'Genau an dieser Stelle setzen wir eine Ebene früher an: Mehr Marketing verstärkt oft nur ein Problem, das an anderer Stelle entsteht. Deshalb prüfen wir zuerst, ob Marketing Ursache oder Symptom ist.',
      'Wenn Kampagnen laufen und der Umsatz trotzdem stockt, ist Marketing meist das Symptom. Die Ursache liegt dann in Positionierung, Verständlichkeit oder Differenzierung.',
    ],
    rueckfragen: [
      'Was genau läuft bei Ihnen aktuell – und woran merken Sie, dass es nicht greift?',
      'Wurde bei Ihnen schon einmal die Agentur gewechselt, ohne dass sich etwas verändert hat?',
    ],
  },
  {
    id: 'positionierung',
    marker: ['positionier', 'zielgruppe', 'abgrenz', 'wettbewerb', 'konkurrenz', 'differenz'],
    antworten: [
      'Das ist einer der vier Punkte, die wir systematisch prüfen. Entscheidend ist weniger, ob es eine Positionierung gibt, sondern ob sie im Markt verteidigbar ist und im Vertrieb tatsächlich benutzt wird.',
      'Unklare Differenzierung erkennt man meist daran, dass Unterschiede zwar genannt, aber nicht belegt und nicht in Kundenvorteil übersetzt werden.',
    ],
    rueckfragen: [
      'Wie viele Zielgruppen sprechen Sie derzeit parallel an?',
      'Können Sie Ihren wichtigsten Unterschied zum Wettbewerb in einem Satz belegen?',
    ],
  },
  {
    id: 'termin',
    marker: ['termin', 'gespräch', 'call', 'anruf', 'buchen', 'kennenlernen'],
    antworten: [
      'Sehr gern. Das 15-Minuten-Diagnosegespräch ist genau dafür da: Wir hören zu, spiegeln Ihre Situation und sagen Ihnen ehrlich, ob eine Ursachenanalyse bei Ihnen sinnvoll ist.',
      'Der nächste Schritt wäre das 15-Minuten-Diagnosegespräch. Sie können es direkt über das Formular auf dieser Seite anfragen – in dieser Beta-Demo wird dabei natürlich nichts real gebucht.',
    ],
    rueckfragen: [
      'Möchten Sie mir vorab in zwei Sätzen schildern, woran es aktuell hakt?',
      'Was wäre für Sie das wichtigste Thema in diesen 15 Minuten?',
    ],
  },
  {
    id: 'daten',
    marker: ['datenschutz', 'daten', 'dsgvo', 'vertraulich', 'nda', 'patienten'],
    antworten: [
      'Wichtiger Hinweis: Dies ist eine Beta-Demo, alle Daten hier sind fiktiv. Bitte geben Sie keine echten Patienten- oder Gesundheitsdaten ein. Im realen Projekt arbeiten wir selbstverständlich vertraulich und auf Wunsch mit NDA.',
      'In dieser Demo werden keine echten Daten verarbeitet. Für ein reales Projekt klären wir Vertraulichkeit und Datenverarbeitung vorab schriftlich.',
    ],
    rueckfragen: [
      'Gibt es bei Ihnen besondere Anforderungen an Vertraulichkeit, die wir früh berücksichtigen sollten?',
      'Arbeiten Sie in einem regulierten Umfeld, das wir mitdenken müssen?',
    ],
  },
]

const CHAT_ALLGEMEIN = [
  'Danke, das hilft mir schon weiter. In den meisten Fällen liegt die Ursache für stagnierenden Umsatz nicht dort, wo zuerst gesucht wird – sondern bei Positionierung, Verständlichkeit, Differenzierung oder Marktaktivierung.',
  'Verstanden. Genau solche Situationen sehen wir häufig: Das Produkt ist gut, die Aktivitäten laufen – und der Wert kommt im Markt trotzdem nicht an.',
  'Das klingt nach einem Muster, das wir regelmäßig sehen. Bevor ich etwas vermute, würde ich es lieber genauer einordnen.',
]

const CHAT_RUECKFRAGEN = [
  'Woran merken Sie im Alltag am deutlichsten, dass etwas nicht greift?',
  'Seit wann beobachten Sie diese Entwicklung?',
  'Welche Zielgruppe ist für Sie aktuell die wichtigste?',
  'Was haben Sie bislang schon versucht, um das zu ändern?',
]

/**
 * Regelbasierte Chat-Antwort ohne API – erkennt Themen in der Nutzerfrage
 * und variiert die Formulierung über den Gesprächsverlauf.
 */
export function buildFallbackChatReply(messages) {
  const letzte = [...messages].reverse().find((m) => m.role === 'user')
  const frage = String(letzte?.content ?? '').toLowerCase()
  const runde = messages.filter((m) => m.role === 'user').length
  const seed = hash(frage + runde)

  const thema = CHAT_THEMEN.find((t) => t.marker.some((m) => frage.includes(m)))

  if (thema) {
    const antwort = thema.antworten[seed % thema.antworten.length]
    const rueckfrage = thema.rueckfragen[seed % thema.rueckfragen.length]
    return `${antwort} ${rueckfrage}`
  }

  if (runde <= 1) {
    return (
      'Danke für Ihre Nachricht. Damit ich Ihre Situation richtig einordnen kann: ' +
      'Um welche Art von Produkt geht es – MedTech, Vitalstoffe, Diagnostik oder etwas anderes? ' +
      'Und woran merken Sie, dass der Umsatz nicht der Qualität folgt?'
    )
  }

  const einstieg = CHAT_ALLGEMEIN[seed % CHAT_ALLGEMEIN.length]
  const rueckfrage = CHAT_RUECKFRAGEN[(seed + runde) % CHAT_RUECKFRAGEN.length]
  return `${einstieg} ${rueckfrage}`
}
