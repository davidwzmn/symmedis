import { useEffect, useMemo, useState } from 'react'
import { cn } from '../../lib/cn.js'
import { KATEGORIEN, KATEGORIE_MAP } from '../../data/catalog.js'
import { FREIGABE, PRIORITAETEN, scoreStufe, tone } from '../../lib/tone.js'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { useToast } from '../../hooks/useToast.js'
import { Button, Chip } from '../ui/primitives.jsx'
import { Card, CardBody, CardHeader, EmptyState, Banner } from '../ui/layout.jsx'
import { Drawer } from '../ui/overlays.jsx'
import { Input, Select, Textarea, Segmented } from '../ui/forms.jsx'
import { RadarChart, ScoreBar } from '../viz/charts.jsx'
import { IconAlert, IconCheckCircle, IconEye, IconEyeOff, IconLock, IconNote, IconSparkles } from '../ui/Icons.jsx'

const STANDARD_PRIORITAET = { label: 'Nicht klassifiziert', tone: 'neutral' }
const STANDARD_FREIGABE = { label: 'Status unbekannt', kurz: 'Unbekannt', tone: 'neutral' }
const OUTCOME_LABELS = { pending: 'Noch nicht gemessen', confirmed: 'Hypothese bestätigt', refuted: 'Hypothese widerlegt', mixed: 'Gemischtes Ergebnis', unknown: 'Nicht eindeutig' }
const EVIDENZ_RICHTUNGEN = { supports: ['Stützt', 'ok'], contradicts: ['Widerspricht', 'danger'], neutral: ['Neutral', 'neutral'] }
const QUELLENQUALITAET = { high: 'Hoch', medium: 'Mittel', low: 'Niedrig' }

function kategorieInfo(id) {
  return KATEGORIE_MAP[id] || { id, label: id || 'Unbekannte Dimension', kurz: '–', gruppe: 'Nicht zugeordnet', frage: 'Für diese Dimension liegen noch keine Kataloginformationen vor.' }
}

function prioritaetInfo(key) {
  return PRIORITAETEN[key] || STANDARD_PRIORITAET
}

function freigabeInfo(key) {
  return FREIGABE[key] || STANDARD_FREIGABE
}

