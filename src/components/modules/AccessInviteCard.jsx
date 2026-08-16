import { useState } from 'react'
import { inviteCustomerUser } from '../../lib/accessApi.js'
import { useSession } from '../../hooks/useSession.js'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { useToast } from '../../hooks/useToast.js'
import { Button } from '../ui/primitives.jsx'
import { Card, CardBody, CardHeader } from '../ui/layout.jsx'
import { Input } from '../ui/forms.jsx'
import { IconMail, IconShield } from '../ui/Icons.jsx'

export function AccessInviteCard({ kunde }) {
  const { accessToken } = useSession()
  const { echteDaten } = useWorkspace()
  const toast = useToast()
  const [email, setEmail] = useState(kunde.ansprechpartner?.email || '')
  const [name, setName] = useState(kunde.ansprechpartner?.name || '')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  if (!echteDaten) return null

  const invite = async (event) => {
    event.preventDefault()
    if (!email.trim()) return setError('Bitte geben Sie eine E-Mail-Adresse ein.')
    setSending(true)
    setError(null)
    try {
      await inviteCustomerUser(accessToken, kunde, email.trim(), name.trim())
      toast.show({ title: 'Einladung versendet', description: `${email.trim()} wurde dem Kunden-Tenant zugeordnet.`, variant: 'success' })
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
      <CardHeader title="Kunden-Zugang" subtitle="Mandantensicher über Supabase Auth" icon={IconShield} />
      <CardBody>
        <form onSubmit={invite} className="space-y-3">
          <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} />
          <Input label="E-Mail" type="email" required value={email} onChange={(event) => { setEmail(event.target.value); setError(null) }} error={error} />
          <Button type="submit" size="sm" fullWidth disabled={sending}>
            <IconMail className="size-4" />
            {sending ? 'Einladung wird versendet …' : 'Portal-Zugang einladen'}
          </Button>
          <p className="text-xs leading-relaxed text-ink-3">Der Zugang wird fest diesem Kunden-Tenant zugeordnet. Andere Mandanten bleiben durch Row Level Security unerreichbar.</p>
        </form>
      </CardBody>
    </Card>
  )
}
