import { useState } from 'react'
import { formatRelative } from '../../lib/format.js'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { useSession } from '../../hooks/useSession.js'
import { useToast } from '../../hooks/useToast.js'
import { Avatar, Button } from '../ui/primitives.jsx'
import { Card, CardBody, CardHeader, EmptyState } from '../ui/layout.jsx'
import { Textarea } from '../ui/forms.jsx'
import { IconLock, IconNote } from '../ui/Icons.jsx'

/**
 * Interne Notizen zu einem Kunden.
 *
 * Diese Komponente wird ausschließlich im Mitarbeiterportal eingebunden.
 * Die Kennzeichnung ist bewusst deutlich, damit beim Schreiben klar ist,
 * dass der Inhalt den internen Bereich nicht verlässt.
 */
export function InternalNotes({ kunde }) {
  const { addNotiz } = useWorkspace()
  const { session } = useSession()
  const toast = useToast()
  const [text, setText] = useState('')

  const speichern = () => {
    const inhalt = text.trim()
    if (!inhalt) return
    addNotiz(kunde.id, inhalt, session?.name ?? 'SYMMEDIS')
    setText('')
    toast.show({ title: 'Notiz gespeichert', description: 'Nur intern sichtbar.', variant: 'success' })
  }

  return (
    <Card className="border-warn-border">
      <CardHeader
        title="Interne Notizen"
        subtitle="Erscheinen nie im Kundenportal und in keinem Export"
        icon={IconLock}
      />
      <CardBody className="space-y-4">
        <div>
          <Textarea
            rows={3}
            value={text}
            onChange={(event) => setText(event.target.value)}
            label="Neue Notiz"
            placeholder="Beobachtung, Absprache oder Hinweis für das Team …"
            hint="Nur für das SYMMEDIS-Team sichtbar."
          />
          <div className="mt-2.5 flex justify-end">
            <Button size="sm" disabled={!text.trim()} onClick={speichern}>
              Notiz speichern
            </Button>
          </div>
        </div>

        {kunde.notizenIntern.length === 0 ? (
          <EmptyState
            compact
            icon={IconNote}
            title="Noch keine Notizen"
            description="Halten Sie hier fest, was für die Ergebnispräsentation wichtig ist."
          />
        ) : (
          <ul className="space-y-3 border-t border-line pt-4">
            {kunde.notizenIntern.map((notiz) => (
              <li key={notiz.id} className="flex gap-3">
                <Avatar name={notiz.autor} size="sm" className="mt-0.5" />
                <div className="min-w-0 flex-1 rounded-lg border border-line bg-surface-muted px-3.5 py-2.5">
                  <p className="flex flex-wrap items-baseline gap-x-2 text-xs text-ink-3">
                    <span className="font-medium text-ink-2">{notiz.autor}</span>
                    {formatRelative(notiz.zeit)}
                  </p>
                  <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink">{notiz.text}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  )
}
