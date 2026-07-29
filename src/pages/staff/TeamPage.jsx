import { Link } from 'react-router-dom'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { TEAM } from '../../data/workspace.js'
import { formatDate } from '../../lib/format.js'
import { faelligkeit } from '../../lib/aufgaben.js'
import { Avatar, Button, Chip } from '../../components/ui/primitives.jsx'
import { Card, CardBody, CardHeader, PageHeader, EmptyState } from '../../components/ui/layout.jsx'
import { ProgressBar } from '../../components/ui/data.jsx'
import { IconBuilding, IconCheckSquare, IconUsers } from '../../components/ui/Icons.jsx'

/** Team, Zuständigkeiten und Auslastung. */
export function TeamPage() {
  const { kunden } = useWorkspace()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        subtitle="Zuständigkeiten, Auslastung und offene Arbeitspakete je Person."
      />

      <div className="grid gap-5 md:grid-cols-2">
        {TEAM.map((mitglied) => {
          const projekte = kunden.filter((k) => k.betreuerId === mitglied.id)
          const aufgaben = kunden
            .flatMap((k) => k.aufgaben.map((a) => ({ ...a, kunde: k })))
            .filter((a) => a.zustaendig === mitglied.name && a.status !== 'erledigt')

          return (
            <Card key={mitglied.id}>
              <CardHeader
                title={mitglied.name}
                subtitle={mitglied.rolle}
                icon={IconUsers}
                action={
                  <Chip size="sm" toneName={mitglied.auslastung > 85 ? 'warn' : 'ok'}>
                    {mitglied.auslastung} % ausgelastet
                  </Chip>
                }
              />
              <CardBody className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar name={mitglied.name} size="lg" />
                  <div className="min-w-0 flex-1">
                    <ProgressBar
                      value={mitglied.auslastung}
                      size="sm"
                      hideLabel
                      label={`Auslastung ${mitglied.name}`}
                      toneName={mitglied.auslastung > 85 ? 'warn' : 'brand'}
                    />
                    <p className="mt-1.5 text-xs text-ink-3">
                      {projekte.length} betreute Projekte · {aufgaben.length} offene Aufgaben
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink-2">
                    <IconBuilding className="size-3.5" />
                    Betreute Projekte
                  </p>
                  {projekte.length === 0 ? (
                    <p className="text-[0.8125rem] text-ink-3">Aktuell keine Projektbetreuung.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {projekte.map((kunde) => (
                        <li key={kunde.id}>
                          <Link
                            to={`/intern/kunden/${kunde.id}`}
                            className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2 text-[0.8125rem] transition-colors hover:bg-surface-muted"
                          >
                            <span className="min-w-0 truncate text-ink">{kunde.unternehmen}</span>
                            <span className="shrink-0 text-xs text-ink-3">
                              {formatDate(kunde.ergebnis)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink-2">
                    <IconCheckSquare className="size-3.5" />
                    Offene Aufgaben
                  </p>
                  {aufgaben.length === 0 ? (
                    <EmptyState
                      compact
                      icon={IconCheckSquare}
                      title="Nichts offen"
                      description="Alle zugewiesenen Aufgaben sind erledigt."
                    />
                  ) : (
                    <ul className="space-y-1.5">
                      {aufgaben.slice(0, 4).map((aufgabe) => {
                        const f = faelligkeit(aufgabe)
                        return (
                          <li
                            key={aufgabe.id}
                            className="flex items-center justify-between gap-3 text-[0.8125rem]"
                          >
                            <span className="min-w-0 truncate text-ink">{aufgabe.titel}</span>
                            <Chip size="sm" toneName={f.tone}>
                              {f.label}
                            </Chip>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                  {aufgaben.length > 4 ? (
                    <Button as={Link} to="/intern/aufgaben" variant="ghost" size="sm" className="mt-2 -ml-3">
                      Alle {aufgaben.length} Aufgaben
                    </Button>
                  ) : null}
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