export function AnalysisModule({ kunde, rolle = 'kunde' }) {
  const [auswahl, setAuswahl] = useState(null)
  const [filter, setFilter] = useState('alle')

  const eintraege = useMemo(() => {
    const basis = rolle === 'kunde' ? kunde.analyse.filter((a) => a.sichtbarKunde) : kunde.analyse
    if (filter === 'kritisch') return basis.filter((a) => a.score < 58)
    if (filter === 'offen') return basis.filter((a) => a.freigabe !== 'kunde')
    return basis
  }, [kunde.analyse, rolle, filter])

  const sortiert = useMemo(() => [...eintraege].sort((a, b) => Number(a.score || 0) - Number(b.score || 0)), [eintraege])
  const achsen = KATEGORIEN.map((k) => ({ kurz: k.kurz, label: k.label }))
  const serie = KATEGORIEN.map((k) => Number(kunde.analyse.find((a) => a.kategorieId === k.id)?.score ?? 0))
  const median = [58, 54, 52, 56, 60, 55, 48, 53, 51, 57]
  const nichtFreigegeben = kunde.analyse.length - kunde.analyse.filter((a) => a.sichtbarKunde).length

  return (
    <div className="min-w-0 space-y-5">
      {rolle === 'kunde' && nichtFreigegeben > 0 ? <Banner toneName="info" icon={IconLock} title="Analyse in Prüfung">{nichtFreigegeben} von {kunde.analyse.length} Punkten werden aktuell noch vom SYMMEDIS-Team geprüft und erscheinen hier, sobald sie freigegeben sind.</Banner> : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <Card>
          <CardHeader title="Analysedimensionen" subtitle={`${sortiert.length} von ${KATEGORIEN.length} Dimensionen · aufsteigend nach Score`} action={<Segmented size="sm" label="Analyse filtern" value={filter} onChange={setFilter} options={[{ value: 'alle', label: 'Alle' }, { value: 'kritisch', label: 'Auffällig' }, ...(rolle === 'intern' ? [{ value: 'offen', label: 'Offen' }] : [])]} />} />
          <CardBody className="px-0 py-0">
            {sortiert.length === 0 ? (
              <EmptyState icon={IconLock} title={rolle === 'kunde' ? 'Noch keine Ergebnisse freigegeben' : 'Keine Analysepunkte in dieser Auswahl'} description={rolle === 'kunde' ? 'Sobald das SYMMEDIS-Team die Bewertung geprüft hat, erscheinen die Punkte hier.' : 'Ändern Sie den Filter oder starten Sie die Ursachenanalyse für dieses Projekt.'} action={filter !== 'alle' ? <Button variant="secondary" size="sm" onClick={() => setFilter('alle')}>Filter zurücksetzen</Button> : undefined} />
            ) : (
              <ul className="divide-y divide-line">
                {sortiert.map((eintrag) => {
                  const kategorie = kategorieInfo(eintrag.kategorieId)
                  const freigabe = freigabeInfo(eintrag.freigabe)
                  const prio = prioritaetInfo(eintrag.prioritaet)
                  const evidenz = Array.isArray(eintrag.evidenzBewertung) ? eintrag.evidenzBewertung : []
                  return (
                    <li key={eintrag.kategorieId}>
                      <button type="button" onClick={() => setAuswahl(eintrag.kategorieId)} className="w-full px-4 py-3.5 text-left transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand sm:px-5">
                        <div className="flex items-start justify-between gap-3"><div className="min-w-0 flex-1"><ScoreBar score={Number(eintrag.score || 0)} label={kategorie.label} sublabel={eintrag.hypothese || eintrag.beobachtung || 'Noch keine Beobachtung hinterlegt.'} /></div></div>
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          <Chip size="sm" toneName={prio.tone}>Priorität {prio.label}</Chip>
                          <Chip size="sm" toneName="neutral">{kategorie.gruppe}</Chip>
                          {Number(eintrag.confidence) > 0 ? <Chip size="sm" toneName="info">Confidence {Number(eintrag.confidence)}%</Chip> : null}
                          {evidenz.length ? <Chip size="sm" toneName="neutral">{evidenz.length} Evidenzen</Chip> : null}
                          {eintrag.outcomeStatus && eintrag.outcomeStatus !== 'pending' ? <Chip size="sm" toneName="accent">{OUTCOME_LABELS[eintrag.outcomeStatus] || eintrag.outcomeStatus}</Chip> : null}
                          {rolle === 'intern' ? <Chip size="sm" toneName={freigabe.tone}>{freigabe.kurz}</Chip> : null}
                          {rolle === 'intern' && eintrag.internNotiz ? <Chip size="sm" toneName="warn" icon={IconNote}>Interne Notiz</Chip> : null}
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        <div className="min-w-0 space-y-5">
          <Card><CardHeader title="Analyseprofil" subtitle="Alle zehn Dimensionen im Vergleich" /><CardBody>{kunde.analyse.length ? <RadarChart axes={achsen} series={serie} compare={median} /> : <EmptyState compact icon={IconSparkles} title="Analyseprofil noch leer" description="Das Profil entsteht mit den ersten bewerteten Dimensionen." />}</CardBody></Card>
          <Card>
            <CardHeader title="Verteilung" />
            <CardBody className="space-y-3">
              {['kritisch', 'auffaellig', 'solide', 'stark'].map((stufe) => {
                const anzahl = kunde.analyse.filter((a) => scoreStufe(Number(a.score || 0)).key === stufe).length
                const info = { kritisch: 'Kritisch', auffaellig: 'Auffällig', solide: 'Solide', stark: 'Stark' }
                const tonName = { kritisch: 'danger', auffaellig: 'warn', solide: 'info', stark: 'ok' }[stufe]
                return <div key={stufe} className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-[0.8125rem] text-ink-2"><span aria-hidden="true" className={cn('size-2 rounded-full', tone(tonName).dot)} />{info[stufe]}</span><span className="tabular text-[0.8125rem] font-semibold text-ink">{anzahl}</span></div>
              })}
            </CardBody>
          </Card>
        </div>
      </div>

      <AnalyseDetail kunde={kunde} kategorieId={auswahl} rolle={rolle} onClose={() => setAuswahl(null)} />
    </div>
  )
}

function EvidenzEditor({ value, saving, onSave }) {
  const [rows, setRows] = useState(Array.isArray(value) ? value : [])

  useEffect(() => { setRows(Array.isArray(value) ? value : []) }, [value])

  const update = (index, patch) => setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row))
  const remove = (index) => {
    const next = rows.filter((_, rowIndex) => rowIndex !== index)
    setRows(next)
    onSave(next)
  }
  const add = () => setRows((current) => [...current, { source: '', direction: 'supports', reliability: 'medium', note: '' }])

  return (
    <div className="rounded-xl border border-line bg-surface-muted p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div><h3 className="text-xs font-semibold text-ink">Evidenzbewertung</h3><p className="mt-1 text-xs leading-relaxed text-ink-3">Jede Quelle bekommt Richtung und Vertrauensniveau. Widersprechende Evidenz wird bewusst sichtbar gehalten.</p></div>
        <Button type="button" variant="secondary" size="sm" onClick={add}>Quelle hinzufügen</Button>
      </div>
      <div className="mt-3 space-y-3">
        {rows.length === 0 ? <p className="text-xs text-ink-3">Noch keine Evidenz einzeln bewertet.</p> : rows.map((row, index) => (
          <div key={`${index}-${row.source || 'quelle'}`} className="rounded-lg border border-line bg-surface p-3">
            <div className="grid gap-3 sm:grid-cols-[1.3fr_0.8fr_0.7fr]">
              <Input label="Quelle" value={row.source || row.sourceId || ''} onChange={(event) => update(index, { source: event.target.value })} onBlur={() => onSave(rows.map((entry, i) => i === index ? { ...entry, source: row.source || row.sourceId || '' } : entry))} placeholder="z. B. CRM-Auswertung Q2" />
              <Select label="Richtung" value={row.direction || 'neutral'} onChange={(event) => { const next = rows.map((entry, i) => i === index ? { ...entry, direction: event.target.value } : entry); setRows(next); onSave(next) }}>
                {Object.entries(EVIDENZ_RICHTUNGEN).map(([key, [label]]) => <option key={key} value={key}>{label}</option>)}
              </Select>
              <Select label="Quellenvertrauen" value={row.reliability || 'medium'} onChange={(event) => { const next = rows.map((entry, i) => i === index ? { ...entry, reliability: event.target.value } : entry); setRows(next); onSave(next) }}>
                {Object.entries(QUELLENQUALITAET).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </Select>
            </div>
            <Textarea rows={2} value={row.note || ''} onChange={(event) => update(index, { note: event.target.value })} onBlur={() => onSave(rows)} className="mt-3" aria-label={`Evidenznotiz ${index + 1}`} placeholder="Was genau zeigt oder widerlegt diese Quelle?" />
            <div className="mt-2 flex items-center justify-between gap-2">
              <Chip size="sm" toneName={EVIDENZ_RICHTUNGEN[row.direction]?.[1] || 'neutral'}>{EVIDENZ_RICHTUNGEN[row.direction]?.[0] || 'Neutral'}</Chip>
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>Entfernen</Button>
            </div>
          </div>
        ))}
      </div>
      {saving === 'evidenzBewertung' ? <p className="mt-2 text-xs text-ink-3" role="status">Evidenz wird gespeichert …</p> : null}
    </div>
  )
}

function AnalyseDetail({ kunde, kategorieId, rolle, onClose }) {
  const { setAnalyseFeld, setFreigabe } = useWorkspace()
  const toast = useToast()
  const [freigabeSaving, setFreigabeSaving] = useState(false)
  const [feldSaving, setFeldSaving] = useState(null)
  const [entwurf, setEntwurf] = useState({})
  const eintrag = kunde.analyse.find((a) => a.kategorieId === kategorieId)
  const kategorie = kategorieId ? kategorieInfo(kategorieId) : null

  useEffect(() => {
    if (!eintrag) return
    setEntwurf({
      beobachtung: eintrag.beobachtung ?? '', ursache: eintrag.ursache ?? '', auswirkung: eintrag.auswirkung ?? '', beleg: eintrag.beleg ?? '', empfehlung: eintrag.empfehlung ?? '', internNotiz: eintrag.internNotiz ?? '',
      hypothese: eintrag.hypothese ?? '', gegenhypothese: eintrag.gegenhypothese ?? '', confidenceBegruendung: eintrag.confidenceBegruendung ?? '', intervention: eintrag.intervention ?? '', outcomeNotiz: eintrag.outcomeNotiz ?? '',
    })
  }, [eintrag])

  if (!eintrag || !kategorie) return <Drawer open={false} onClose={onClose} title="" />

  const stufe = scoreStufe(Number(eintrag.score || 0))
  const bearbeitbar = rolle === 'intern'
  const prio = prioritaetInfo(eintrag.prioritaet)
  const freigabe = freigabeInfo(eintrag.freigabe)
  const felder = [{ key: 'beobachtung', label: 'Beobachtung' }, { key: 'ursache', label: 'Ursache' }, { key: 'auswirkung', label: 'Auswirkung' }, { key: 'beleg', label: 'Beleg' }, { key: 'empfehlung', label: 'Empfehlung' }]

  const freigabeSetzen = async (next, erfolg = null) => {
    if (freigabeSaving || next === eintrag.freigabe) return next === eintrag.freigabe
    setFreigabeSaving(true)
    try {
      const gespeichert = await setFreigabe(kunde.id, kategorie.id, next)
      if (!gespeichert) { toast.show({ title: 'Freigabe nicht gespeichert', description: 'Der vorherige Freigabestatus wurde wiederhergestellt.', variant: 'danger' }); return false }
      if (erfolg) toast.show(erfolg)
      return true
    } catch (error) {
      toast.show({ title: 'Freigabe nicht gespeichert', description: error instanceof Error ? error.message : 'Änderung fehlgeschlagen.', variant: 'danger' })
      return false
    } finally { setFreigabeSaving(false) }
  }

  const feldSpeichern = async (key, label, next = entwurf[key] ?? '') => {
    if (feldSaving || next === (eintrag[key] ?? '')) return true
    setFeldSaving(key)
    try {
      const gespeichert = await setAnalyseFeld(kunde.id, kategorie.id, { [key]: next })
      if (!gespeichert) { toast.show({ title: `${label} nicht gespeichert`, description: 'Der letzte gespeicherte Stand wurde wiederhergestellt.', variant: 'danger' }); return false }
      return true
    } catch (error) {
      toast.show({ title: `${label} nicht gespeichert`, description: error instanceof Error ? error.message : 'Änderung fehlgeschlagen.', variant: 'danger' })
      return false
    } finally { setFeldSaving(null) }
  }

  const evidenzSpeichern = async (next) => {
    setFeldSaving('evidenzBewertung')
    try {
      const gespeichert = await setAnalyseFeld(kunde.id, kategorie.id, { evidenzBewertung: next })
      if (!gespeichert) toast.show({ title: 'Evidenz nicht gespeichert', description: 'Der vorherige Stand wurde wiederhergestellt.', variant: 'danger' })
    } finally { setFeldSaving(null) }
  }

  const outcomeSetzen = async (status) => {
    const patch = { outcomeStatus: status, outcomeGemessenAm: status === 'pending' ? null : new Date().toISOString() }
    setFeldSaving('outcomeStatus')
    try {
      await setAnalyseFeld(kunde.id, kategorie.id, patch)
    } finally { setFeldSaving(null) }
  }

  return (
    <Drawer open={Boolean(kategorieId)} onClose={onClose} width="lg" title={kategorie.label} subtitle={kategorie.frage} footer={bearbeitbar ? (
      <div className="flex flex-wrap items-center justify-between gap-3" aria-busy={freigabeSaving}><p className="text-xs text-ink-3" role="status" aria-live="polite">{freigabeSaving ? 'Freigabe wird gespeichert …' : 'Interne Notizen erscheinen nie im Kundenportal.'}</p><div className="flex gap-2"><Button variant="secondary" size="sm" disabled={freigabeSaving} onClick={() => freigabeSetzen('intern', { title: 'Intern freigegeben', variant: 'success' })}>{freigabeSaving ? 'Speichert …' : 'Intern freigeben'}</Button><Button size="sm" disabled={freigabeSaving} onClick={() => freigabeSetzen('kunde', { title: 'Für Kunden freigegeben', description: `${kategorie.label} ist jetzt im Kundenportal sichtbar.`, variant: 'success' })}>{freigabeSaving ? 'Speichert …' : 'Für Kunden freigeben'}</Button></div></div>
    ) : <p className="text-xs text-ink-3">Bewertung durch das SYMMEDIS-Team geprüft{eintrag.beleg ? ` · Beleg: ${eintrag.beleg}` : ''}</p>}>
      <div className="space-y-5 px-5 py-5" aria-busy={Boolean(feldSaving)}>
        <div className="flex flex-wrap items-center gap-2"><Chip toneName={stufe.tone}>{stufe.label}</Chip><Chip toneName={prio.tone}>Priorität {prio.label}</Chip><Chip toneName="neutral">{kategorie.gruppe}</Chip>{Number(eintrag.confidence) > 0 ? <Chip toneName="info">Confidence {Number(eintrag.confidence)}%</Chip> : null}{rolle === 'intern' ? <Chip toneName={freigabe.tone} icon={eintrag.sichtbarKunde ? IconEye : IconEyeOff}>{freigabe.label}</Chip> : null}</div>
        <div className="rounded-lg border border-line bg-surface-muted p-4"><div className="flex items-baseline justify-between"><span className="text-xs text-ink-2">Reifegrad</span><span className="tabular text-2xl font-semibold text-ink">{Number(eintrag.score || 0)}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-viz-track"><div className={cn('h-full rounded-full', tone(stufe.tone).bar)} style={{ width: `${Math.max(0, Math.min(100, Number(eintrag.score || 0)))}%` }} /></div><p className="mt-2 text-xs text-ink-3">0–39 kritisch · 40–57 auffällig · 58–74 solide · ab 75 stark</p></div>

        <section className="rounded-xl border border-brand-border bg-brand-soft p-4">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-brand-ink">Diagnostische Logik</p>
          <div className="mt-3 space-y-4">
            <div><h3 className="text-xs font-semibold text-ink-2">Arbeitshypothese</h3>{bearbeitbar ? <Textarea rows={3} value={entwurf.hypothese ?? ''} onChange={(event) => setEntwurf((current) => ({ ...current, hypothese: event.target.value }))} onBlur={() => feldSpeichern('hypothese', 'Hypothese')} className="mt-1.5" placeholder="Welche prüfbare Ursache erklärt die Beobachtung am besten?" /> : <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink">{eintrag.hypothese || eintrag.ursache || 'Noch nicht formuliert.'}</p>}</div>
            <div><h3 className="text-xs font-semibold text-ink-2">Stärkste Gegenhypothese</h3>{bearbeitbar ? <Textarea rows={3} value={entwurf.gegenhypothese ?? ''} onChange={(event) => setEntwurf((current) => ({ ...current, gegenhypothese: event.target.value }))} onBlur={() => feldSpeichern('gegenhypothese', 'Gegenhypothese')} className="mt-1.5" placeholder="Welche alternative Erklärung wäre ebenfalls plausibel?" /> : <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink">{eintrag.gegenhypothese || 'Keine Gegenhypothese freigegeben.'}</p>}</div>
            <div><h3 className="text-xs font-semibold text-ink-2">Warum diese Confidence?</h3>{bearbeitbar ? <Textarea rows={2} value={entwurf.confidenceBegruendung ?? ''} onChange={(event) => setEntwurf((current) => ({ ...current, confidenceBegruendung: event.target.value }))} onBlur={() => feldSpeichern('confidenceBegruendung', 'Confidence-Begründung')} className="mt-1.5" placeholder="Welche Evidenz und Unsicherheit rechtfertigen den Confidence-Wert?" /> : <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink">{eintrag.confidenceBegruendung || 'Die Begründung wird noch konkretisiert.'}</p>}</div>
          </div>
        </section>

        {bearbeitbar ? <EvidenzEditor value={eintrag.evidenzBewertung} saving={feldSaving} onSave={evidenzSpeichern} /> : Array.isArray(eintrag.evidenzBewertung) && eintrag.evidenzBewertung.length ? <div className="space-y-2"><h3 className="text-xs font-semibold text-ink-2">Evidenzlage</h3>{eintrag.evidenzBewertung.map((row, index) => <div key={index} className="rounded-lg border border-line bg-surface-muted p-3"><div className="flex flex-wrap gap-2"><Chip size="sm" toneName={EVIDENZ_RICHTUNGEN[row.direction]?.[1] || 'neutral'}>{EVIDENZ_RICHTUNGEN[row.direction]?.[0] || 'Neutral'}</Chip><Chip size="sm" toneName="neutral">Vertrauen {QUELLENQUALITAET[row.reliability] || 'Mittel'}</Chip></div><p className="mt-2 text-[0.8125rem] font-medium text-ink">{row.source || row.sourceId || `Quelle ${index + 1}`}</p>{row.note ? <p className="mt-1 text-xs leading-relaxed text-ink-2">{row.note}</p> : null}</div>)}</div> : null}

        {felder.map((feld) => <div key={feld.key}><h3 className="text-xs font-semibold text-ink-2">{feld.label}</h3>{bearbeitbar ? <><Textarea rows={feld.key === 'beleg' ? 2 : 3} value={entwurf[feld.key] ?? ''} onChange={(e) => setEntwurf((aktuell) => ({ ...aktuell, [feld.key]: e.target.value }))} onBlur={() => feldSpeichern(feld.key, feld.label)} disabled={feldSaving === feld.key} className="mt-1.5" aria-label={feld.label} /><p className="mt-1 min-h-4 text-xs text-ink-3" role="status" aria-live="polite">{feldSaving === feld.key ? 'Wird gespeichert …' : ''}</p></> : <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink">{eintrag[feld.key] || 'Noch nicht hinterlegt.'}</p>}</div>)}

        <section className="rounded-xl border border-line bg-surface-muted p-4">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-3">Intervention → Outcome</p>
          <div className="mt-3"><h3 className="text-xs font-semibold text-ink-2">Konkrete Intervention</h3>{bearbeitbar ? <Textarea rows={3} value={entwurf.intervention ?? ''} onChange={(event) => setEntwurf((current) => ({ ...current, intervention: event.target.value }))} onBlur={() => feldSpeichern('intervention', 'Intervention')} className="mt-1.5" placeholder="Welche Veränderung adressiert genau diese Ursache?" /> : <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink">{eintrag.intervention || eintrag.empfehlung || 'Noch nicht hinterlegt.'}</p>}</div>
          {bearbeitbar ? <div className="mt-4 grid gap-4 sm:grid-cols-2"><Select label="Outcome der Diagnose" value={eintrag.outcomeStatus || 'pending'} disabled={feldSaving === 'outcomeStatus'} onChange={(event) => outcomeSetzen(event.target.value)}>{Object.entries(OUTCOME_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</Select><div className="self-end text-xs text-ink-3">{eintrag.outcomeGemessenAm ? `Gemessen: ${new Date(eintrag.outcomeGemessenAm).toLocaleDateString('de-DE')}` : 'Outcome noch offen'}</div></div> : <div className="mt-4"><Chip toneName={eintrag.outcomeStatus === 'confirmed' ? 'ok' : eintrag.outcomeStatus === 'refuted' ? 'danger' : 'neutral'}>{OUTCOME_LABELS[eintrag.outcomeStatus] || OUTCOME_LABELS.pending}</Chip></div>}
          <div className="mt-4"><h3 className="text-xs font-semibold text-ink-2">Outcome-Notiz</h3>{bearbeitbar ? <Textarea rows={3} value={entwurf.outcomeNotiz ?? ''} onChange={(event) => setEntwurf((current) => ({ ...current, outcomeNotiz: event.target.value }))} onBlur={() => feldSpeichern('outcomeNotiz', 'Outcome-Notiz')} className="mt-1.5" placeholder="Was ist nach 30/60/90 Tagen tatsächlich passiert?" /> : <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink">{eintrag.outcomeNotiz || 'Noch kein Outcome dokumentiert.'}</p>}</div>
        </section>

        {bearbeitbar ? <><div className="grid gap-4 sm:grid-cols-2"><Select label="Priorität" value={PRIORITAETEN[eintrag.prioritaet] ? eintrag.prioritaet : ''} disabled={feldSaving === 'prioritaet'} onChange={(e) => feldSpeichern('prioritaet', 'Priorität', e.target.value)}><option value="" disabled>Bitte wählen</option>{Object.entries(PRIORITAETEN).map(([key, wert]) => <option key={key} value={key}>{wert.label}</option>)}</Select><Select label="Freigabestatus" value={FREIGABE[eintrag.freigabe] ? eintrag.freigabe : ''} disabled={freigabeSaving} onChange={(e) => freigabeSetzen(e.target.value)}><option value="" disabled>Bitte wählen</option>{Object.entries(FREIGABE).map(([key, wert]) => <option key={key} value={key}>{wert.label}</option>)}</Select></div><div className="rounded-lg border border-warn-border bg-warn-soft p-4"><h3 className="flex items-center gap-2 text-xs font-semibold text-warn-ink"><IconLock className="size-3.5" />Interne Notiz – nicht für den Kunden sichtbar</h3><Textarea rows={3} value={entwurf.internNotiz ?? ''} placeholder="Nur für das SYMMEDIS-Team …" onChange={(e) => setEntwurf((aktuell) => ({ ...aktuell, internNotiz: e.target.value }))} onBlur={() => feldSpeichern('internNotiz', 'Interne Notiz')} disabled={feldSaving === 'internNotiz'} className="mt-2" aria-label="Interne Notiz" /><p className="mt-1 min-h-4 text-xs text-warn-ink/70" role="status" aria-live="polite">{feldSaving === 'internNotiz' ? 'Wird gespeichert …' : ''}</p></div></> : null}
        {rolle === 'kunde' ? <div className="rounded-lg border border-brand-border bg-brand-soft p-4"><h3 className="flex items-center gap-2 text-xs font-semibold text-brand-ink"><IconCheckCircle className="size-3.5" />Menschlich geprüft</h3><p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-2">Diese Bewertung wurde durch die Software strukturiert und anschließend vom SYMMEDIS-Team geprüft und freigegeben. Gegenhypothesen und widersprechende Evidenz bleiben Teil der internen Qualitätsprüfung.</p></div> : null}
        {rolle === 'demo' ? <Banner toneName="neutral" icon={IconSparkles}>Demo-Ansicht: Bearbeitung und Freigabe stehen nur im Mitarbeiterportal zur Verfügung.</Banner> : null}
      </div>
    </Drawer>
  )
}

export function BremsenCards({ kunde, kompakt = false, onOeffnen }) {
  if (!kunde.bremsen.length) return <Card className="md:col-span-3"><EmptyState compact icon={IconAlert} title="Umsatzbremsen werden noch priorisiert" description="Sobald die Ursachenanalyse geprüft ist, erscheinen hier die drei Hebel mit der höchsten erwarteten Wirkung und einer konkreten nächsten Aktion." /></Card>
  return <div className={cn('grid min-w-0 gap-4', kompakt ? 'sm:grid-cols-3' : 'md:grid-cols-3')}>{kunde.bremsen.map((bremse) => { const stufe = scoreStufe(Number(bremse.score || 0)); const prio = prioritaetInfo(bremse.prioritaet); const kategorie = kategorieInfo(bremse.kategorieId); return <Card key={bremse.id} className="flex flex-col p-4"><div className="flex items-start justify-between gap-2"><span className="inline-flex size-7 items-center justify-center rounded-lg bg-surface-inverse text-xs font-semibold text-canvas">{bremse.rang || '–'}</span><Chip size="sm" toneName={prio.tone} icon={bremse.prioritaet === 'hoch' ? IconAlert : undefined}>{prio.label}</Chip></div><h2 className="mt-3 text-[0.9375rem] font-semibold text-ink">{bremse.titel || 'Priorisierter Hebel'}</h2><p className="mt-1.5 flex-1 text-[0.8125rem] leading-relaxed text-ink-2">{bremse.beschreibung || 'Die Wirkung wird aktuell konkretisiert.'}</p><div className="mt-3 flex items-center gap-2 text-xs"><Chip size="sm" toneName={stufe.tone}>Score {Number(bremse.score || 0)}</Chip><span className="text-ink-3">{kategorie.gruppe}</span></div>{!kompakt ? <div className="mt-3 border-t border-line pt-3"><p className="text-xs font-medium text-ink-2">Empfohlene nächste Aktion</p><p className="mt-1 text-[0.8125rem] leading-snug text-ink">{bremse.naechsteAktion || 'Wird im Rahmen der Maßnahmenplanung ergänzt.'}</p></div> : null}{onOeffnen ? <Button variant="ghost" size="sm" className="mt-3 self-start" onClick={() => onOeffnen(bremse.kategorieId)}>Details ansehen</Button> : null}</Card> })}</div>
}

export function AnalyseUebersicht({ kunde, kategorien, titel = 'Analyseübersicht' }) {
  const ids = kategorien ?? ['positionierung', 'verstaendlichkeit', 'website', 'social', 'vertrieb', 'marktaktivierung']
  const vorhanden = ids.map((id) => ({ id, eintrag: kunde.analyse.find((a) => a.kategorieId === id) })).filter((item) => item.eintrag)
  return <Card><CardHeader title={titel} subtitle="Reifegrad je Bereich" /><CardBody className="space-y-3.5">{vorhanden.length ? vorhanden.map(({ id, eintrag }) => <ScoreBar key={id} score={Number(eintrag.score || 0)} label={kategorieInfo(id).label} />) : <EmptyState compact icon={IconSparkles} title="Noch keine Analysedaten" description="Die Übersicht füllt sich mit den ersten bewerteten Dimensionen." />}</CardBody></Card>
}
