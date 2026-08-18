import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { useSession } from '../../hooks/useSession.js'
import { useToast } from '../../hooks/useToast.js'
import { TEAM } from '../../data/workspace.js'
import { fetchTeamDirectory } from '../../lib/workspaceApi.js'
import { inviteStaffUser } from '../../lib/staffAccessApi.js'
import { formatDate } from '../../lib/format.js'
import { faelligkeit } from '../../lib/aufgaben.js'
import { Avatar, Button, Chip } from '../../components/ui/primitives.jsx'
import { Card, CardBody, CardHeader, PageHeader, EmptyState, Banner } from '../../components/ui/layout.jsx'
import { Input, Select } from '../../components/ui/forms.jsx'
import { ProgressBar } from '../../components/ui/data.jsx'
import { IconBuilding, IconCheckSquare, IconMail, IconShield, IconUsers } from '../../components/ui/Icons.jsx'

const LEERE_EINLADUNG = { fullName: '', email: '', role: 'intern' }

export function TeamPage() {
  const { kunden, echteDaten } = useWorkspace()
  const { session, accessToken, echteAuthentifizierung } = useSession()
  const toast = useToast()
  const [directory, setDirectory] = useState([])
  const [loading, setLoading] = useState(Boolean(echteAuthentifizierung))
  const [error, setError] = useState(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [invite, setInvite] = useState(LEERE_EINLADUNG)
  const [inviteBusy, setInviteBusy] = useState(false)
  const [inviteError, setInviteError] = useState(null)

  const istAdmin = Boolean(echteAuthentifizierung && session?.istAdmin)

  const loadDirectory = useCallback(async () => {
    if (!echteAuthentifizierung || !accessToken) return []
    setLoading(true)
    setError(null)
    try {
      const rows = await fetchTeamDirectory(accessToken)
      setDirectory(rows)
      return rows
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Team konnte nicht geladen werden.'
      setError(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [accessToken, echteAuthentifizierung])

  useEffect(() => {
    if (!echteAuthentifizierung || !accessToken) return undefined
    let active = true
    setLoading(true)
    setError(null)
    fetchTeamDirectory(accessToken)
      .then((rows) => { if (active) setDirectory(rows) })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Team konnte nicht geladen werden.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [accessToken, echteAuthentifizierung])

  const members = useMemo(() => {
    if (echteAuthentifizierung) {
      return directory.map((member) => ({ ...member, rolle: member.roleLabel, auslastung: null, betreuerKey: member.id }))
    }
    return TEAM.map((member) => ({ ...member, betreuerKey: member.id }))
  }, [directory, echteAuthentifizierung])

  const sendInvite = async (event) => {
    event.preventDefault()
    if (!istAdmin || !accessToken) return
    const email = invite.email.trim().toLowerCase()
    if (!email) {
      setInviteError('Bitte geben Sie eine E-Mail-Adresse ein.')
      return
    }

    setInviteBusy(true)
    setInviteError(null)
    try {
      await inviteStaffUser(accessToken, { ...invite, email })
      await loadDirectory()
      toast.show({ title: 'Teameinladung versendet', description: `${email} wurde als ${invite.role === 'admin' ? 'Administrator:in' : 'Mitarbeiter:in'} eingeladen.`, variant: 'success' })
      setInvite(LEERE_EINLADUNG)
      setInviteOpen(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Einladung konnte nicht versendet werden.'
      setInviteError(message)
      toast.show({ title: 'Einladung fehlgeschlagen', description: message, variant: 'danger' })
    } finally {
      setInviteBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        subtitle="Zugänge, Zuständigkeiten und offene Arbeitspakete innerhalb Ihrer SYMMEDIS-Organisation."
        meta={istAdmin ? <Chip toneName="brand" icon={IconShield}>Administratorzugang</Chip> : undefined}
        actions={istAdmin ? <Button size="sm" onClick={() => { setInviteOpen((value) => !value); setInviteError(null) }}><IconMail className="size-4" />Teammitglied einladen</Button> : null}
      />

      <Banner toneName={echteAuthentifizierung ? 'ok' : 'warn'} icon={IconShield} title={echteAuthentifizierung ? 'Geschütztes Teamverzeichnis' : 'Demo-Team'}>
        {echteAuthentifizierung
          ? `Die Teamliste wird direkt aus Supabase geladen. RLS begrenzt die Sicht auf interne Profile derselben Organisation.${istAdmin ? ' Ihre Admin-Berechtigung stammt aus Ihrem authentifizierten Profil und bleibt unabhängig vom Laden dieser Liste erhalten.' : ''}`
          : 'Im Demo-Modus werden statische Beispieldaten angezeigt.'}
      </Banner>

      {inviteOpen && istAdmin ? (
        <Card className="border-brand-border">
          <CardHeader title="Neues Teammitglied" subtitle="Die Einladung erstellt erst nach erfolgreichem Auth-Invite ein organisationsgebundenes internes Profil." icon={IconShield} />
          <CardBody>
            <form onSubmit={sendInvite} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Input label="Name" value={invite.fullName} onChange={(event) => setInvite((value) => ({ ...value, fullName: event.target.value }))} disabled={inviteBusy} />
                <Input label="E-Mail" type="email" required value={invite.email} onChange={(event) => { setInvite((value) => ({ ...value, email: event.target.value })); setInviteError(null) }} error={inviteError} disabled={inviteBusy} />
                <Select label="Rolle" value={invite.role} onChange={(event) => setInvite((value) => ({ ...value, role: event.target.value }))} required disabled={inviteBusy}>
                  <option value="intern">Mitarbeiter:in</option>
                  <option value="admin">Administrator:in</option>
                </Select>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-2xl text-xs leading-relaxed text-ink-3">Administratoren können Teamzugänge verwalten und weitere interne Personen einladen. Die Berechtigung wird zusätzlich serverseitig geprüft; ein Browser kann sich nicht selbst zum Admin machen.</p>
                <div className="flex shrink-0 gap-2">
                  <Button type="button" variant="secondary" size="sm" disabled={inviteBusy} onClick={() => { setInviteOpen(false); setInviteError(null) }}>Abbrechen</Button>
                  <Button type="submit" size="sm" disabled={inviteBusy} aria-busy={inviteBusy || undefined}>{inviteBusy ? 'Einladung wird versendet …' : 'Einladung versenden'}</Button>
                </div>
              </div>
            </form>
          </CardBody>
        </Card>
      ) : null}

      {loading ? <p className="text-sm text-ink-2" role="status">Team wird geladen …</p> : null}
      {error ? <Banner toneName="danger" title="Team konnte nicht geladen werden">{error} <Button variant="ghost" size="sm" onClick={loadDirectory}>Erneut laden</Button></Banner> : null}

      {!loading && !error && members.length === 0 ? <EmptyState icon={IconUsers} title="Noch keine Teammitglieder" description="Sobald weitere interne Zugänge angelegt werden, erscheinen sie hier organisationsgebunden." /> : null}

      <div className="grid gap-5 md:grid-cols-2">
        {members.map((mitglied) => {
          const projekte = echteDaten && mitglied.betreuerKey ? kunden.filter((k) => k.betreuerId === mitglied.betreuerKey) : []
          const aufgaben = kunden.flatMap((k) => k.aufgaben.map((a) => ({ ...a, kunde: k }))).filter((a) => a.zustaendig === mitglied.name && a.status !== 'erledigt')
          return (
            <Card key={mitglied.id}>
              <CardHeader title={mitglied.name} subtitle={mitglied.rolle} icon={IconUsers} action={<Chip size="sm" toneName={mitglied.role === 'admin' ? 'brand' : 'accent'}>{mitglied.role === 'admin' ? 'Admin' : 'Intern'}</Chip>} />
              <CardBody className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar name={mitglied.name} size="lg" />
                  <div className="min-w-0 flex-1">
                    {mitglied.email ? <p className="truncate text-[0.8125rem] text-ink-2">{mitglied.email}</p> : null}
                    {mitglied.auslastung != null ? <><ProgressBar value={mitglied.auslastung} size="sm" hideLabel label={`Auslastung ${mitglied.name}`} toneName={mitglied.auslastung > 85 ? 'warn' : 'brand'} /><p className="mt-1.5 text-xs text-ink-3">{mitglied.auslastung} % Auslastung</p></> : <p className="mt-1 text-xs text-ink-3">Authentifizierter SYMMEDIS-Zugang{mitglied.id === session?.userId ? ' · Sie' : ''}</p>}
                  </div>
                </div>

                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink-2"><IconBuilding className="size-3.5" />Betreute Projekte</p>
                  {projekte.length === 0 ? <p className="text-[0.8125rem] text-ink-3">{echteDaten ? 'Noch keine direkte Projektzuordnung hinterlegt.' : 'Aktuell keine Projektbetreuung.'}</p> : <ul className="space-y-1.5">{projekte.map((kunde) => <li key={kunde.id}><Link to={`/intern/kunden/${kunde.id}`} className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2 text-[0.8125rem] transition-colors hover:bg-surface-muted"><span className="min-w-0 truncate text-ink">{kunde.unternehmen}</span><span className="shrink-0 text-xs text-ink-3">{formatDate(kunde.ergebnis)}</span></Link></li>)}</ul>}
                </div>

                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink-2"><IconCheckSquare className="size-3.5" />Offene Aufgaben</p>
                  {aufgaben.length === 0 ? <EmptyState compact icon={IconCheckSquare} title="Nichts offen" description="Keine offenen Aufgaben sind diesem Namen zugeordnet." /> : <ul className="space-y-1.5">{aufgaben.slice(0, 4).map((aufgabe) => { const f = faelligkeit(aufgabe); return <li key={aufgabe.id} className="flex items-center justify-between gap-3 text-[0.8125rem]"><span className="min-w-0 truncate text-ink">{aufgabe.titel}</span><Chip size="sm" toneName={f.tone}>{f.label}</Chip></li> })}</ul>}
                  {aufgaben.length > 4 ? <Button as={Link} to="/intern/aufgaben" variant="ghost" size="sm" className="mt-2 -ml-3">Alle {aufgaben.length} Aufgaben</Button> : null}
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
