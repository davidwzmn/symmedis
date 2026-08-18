import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { useSession } from '../../hooks/useSession.js'
import { useToast } from '../../hooks/useToast.js'
import { onboardClientProject } from '../../lib/clientOnboardingApi.js'
import { fetchTeamDirectory } from '../../lib/workspaceApi.js'
import { PROJEKT_STATUS, TEAM, TEAM_MAP } from '../../data/workspace.js'
import { formatDate, tageBis } from '../../lib/format.js'
import { scoreStufe } from '../../lib/tone.js'
import { Avatar, Button, Chip } from '../../components/ui/primitives.jsx'
import { Card, CardBody, EmptyState, PageHeader } from '../../components/ui/layout.jsx'
import { DataTable, ProgressBar } from '../../components/ui/data.jsx'
import { Input, SearchInput, Select } from '../../components/ui/forms.jsx'
import { IconBuilding } from '../../components/ui/Icons.jsx'

const LEER = { name: '', shortName: '', industry: '', location: '', employeeCount: '', contactName: '', contactEmail: '', contactRole: '', accountManagerKey: '', projectName: 'Ursachenanalyse', startDate: '', resultDate: '' }
const STANDARD_STATUS = { label: 'Projekt aktiv', tone: 'neutral' }

function sichererScore(value) {
  const zahl = Number(value)
  return Number.isFinite(zahl) ? Math.max(0, Math.min(100, zahl)) : null
}

