import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { useSession } from '../../hooks/useSession.js'
import { TEAM } from '../../data/workspace.js'
import { fetchTeamDirectory } from '../../lib/workspaceApi.js'
import { formatDate } from '../../lib/format.js'
import { faelligkeit } from '../../lib/aufgaben.js'
import { Avatar, Button, Chip } from '../../components/ui/primitives.jsx'
import { Card, CardBody, CardHeader, PageHeader, EmptyState, Banner } from '../../components/ui/layout.jsx'
import { ProgressBar } from '../../components/ui/data.jsx'
import { IconBuilding, IconCheckSquare, IconShield, IconUsers } from '../../components/ui/Icons.jsx'

export function TeamPage() {
  const { kunden, echteDaten } = useWorkspace()
  const { accessToken, echteAuthentifizierung } = useSession()
  const [directory, setDirectory] = useState([])
  const [loading, setLoading] = useState(Boolean(echteAuthentifizierung))
  const [error, setError] = useState(null)

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
      return directory.map((member) => ({
        ...member,
        rolle: member.roleLabel,
        auslastung: null,
        betreuerKey: null,
      }))
    }
    return TEAM.map((member) => ({ ...member, betreuerKey: member.id }))
  }, [directory, echteAuthentifizierung])

  return (
    <div className="space-y-6">
      <PageHeader title="Team" subtitle="Zugänge, Zuständigkeiten und offene Arbeitspakete innerhalb Ihrer SYMMEDIS-Organisation." />

      <Banner toneName={echteAuthentifizierung ? 'ok' : 'warn'} icon={IconShield} title={echteAuthentifizierung ? 'Live Team Directory' : 'Demo-Team'}>
        {echteAuthentifizierung
          ? 'Die Teamliste wird direkt aus Supabase geladen. RLS begrenzt die Sicht auf interne Profile derselben Organisation.'
          : 'Im Demo-Modus werden statische Beispieldaten angezeigt.'}
      </Banner>

      {loading ? <p className="text-sm text-ink-2">Team wird geladen …</p> : null}
      {error ? <Banner toneName="danger" title="Team konnte nicht geladen werden">{error}</Banner> : null}

      {!loading && !error && members.length === 0 ? (
        <EmptyState icon={IconUsers} title="Noch keine Teammitglieder" description="Sobald weitere interne Zugänge angelegt werden, erscheinen sie hier organisationsgebunden." />
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        {members.map((mitglied) => {
          const projekte = echteDaten && mitglied.betreuerKey ? kunden.filter((k) => k.betreuerId === mitglied.betreuerKey) : []
          const aufgaben = kunden
            .flatMap((k) => k.aufgaben.map((a) => ({ ...a, kunde: k })))
            .filter((a) => a.zustaendig === mitglied.name && a.status !== 'erledigt')

          return (
            <Card key={mitglied.id}>
              <CardHeader
                title={mitglied.name}
                subtitle={mitglied.rolle}
                icon={IconUsers}
                action={<Chip size="sm" toneName={mitglied.role === 'admin' ? 'brand' : 'accent'}>{mitglied.role === 'admin' ? 'Admin' : 'Intern'}</Chip>}
              />
              <CardBody className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar name={mitglied.name} size="lg" />
                  <div className="min-w-0 flex-1">
                    {mitglied.email ? <p className="truncate text-[0.8125rem] text-ink-2">{mitglied.email}</p> : null}
                    {mitglied.auslastung != null ? (
                      <>
                        <ProgressBar value={mitglied.auslastung} size="sm" hideLabel label={`Auslastung ${mitglied.name}`} toneName={mitglied.auslastung > 85 ? 'warn' : 'brand'} />
                        <p className="mt-1.5 text-xs text-ink-3">{mitglied.auslastung} % Auslastung</p>
                      </>
                    ) : (
                      <p className="mt-1 text-xs text-ink-3">Authentifizierter SYMMEDIS-Zugang</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink-2"><IconBuilding className="size-3.5" />Betreute Projekte</p>
                  {projekte.length === 0 ? (
                    <p className="text-[0.8125rem] text-ink-3">{echteDaten ? 'Noch keine direkte Projektzuordnung hinterlegt.' : 'Aktuell keine Projektbetreuung.'}</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {projekte.map((kunde) => (
                        <li key={kunde.id}><Link to={`/intern/kunden/${kunde.id}`} className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2 text-[0.8125rem] transition-colors hover:bg-surface-muted"><span className="min-w-0 truncate text-ink">{kunde.unternehmen}</span><span className="shrink-0 text-xs text-ink-3">{formatDate(kunde.ergebnis)}</span></Link></li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink-2"><IconCheckSquare className="size-3.5" />Offene Aufgaben</p>
                  {aufgaben.length === 0 ? (
                    <EmptyState compact icon={IconCheckSquare} title="Nichts offen" description="Keine offenen Aufgaben sind diesem Namen zugeordnet." />
                  ) : (
                    <ul className="space-y-1.5">
                      {aufgaben.slice(0, 4).map((aufgabe) => {
                        const f = faelligkeit(aufgabe)
                        return <li key={aufgabe.id} className="flex items-center justify-between gap-3 text-[0.8125rem]"><span className="min-w-0 truncate text-ink">{aufgabe.titel}</span><Chip size="sm" toneName={f.tone}>{f.label}</Chip></li>
                      })}
                    </ul>
                  )}
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
