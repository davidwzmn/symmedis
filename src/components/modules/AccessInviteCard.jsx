import { useEffect, useMemo, useState } from 'react'
import { fetchCustomerUsers, inviteCustomerUser } from '../../lib/accessApi.js'
import { useSession } from '../../hooks/useSession.js'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { useToast } from '../../hooks/useToast.js'
import { Button, Chip } from '../ui/primitives.jsx'
import { Card, CardBody, CardHeader, EmptyState } from '../ui/layout.jsx'
import { Input } from '../ui/forms.jsx'
import { IconCheck, IconMail, IconShield, IconUsers } from '../ui/Icons.jsx'

export function AccessInviteCard({ kunde }) {
  const { accessToken } = useSession()
  const { echteDaten } = useWorkspace()
  const toast = useToast()
  const [email, setEmail] = useState(kunde.ansprechpartner?.email || '')
  const [name, setName] = useState(kunde.ansprechpartner?.name || '')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [users, setUsers] = useState([])

  const normalizedEmail = email.trim().toLowerCase()
  const emailExists = useMemo(() => users.some((user) => user.email.toLowerCase() === normalizedEmail), [users, normalizedEmail])

  useEffect(() => {
    if (!echteDaten || !accessToken || !kunde.id) return
    let active = true
    setLoading(true)
    fetchCustomerUsers(accessToken, kunde.id)
      .then((rows) => { if (active) setUsers(rows) })
      .catch(() => { if (active) setUsers([]) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [accessToken, echteDaten, kunde.id])

  if (!echteDaten) return null

  const invite = async (event) => {
    event.preventDefault()
    if (!normalizedEmail) return setError('Bitte geben Sie eine E-Mail-Adresse ein.')
    if (emailExists) return setError('Für diese E-Mail existiert bereits ein Kundenzugang.')
    setSending(true)
    setError(null)
    try {
      await inviteCustomerUser(accessToken, kunde, normalizedEmail, name.trim())
      const refreshed = await fetchCustomerUsers(accessToken, kunde.id).catch(() => [])
      setUsers(refreshed)
      toast.show({ title: 'Einladung versendet', description: `${normalizedEmail} wurde dem Kunden-Tenant zugeordnet.`, variant: 'success' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Einladung konnte nicht versendet werden.'
      setError(message)
      toast.show({ title: 'Einladung fehlgeschlagen', description: message, variant: 'danger' })
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="border-brand-border">
      <CardHeader
        title="Kunden-Zugang"
        subtitle="Mandantensicher über Supabase Auth"
        icon={IconShield}
        action={<Chip size="sm" toneName={users.length ? 'ok' : 'neutral'}>{users.length} aktiv</Chip>}
      />
      <CardBody className="space-y-4">
        {loading ? (
          <p className="text-xs text-ink-3">Portalzugänge werden geladen …</p>
        ) : users.length ? (
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-3 rounded-lg border border-line bg-surface-muted p-3">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-accent-soft text-accent-ink"><IconCheck className="size-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.8125rem] font-semibold text-ink">{user.name}</p>
                  <p className="truncate text-xs text-ink-3">{user.email}</p>
                </div>
                <Chip size="sm" toneName="ok">Portal</Chip>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState compact icon={IconUsers} title="Noch kein Kundenzugang" description="Laden Sie die erste berechtigte Kontaktperson ein." />
        )}

        <form onSubmit={invite} className="space-y-3 border-t border-line pt-4">
          <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} />
          <Input label="E-Mail" type="email" required value={email} onChange={(event) => { setEmail(event.target.value); setError(null) }} error={error} />
          <Button type="submit" size="sm" fullWidth disabled={sending || emailExists}>
            <IconMail className="size-4" />
            {sending ? 'Einladung wird versendet …' : emailExists ? 'Zugang existiert bereits' : 'Portal-Zugang einladen'}
          </Button>
          <p className="text-xs leading-relaxed text-ink-3">Der Zugang wird fest diesem Kunden-Tenant zugeordnet. Andere Mandanten bleiben durch Row Level Security unerreichbar.</p>
        </form>
      </CardBody>
    </Card>
  )
}
