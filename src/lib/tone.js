/**
 * Semantische Töne → feste Klassenketten.
 *
 * `solid` füllt bewusst mit der abgedunkelten …-ink-Stufe statt mit der
 * Signalfarbe: Weiß auf #18A67D oder #D98A21 erreicht nur 2,3–2,8:1.
 *
 * Bewusst vollständig ausgeschriebene Klassennamen: Tailwind scannt den
 * Quelltext statisch, zusammengesetzte Namen (`bg-${tone}-soft`) würden nicht
 * erzeugt werden.
 */

export const TONES = {
  brand: {
    chip: 'bg-brand-soft text-brand-ink border-brand-border',
    solid: 'bg-brand-ink text-on-solid',
    dot: 'bg-brand',
    bar: 'bg-brand',
    text: 'text-brand-ink',
    ring: 'ring-brand-border',
    soft: 'bg-brand-soft',
  },
  accent: {
    chip: 'bg-accent-soft text-accent-ink border-accent-border',
    solid: 'bg-accent-ink text-on-solid',
    dot: 'bg-accent',
    bar: 'bg-accent',
    text: 'text-accent-ink',
    ring: 'ring-accent-border',
    soft: 'bg-accent-soft',
  },
  ok: {
    chip: 'bg-ok-soft text-ok-ink border-ok-border',
    solid: 'bg-ok-ink text-on-solid',
    dot: 'bg-ok',
    bar: 'bg-ok',
    text: 'text-ok-ink',
    ring: 'ring-ok-border',
    soft: 'bg-ok-soft',
  },
  info: {
    chip: 'bg-info-soft text-info-ink border-info-border',
    solid: 'bg-info-ink text-on-solid',
    dot: 'bg-info',
    bar: 'bg-info',
    text: 'text-info-ink',
    ring: 'ring-info-border',
    soft: 'bg-info-soft',
  },
  warn: {
    chip: 'bg-warn-soft text-warn-ink border-warn-border',
    solid: 'bg-warn-ink text-on-solid',
    dot: 'bg-warn',
    bar: 'bg-warn',
    text: 'text-warn-ink',
    ring: 'ring-warn-border',
    soft: 'bg-warn-soft',
  },
  danger: {
    chip: 'bg-danger-soft text-danger-ink border-danger-border',
    solid: 'bg-danger-ink text-on-solid',
    dot: 'bg-danger',
    bar: 'bg-danger',
    text: 'text-danger-ink',
    ring: 'ring-danger-border',
    soft: 'bg-danger-soft',
  },
  urgent: {
    chip: 'bg-urgent-soft text-urgent-ink border-urgent-border',
    solid: 'bg-urgent-ink text-on-solid',
    dot: 'bg-urgent',
    bar: 'bg-urgent',
    text: 'text-urgent-ink',
    ring: 'ring-urgent-border',
    soft: 'bg-urgent-soft',
  },
  neutral: {
    chip: 'bg-neutral-soft text-neutral-ink border-neutral-border',
    solid: 'bg-neutral-ink text-on-solid',
    dot: 'bg-neutral',
    bar: 'bg-neutral',
    text: 'text-neutral-ink',
    ring: 'ring-neutral-border',
    soft: 'bg-neutral-soft',
  },
}

export function tone(name) {
  return TONES[name] ?? TONES.neutral
}

/** Score 0–100 → Bewertungsstufe. Niedrig = starke Bremse. */
export function scoreStufe(score) {
  if (score < 40) return { key: 'kritisch', label: 'Kritisch', tone: 'danger' }
  if (score < 58) return { key: 'auffaellig', label: 'Auffällig', tone: 'warn' }
  if (score < 75) return { key: 'solide', label: 'Solide', tone: 'info' }
  return { key: 'stark', label: 'Stark', tone: 'ok' }
}

/** Priorität → Ton + Reihenfolge für Sortierungen. */
export const PRIORITAETEN = {
  hoch: { label: 'Hoch', tone: 'urgent', rang: 0 },
  mittel: { label: 'Mittel', tone: 'warn', rang: 1 },
  niedrig: { label: 'Niedrig', tone: 'neutral', rang: 2 },
}

/** Aufgaben- und Projektstatus. */
export const STATUS = {
  offen: { label: 'Offen', tone: 'neutral' },
  'in-arbeit': { label: 'In Arbeit', tone: 'info' },
  wartet: { label: 'Wartet auf Kunde', tone: 'warn' },
  pruefung: { label: 'In Prüfung', tone: 'warn' },
  erledigt: { label: 'Erledigt', tone: 'ok' },
  ueberfaellig: { label: 'Überfällig', tone: 'urgent' },
}

/** Freigabestatus im Analyse-Editor (Mitarbeiterportal). */
export const FREIGABE = {
  vorgeschlagen: { label: 'Automatisch vorgeschlagen', tone: 'neutral', kurz: 'Vorschlag' },
  pruefung: { label: 'In Prüfung', tone: 'info', kurz: 'Prüfung' },
  bearbeitet: { label: 'Bearbeitet', tone: 'warn', kurz: 'Bearbeitet' },
  intern: { label: 'Intern freigegeben', tone: 'accent', kurz: 'Intern frei' },
  kunde: { label: 'Für Kunden freigegeben', tone: 'ok', kurz: 'Kunde frei' },
}