export function ClientsPage() {
  const { kunden, echteDaten, neuLaden } = useWorkspace()
  const { accessToken } = useSession()
  const toast = useToast()
  const navigate = useNavigate()
  const [suche, setSuche] = useState('')
  const [status, setStatus] = useState('alle')
  const [betreuer, setBetreuer] = useState('alle')
  const [team, setTeam] = useState([])
  const [teamLaedt, setTeamLaedt] = useState(false)
  const [teamFehler, setTeamFehler] = useState(null)
  const [formularOffen, setFormularOffen] = useState(false)
  const [formular, setFormular] = useState(LEER)
  const [speichert, setSpeichert] = useState(false)
  const [formularFehler, setFormularFehler] = useState(null)

  useEffect(() => {
    if (!echteDaten || !accessToken) {
      setTeam([])
      setTeamFehler(null)
      return undefined
    }
    let active = true
    setTeamLaedt(true)
    setTeamFehler(null)
    fetchTeamDirectory(accessToken)
      .then((rows) => { if (active) setTeam(rows) })
      .catch((error) => { if (active) { setTeam([]); setTeamFehler(error instanceof Error ? error.message : 'Team konnte nicht geladen werden.') } })
      .finally(() => { if (active) setTeamLaedt(false) })
    return () => { active = false }
  }, [accessToken, echteDaten])

  const teamOptionen = useMemo(() => echteDaten ? team : TEAM, [echteDaten, team])
  const teamMap = useMemo(() => ({ ...TEAM_MAP, ...Object.fromEntries(team.map((mitglied) => [mitglied.id, mitglied])) }), [team])
  const betreuerOptionen = useMemo(() => {
    const map = new Map(teamOptionen.map((mitglied) => [mitglied.id, { id: mitglied.id, name: mitglied.name }]))
    kunden.forEach((kunde) => {
      if (!kunde.betreuerId || map.has(kunde.betreuerId)) return
      map.set(kunde.betreuerId, { id: kunde.betreuerId, name: teamMap[kunde.betreuerId]?.name || 'Ehemalige Zuordnung' })
    })
    return [...map.values()]
  }, [kunden, teamMap, teamOptionen])

  const zeilen = useMemo(() => {
    const q = suche.trim().toLowerCase()
    return kunden.filter((kunde) => {
      if (status !== 'alle' && kunde.status !== status) return false
      if (betreuer !== 'alle' && kunde.betreuerId !== betreuer) return false
      if (q && !String(kunde.unternehmen || '').toLowerCase().includes(q) && !String(kunde.branche || '').toLowerCase().includes(q) && !String(kunde.ansprechpartner?.name || '').toLowerCase().includes(q)) return false
      return true
    })
  }, [kunden, suche, status, betreuer])

  const filterAktiv = Boolean(suche.trim() || status !== 'alle' || betreuer !== 'alle')
  const filterZuruecksetzen = () => { setSuche(''); setStatus('alle'); setBetreuer('alle') }
  const setzen = (key) => (event) => setFormular((alt) => ({ ...alt, [key]: event.target.value }))
  const formularOeffnen = () => {
    setFormular((alt) => ({ ...alt, accountManagerKey: alt.accountManagerKey || teamOptionen[0]?.id || '' }))
    setFormularFehler(null)
    setFormularOffen(true)
  }

  const anlegen = async (event) => {
    event.preventDefault()
    if (!accessToken) return setFormularFehler('Ihre Sitzung ist nicht bereit. Bitte laden Sie die Seite erneut.')
    if (!formular.name.trim()) return setFormularFehler('Bitte geben Sie einen Unternehmensnamen ein.')
    if (!formular.accountManagerKey) return setFormularFehler('Bitte weisen Sie eine Betreuung aus dem SYMMEDIS-Team zu.')
    setSpeichert(true)
    setFormularFehler(null)
    try {
      await onboardClientProject(accessToken, formular)
      await neuLaden()
      setFormular({ ...LEER, accountManagerKey: teamOptionen[0]?.id || '' })
      setFormularOffen(false)
      toast.show({ title: 'Kunde angelegt', description: `${formular.name} wurde als eigener Tenant mit Projekt erstellt.`, variant: 'success' })
    } catch (error) {
      setFormularFehler(error instanceof Error ? error.message : 'Kunde konnte nicht angelegt werden.')
    } finally {
      setSpeichert(false)
    }
  }

  const spalten = [
    { key: 'unternehmen', label: 'Kunde', render: (kunde) => <span className="flex min-w-0 items-center gap-2.5"><Avatar name={kunde.kurz || kunde.unternehmen || 'K'} size="sm" /><span className="min-w-0"><span className="block truncate font-medium text-ink">{kunde.unternehmen || 'Unbenannter Kunde'}</span><span className="block truncate text-xs text-ink-3">{kunde.branche || 'Branche offen'} · {kunde.ort || 'Ort offen'}</span></span></span> },
    { key: 'status', label: 'Phase', render: (kunde) => { const info = PROJEKT_STATUS[kunde.status] || STANDARD_STATUS; return <Chip size="sm" toneName={info.tone} dot>{info.label}</Chip> } },
    { key: 'score', label: 'Reifegrad', hideBelow: 'lg', render: (kunde) => { const wert = kunde.analyse?.length ? sichererScore(kunde.gesamtScore) : null; if (wert === null) return <span className="text-xs text-ink-3">Noch nicht bewertet</span>; const stufe = scoreStufe(wert); return <span className="flex items-center gap-2"><span className="tabular font-semibold text-ink">{wert}</span><Chip size="sm" toneName={stufe.tone}>{stufe.label}</Chip></span> } },
    { key: 'fortschritt', label: 'Fortschritt', hideBelow: 'lg', render: (kunde) => { const wert = Number.isFinite(Number(kunde.fortschritt)) ? Math.max(0, Math.min(100, Number(kunde.fortschritt))) : 0; return <span className="block w-28"><ProgressBar value={wert} size="sm" hideLabel label={`Fortschritt ${kunde.unternehmen || 'Projekt'}`} animate={false} /><span className="tabular mt-1 block text-xs text-ink-3">{wert} %</span></span> } },
    { key: 'freigaben', label: 'Freigaben offen', hideBelow: 'xl', align: 'center', render: (kunde) => { const offen = kunde.analyse.filter((a) => a.freigabe === 'bearbeitet' || a.freigabe === 'intern').length; return offen > 0 ? <Chip size="sm" toneName="warn">{offen}</Chip> : <span className="text-xs text-ink-3">–</span> } },
    { key: 'betreuer', label: 'Betreuung', hideBelow: 'xl', render: (kunde) => <span className="text-ink-2">{teamMap[kunde.betreuerId]?.name || 'Nicht zugewiesen'}</span> },
    { key: 'ergebnis', label: 'Ergebnistermin', hideBelow: 'md', align: 'right', render: (kunde) => { if (!kunde.ergebnis) return <span className="text-xs text-ink-3">offen</span>; const tage = tageBis(kunde.ergebnis); return <span className="block"><span className="block text-ink-2">{formatDate(kunde.ergebnis)}</span><span className={tage < 0 ? 'block text-xs text-ink-3' : 'block text-xs font-medium text-warn-ink'}>{tage < 0 ? 'abgeschlossen' : tage === 0 ? 'heute' : `in ${tage} Tagen`}</span></span> } },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Kunden" subtitle={`${zeilen.length} von ${kunden.length} Projekten · Mandantenzugriff nur für das SYMMEDIS-Team`} actions={echteDaten ? <Button size="sm" onClick={formularOeffnen} disabled={teamLaedt || Boolean(teamFehler) || teamOptionen.length === 0}>{teamLaedt ? 'Team wird geladen …' : 'Neuen Kunden anlegen'}</Button> : null} />

      {echteDaten && teamFehler ? <Card><CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-[0.8125rem] leading-relaxed text-danger-ink">Teamverzeichnis konnte nicht geladen werden: {teamFehler}</p><Button variant="secondary" size="sm" onClick={() => window.location.reload()}>Seite neu laden</Button></CardBody></Card> : null}
      {echteDaten && !teamLaedt && !teamFehler && teamOptionen.length === 0 ? <Card><CardBody><p className="text-[0.8125rem] leading-relaxed text-warn-ink">Es ist noch kein interner Teamzugang verfügbar. Legen Sie zuerst einen Mitarbeiter- oder Admin-Zugang an, bevor neue Kunden zugewiesen werden.</p></CardBody></Card> : null}

      {formularOffen ? (
        <Card><CardBody><form onSubmit={anlegen} className="space-y-5" aria-busy={speichert}><div><h2 className="text-base font-semibold text-ink">Neuer Kunden-Tenant</h2><p className="mt-1 text-[0.8125rem] text-ink-2">Organisation, Kundenstamm und erstes Analyseprojekt werden atomar angelegt. Die Betreuung stammt aus dem realen SYMMEDIS-Teamverzeichnis.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Input label="Unternehmen" required value={formular.name} onChange={setzen('name')} disabled={speichert} /><Input label="Kurzname" value={formular.shortName} onChange={setzen('shortName')} disabled={speichert} /><Input label="Branche" value={formular.industry} onChange={setzen('industry')} disabled={speichert} /><Input label="Ort" value={formular.location} onChange={setzen('location')} disabled={speichert} /><Input label="Mitarbeitende" type="number" min="0" value={formular.employeeCount} onChange={setzen('employeeCount')} disabled={speichert} /><Select label="Betreuung" value={formular.accountManagerKey} onChange={setzen('accountManagerKey')} required disabled={speichert}><option value="" disabled>Teammitglied wählen</option>{teamOptionen.map((mitglied) => <option key={mitglied.id} value={mitglied.id}>{mitglied.name}{mitglied.roleLabel ? ` · ${mitglied.roleLabel}` : ''}</option>)}</Select><Input label="Ansprechpartner" value={formular.contactName} onChange={setzen('contactName')} disabled={speichert} /><Input label="E-Mail Ansprechpartner" type="email" value={formular.contactEmail} onChange={setzen('contactEmail')} disabled={speichert} /><Input label="Rolle Ansprechpartner" value={formular.contactRole} onChange={setzen('contactRole')} disabled={speichert} /><Input label="Projektname" required value={formular.projectName} onChange={setzen('projectName')} disabled={speichert} /><Input label="Projektstart" type="date" value={formular.startDate} onChange={setzen('startDate')} disabled={speichert} /><Input label="Ergebnistermin" type="date" value={formular.resultDate} onChange={setzen('resultDate')} disabled={speichert} /></div>{formularFehler ? <p className="text-sm text-danger-ink" role="alert">{formularFehler}</p> : null}<div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => { setFormularOffen(false); setFormularFehler(null) }} disabled={speichert}>Abbrechen</Button><Button type="submit" disabled={speichert} aria-busy={speichert || undefined}>{speichert ? 'Wird angelegt …' : 'Tenant & Projekt anlegen'}</Button></div></form></CardBody></Card>
      ) : null}

      <Card>
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-end"><SearchInput value={suche} onChange={(event) => setSuche(event.target.value)} placeholder="Unternehmen, Branche oder Ansprechpartner …" label="Kunden durchsuchen" className="flex-1" /><Select label="Phase" value={status} onChange={(event) => setStatus(event.target.value)} className="sm:w-52" required><option value="alle">Alle Phasen</option>{Object.entries(PROJEKT_STATUS).map(([key, wert]) => <option key={key} value={key}>{wert.label}</option>)}</Select><Select label="Betreuung" value={betreuer} onChange={(event) => setBetreuer(event.target.value)} className="sm:w-52" required><option value="alle">Alle im Team</option>{betreuerOptionen.map((mitglied) => <option key={mitglied.id} value={mitglied.id}>{mitglied.name}</option>)}</Select></CardBody>
        <div className="border-t border-line"><DataTable caption="Alle betreuten Kundenprojekte" columns={spalten} rows={zeilen} getKey={(kunde) => kunde.id} onRowClick={(kunde) => navigate(`/intern/kunden/${kunde.id}`)} empty={<EmptyState icon={IconBuilding} title={kunden.length === 0 ? 'Noch keine Kundenprojekte' : 'Keine Projekte in dieser Auswahl'} description={kunden.length === 0 ? (echteDaten ? 'Legen Sie den ersten Kunden-Tenant an.' : 'Im Demo-Workspace sind derzeit keine Kundenprojekte vorhanden.') : 'Passen Sie Suche oder Filter an, um andere Projekte zu sehen.'} action={kunden.length > 0 && filterAktiv ? <Button variant="secondary" size="sm" onClick={filterZuruecksetzen}>Filter zurücksetzen</Button> : undefined} />} renderCard={(kunde) => { const info = PROJEKT_STATUS[kunde.status] || STANDARD_STATUS; const wert = kunde.analyse?.length ? sichererScore(kunde.gesamtScore) : null; return <div className="flex items-start gap-3"><Avatar name={kunde.kurz || kunde.unternehmen || 'K'} size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-[0.8125rem] font-medium text-ink">{kunde.unternehmen || 'Unbenannter Kunde'}</p><p className="mt-0.5 truncate text-xs text-ink-3">{kunde.branche || 'Branche offen'} · {teamMap[kunde.betreuerId]?.name || 'Nicht zugewiesen'}</p><div className="mt-1.5 flex flex-wrap gap-1.5"><Chip size="sm" toneName={info.tone} dot>{info.label}</Chip>{wert === null ? <Chip size="sm" toneName="neutral">Noch nicht bewertet</Chip> : <Chip size="sm" toneName={scoreStufe(wert).tone}>Reifegrad {wert}</Chip>}</div></div></div> }} /></div>
      </Card>
    </div>
  )
}
