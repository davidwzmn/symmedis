import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from '../../hooks/useSession.js'
import { useToast } from '../../hooks/useToast.js'
import { fetchWebsiteLeads, updateWebsiteLead } from '../../lib/leadsApi.js'
import { Chip } from '../../components/ui/primitives.jsx'
import { Card, CardBody, EmptyState, PageHeader } from '../../components/ui/layout.jsx'
import { SearchInput, Select } from '../../components/ui/forms.jsx'
import { IconMail, IconTarget } from '../../components/ui/Icons.jsx'

const STATUS = {
  new: { label: 'Neu', tone: 'warn' },
  contacted: { label: 'Kontaktiert', tone: 'info' },
  qualified: { label: 'Qualifiziert', tone: 'ok' },
  closed: { label: 'Abgeschlossen', tone: 'neutral' },
  spam: { label: 'Spam', tone: 'urgent' },
}

function dateTime(value) {
  if (!value) return '–'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Zeitpunkt unbekannt'
  return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function LeadsPage() {
  const { accessToken } = useSession()
  const toast = useToast()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('open')
  const [savingId, setSavingId] = useState(null)

  const load = useCallback(async () => {
    if (!accessToken) {
      setLeads([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      setLeads(await fetchWebsiteLeads(accessToken))
    } catch (error) {
      toast.show({ title: 'Anfragen konnten nicht geladen werden', description: error instanceof Error ? error.message : 'Unbekannter Fehler', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }, [accessToken, toast])

  useEffect(() => { load() }, [load])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return leads.filter((lead) => {
      if (filter === 'open' && ['closed', 'spam'].includes(lead.status)) return false
      if (filter !== 'all' && filter !== 'open' && lead.status !== filter) return false
      if (!q) return true
      return [lead.name, lead.company, lead.email, lead.situation].some((value) => String(value || '').toLowerCase().includes(q))
    })
  }, [leads, query, filter])

  const setStatus = async (lead, status) => {
    if (!accessToken || savingId || status === lead.status) return
    const previous = lead.status
    setSavingId(lead.id)
    setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, status } : item))
    try {
      await updateWebsiteLead(accessToken, lead.id, status)
      toast.show({ title: 'Status aktualisiert', description: `${lead.company || lead.name || 'Anfrage'} · ${STATUS[status]?.label || status}`, variant: 'success' })
    } catch (error) {
      setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, status: previous } : item))
      toast.show({ title: 'Änderung fehlgeschlagen', description: error instanceof Error ? error.message : 'Status konnte nicht gespeichert werden.', variant: 'danger' })
    } finally {
      setSavingId(null)
    }
  }

  const newCount = leads.filter((lead) => lead.status === 'new').length
  const qualified = leads.filter((lead) => lead.status === 'qualified').length

  return (
    <div className="space-y-6">
      <PageHeader title="Website-Anfragen" subtitle="Echte Diagnosegespräche aus der öffentlichen SYMMEDIS-Website – serverseitig validiert und rate-limitiert." meta={<><Chip toneName={newCount ? 'warn' : 'neutral'}>{newCount} neu</Chip><Chip toneName="ok">{qualified} qualifiziert</Chip></>} />

      <Card>
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, Unternehmen, E-Mail oder Kontext …" label="Anfragen durchsuchen" className="flex-1" />
          <Select label="Status" value={filter} onChange={(event) => setFilter(event.target.value)} className="sm:w-52" required>
            <option value="open">Offene Anfragen</option><option value="all">Alle</option>{Object.entries(STATUS).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
          </Select>
        </CardBody>
      </Card>

      {loading ? <Card><CardBody><p className="text-sm text-ink-2" role="status">Anfragen werden geladen …</p></CardBody></Card> : null}
      {!loading && visible.length === 0 ? <Card><EmptyState icon={IconMail} title="Keine Anfragen in dieser Auswahl" description={leads.length ? 'Ändern Sie Filter oder Suche, um andere Website-Anfragen zu sehen.' : 'Neue Website-Anfragen erscheinen hier automatisch, sobald ein Diagnosegespräch angefragt wurde.'} /></Card> : null}
      {savingId ? <p className="sr-only" role="status">Anfragenstatus wird gespeichert.</p> : null}

      {!loading && visible.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {visible.map((lead) => {
            const state = STATUS[lead.status] || STATUS.new
            const saving = savingId === lead.id
            return (
              <Card key={lead.id} className="overflow-hidden" aria-busy={saving || undefined}>
                <CardBody className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0"><p className="truncate text-base font-semibold tracking-tight text-ink">{lead.company || 'Unternehmen nicht angegeben'}</p><p className="mt-1 text-[0.8125rem] text-ink-2">{lead.name || 'Kontaktperson nicht angegeben'}{lead.email ? <> · <a href={`mailto:${lead.email}`} className="font-medium text-brand-ink hover:underline">{lead.email}</a></> : null}</p></div>
                    <Chip toneName={state.tone}>{state.label}</Chip>
                  </div>

                  <div className="mt-4 rounded-xl border border-line bg-surface-muted p-4"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.09em] text-ink-3"><IconTarget className="size-3.5" />Wachstumsfrage</div><p className="mt-2 whitespace-pre-wrap text-[0.8125rem] leading-relaxed text-ink-2">{lead.situation || 'Kein zusätzlicher Kontext angegeben.'}</p></div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="text-xs text-ink-3"><p>{dateTime(lead.created_at)}</p><p className="mt-0.5">Quelle: {lead.source || 'website'}</p></div>
                    <Select label="Bearbeitungsstatus" value={lead.status} onChange={(event) => setStatus(lead, event.target.value)} className="sm:w-44" required disabled={Boolean(savingId)}>
                      {Object.entries(STATUS).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
                    </Select>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
