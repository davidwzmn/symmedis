import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { useSession } from '../../hooks/useSession.js'
import { useToast } from '../../hooks/useToast.js'
import { onboardClientProject } from '../../lib/clientOnboardingApi.js'
import { PROJEKT_STATUS, TEAM, TEAM_MAP } from '../../data/workspace.js'
import { formatDate, tageBis } from '../../lib/format.js'
import { scoreStufe } from '../../lib/tone.js'
import { Avatar, Button, Chip } from '../../components/ui/primitives.jsx'
import { Card, CardBody, EmptyState, PageHeader } from '../../components/ui/layout.jsx'
import { DataTable, ProgressBar } from '../../components/ui/data.jsx'
import { Input, SearchInput, Select } from '../../components/ui/forms.jsx'
import { IconBuilding } from '../../components/ui/Icons.jsx'

const LEER = {
  name: '', shortName: '', industry: '', location: '', employeeCount: '',
  contactName: '', contactEmail: '', contactRole: '', accountManagerKey: 'mr',
  projectName: 'Ursachenanalyse', startDate: '', resultDate: '',
}

/** Kundenliste mit Filtern und echtem Tenant-Onboarding. */
export function ClientsPage() {
  const { kunden, echteDaten, neuLaden } = useWorkspace()
  const { accessToken } = useSession()
  const toast = useToast()
  const navigate = useNavigate()
  const [suche, setSuche] = useState('')
  const [status, setStatus] = useState('alle')
  const [betreuer, setBetreuer] = useState('alle')
  const [formularOffen, setFormularOffen] = useState(false)
  const [formular, setFormular] = useState(LEER)
  const [speichert, setSpeichert] = useState(false)
  const [formularFehler, setFormularFehler] = useState(null)

  const zeilen = useMemo(() => {
    const q = suche.trim().toLowerCase()
    return kunden.filter((kunde) => {
      if (status !== 'alle' && kunde.status !== status) return false
      if (betreuer !== 'alle' && kunde.betreuerId !== betreuer) return false
      if (
        q &&
        !kunde.unternehmen.toLowerCase().includes(q) &&
        !kunde.branche?.toLowerCase().includes(q) &&
        !kunde.ansprechpartner?.name?.toLowerCase().includes(q)
      ) return false
      return true
    })
  }, [kunden, suche, status, betreuer])

  const setzen = (key) => (event) => setFormular((alt) => ({ ...alt, [key]: event.target.value }))

  const anlegen = async (event) => {
    event.preventDefault()
    if (!formular.name.trim()) {
      setFormularFehler('Bitte geben Sie einen Unternehmensnamen ein.')
      return
    }
    setSpeichert(true)
    setFormularFehler(null)
    try {
      await onboardClientProject(accessToken, formular)
      await neuLaden()
      setFormular(LEER)
      setFormularOffen(false)
      toast.show({ title: 'Kunde angelegt', description: `${formular.name} wurde als eigener Tenant mit Projekt erstellt.`, variant: 'success' })
    } catch (error) {
      setFormularFehler(error instanceof Error ? error.message : 'Kunde konnte nicht angelegt werden.')
    } finally {
      setSpeichert(false)
    }
  }

  const spalten = [
    {
      key: 'unternehmen', label: 'Kunde', render: (kunde) => (
        <span className="flex min-w-0 items-center gap-2.5">
          <Avatar name={kunde.kurz} size="sm" />
          <span className="min-w-0">
            <span className="block truncate font-medium text-ink">{kunde.unternehmen}</span>
            <span className="block truncate text-xs text-ink-3">{kunde.branche || 'Branche offen'} · {kunde.ort || 'Ort offen'}</span>
          </span>
        </span>
      ),
    },
    {
      key: 'status', label: 'Phase', render: (kunde) => {
        const info = PROJEKT_STATUS[kunde.status] || PROJEKT_STATUS.onboarding
        return <Chip size="sm" toneName={info.tone} dot>{info.label}</Chip>
      },
    },
    {
      key: 'score', label: 'Reifegrad', hideBelow: 'lg', render: (kunde) => (
        <span className="flex items-center gap-2">
          <span className="tabular font-semibold text-ink">{kunde.gesamtScore}</span>
          <Chip size="sm" toneName={scoreStufe(kunde.gesamtScore).tone}>{scoreStufe(kunde.gesamtScore).label}</Chip>
        </span>
      ),
    },
    {
      key: 'fortschritt', label: 'Fortschritt', hideBelow: 'lg', render: (kunde) => (
        <span className="block w-28">
          <ProgressBar value={kunde.fortschritt} size="sm" hideLabel label={`Fortschritt ${kunde.unternehmen}`} animate={false} />
          <span className="tabular mt-1 block text-xs text-ink-3">{kunde.fortschritt} %</span>
        </span>
      ),
    },
    {
      key: 'freigaben', label: 'Freigaben offen', hideBelow: 'xl', align: 'center', render: (kunde) => {
        const offen = kunde.analyse.filter((a) => a.freigabe === 'bearbeitet' || a.freigabe === 'intern').length
        return offen > 0 ? <Chip size="sm" toneName="warn">{offen}</Chip> : <span className="text-xs text-ink-3">–</span>
      },
    },
    {
      key: 'betreuer', label: 'Betreuung', hideBelow: 'xl', render: (kunde) => (
        <span className="text-ink-2">{TEAM_MAP[kunde.betreuerId]?.name || 'Nicht zugewiesen'}</span>
      ),
    },
    {
      key: 'ergebnis', label: 'Ergebnistermin', hideBelow: 'md', align: 'right', render: (kunde) => {
        if (!kunde.ergebnis) return <span className="text-xs text-ink-3">offen</span>
        const tage = tageBis(kunde.ergebnis)
        return (
          <span className="block">
            <span className="block text-ink-2">{formatDate(kunde.ergebnis)}</span>
            <span className={tage < 0 ? 'block text-xs text-ink-3' : 'block text-xs font-medium text-warn-ink'}>
              {tage < 0 ? 'abgeschlossen' : `in ${tage} Tagen`}
            </span>
          </span>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kunden"
        subtitle={`${zeilen.length} von ${kunden.length} Projekten · Mandantenzugriff nur für das SYMMEDIS-Team`}
        actions={echteDaten ? <Button size="sm" onClick={() => setFormularOffen((wert) => !wert)}>Neuen Kunden anlegen</Button> : null}
      />

      {formularOffen ? (
        <Card>
          <CardBody>
            <form onSubmit={anlegen} className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-ink">Neuer Kunden-Tenant</h2>
                <p className="mt-1 text-[0.8125rem] text-ink-2">Organisation, Kundenstamm und erstes Analyseprojekt werden atomar angelegt.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Input label="Unternehmen" required value={formular.name} onChange={setzen('name')} />
                <Input label="Kurzname" value={formular.shortName} onChange={setzen('shortName')} />
                <Input label="Branche" value={formular.industry} onChange={setzen('industry')} />
                <Input label="Ort" value={formular.location} onChange={setzen('location')} />
                <Input label="Mitarbeitende" type="number" min="0" value={formular.employeeCount} onChange={setzen('employeeCount')} />
                <Select label="Betreuung" value={formular.accountManagerKey} onChange={setzen('accountManagerKey')} required>
                  {TEAM.map((mitglied) => <option key={mitglied.id} value={mitglied.id}>{mitglied.name}</option>)}
                </Select>
                <Input label="Ansprechpartner" value={formular.contactName} onChange={setzen('contactName')} />
                <Input label="E-Mail Ansprechpartner" type="email" value={formular.contactEmail} onChange={setzen('contactEmail')} />
                <Input label="Rolle Ansprechpartner" value={formular.contactRole} onChange={setzen('contactRole')} />
                <Input label="Projektname" required value={formular.projectName} onChange={setzen('projectName')} />
                <Input label="Projektstart" type="date" value={formular.startDate} onChange={setzen('startDate')} />
                <Input label="Ergebnistermin" type="date" value={formular.resultDate} onChange={setzen('resultDate')} />
              </div>
              {formularFehler ? <p className="text-sm text-danger-ink">{formularFehler}</p> : null}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setFormularOffen(false)} disabled={speichert}>Abbrechen</Button>
                <Button type="submit" disabled={speichert}>{speichert ? 'Wird angelegt …' : 'Tenant & Projekt anlegen'}</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <SearchInput value={suche} onChange={(event) => setSuche(event.target.value)} placeholder="Unternehmen, Branche oder Ansprechpartner …" label="Kunden durchsuchen" className="flex-1" />
          <Select label="Phase" value={status} onChange={(event) => setStatus(event.target.value)} className="sm:w-52" required>
            <option value="alle">Alle Phasen</option>
            {Object.entries(PROJEKT_STATUS).map(([key, wert]) => <option key={key} value={key}>{wert.label}</option>)}
          </Select>
          <Select label="Betreuung" value={betreuer} onChange={(event) => setBetreuer(event.target.value)} className="sm:w-52" required>
            <option value="alle">Alle im Team</option>
            {TEAM.map((mitglied) => <option key={mitglied.id} value={mitglied.id}>{mitglied.name}</option>)}
          </Select>
        </CardBody>
        <div className="border-t border-line">
          <DataTable
            caption="Alle betreuten Kundenprojekte" columns={spalten} rows={zeilen} getKey={(kunde) => kunde.id}
            onRowClick={(kunde) => navigate(`/intern/kunden/${kunde.id}`)}
            empty={<EmptyState icon={IconBuilding} title="Noch keine Kundenprojekte" description={echteDaten ? 'Legen Sie den ersten Kunden-Tenant an.' : 'Passen Sie Suche oder Filter an.'} />}
            renderCard={(kunde) => {
              const info = PROJEKT_STATUS[kunde.status] || PROJEKT_STATUS.onboarding
              return (
                <div className="flex items-start gap-3">
                  <Avatar name={kunde.kurz} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.8125rem] font-medium text-ink">{kunde.unternehmen}</p>
                    <p className="mt-0.5 truncate text-xs text-ink-3">{kunde.branche || 'Branche offen'} · {TEAM_MAP[kunde.betreuerId]?.name || 'Nicht zugewiesen'}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <Chip size="sm" toneName={info.tone} dot>{info.label}</Chip>
                      <Chip size="sm" toneName={scoreStufe(kunde.gesamtScore).tone}>Reifegrad {kunde.gesamtScore}</Chip>
                    </div>
                  </div>
                </div>
              )
            }}
          />
        </div>
      </Card>
    </div>
  )
}
