import { useEffect, useMemo, useState } from 'react'
import { useSession } from '../../hooks/useSession.js'
import { useToast } from '../../hooks/useToast.js'
import { fetchLaunchReadiness, saveLaunchGateEvidence } from '../../lib/launchReadinessApi.js'
import { Button, Chip } from '../ui/primitives.jsx'
import { Textarea } from '../ui/forms.jsx'
import { Banner, Card, CardBody, CardHeader } from '../ui/layout.jsx'
import { IconCheck, IconClock, IconShield } from '../ui/Icons.jsx'

const MANUAL_GATES = new Set(['custom_smtp', 'restore_drill'])
const GATE_ORDER = ['leaked_password_protection', 'custom_smtp', 'real_invite_delivery', 'real_magic_link_login', 'restore_drill']
const guidance = {
  custom_smtp: 'Erst verifizieren, wenn Custom SMTP, Absenderdomain und Provider-Konfiguration real aktiv geprüft wurden.',
  restore_drill: 'Erst verifizieren, nachdem ein tatsächlicher Restore-Drill durchgeführt und das Ergebnis dokumentiert wurde.',
  real_invite_delivery: 'Wird automatisch grün, sobald ein real eingeladener Kundenaccount die Einladung über eine echte Mailbox erfolgreich einlöst.',
  real_magic_link_login: 'Wird automatisch anhand der validierten Supabase-Session und der E-Mail-Auth-Methode verifiziert.',
  leaked_password_protection: 'Von der Administration bestätigt; der Status stammt nicht aus einer frei manipulierbaren Browser-Checkbox.',
}
const nextSteps = {
  leaked_password_protection: {
    title: 'Leaked Password Protection bestätigen',
    text: 'Die Schutzfunktion muss im Supabase-Dashboard aktiv sein und belastbar dokumentiert werden.',
  },
  custom_smtp: {
    title: 'Als Nächstes: Custom SMTP produktiv konfigurieren',
    text: 'Im Supabase-Dashboard SMTP-Host, Port, Nutzer, Passwort, Absender und Absendername setzen. SPF/DKIM/DMARC prüfen, Site URL und erlaubte Redirect-URLs auf die produktive SYMMEDIS-URL begrenzen und Link-Tracking beim Mailprovider deaktivieren, damit Auth-Links nicht verändert werden. Erst danach den konkreten Nachweis hier als Admin verifizieren.',
  },
  real_invite_delivery: {
    title: 'Als Nächstes: echten Kunden-Invite zustellen',
    text: 'Nach verifiziertem SMTP einen echten Kunden über den SYMMEDIS-Invite-Flow an eine kontrollierte reale Mailbox einladen. Keine @example.invalid-Adresse verwenden. Dieses Gate wird nicht manuell gesetzt.',
  },
  real_magic_link_login: {
    title: 'Als Nächstes: realen E-Mail-Login einlösen',
    text: 'Den zugestellten Invite-/Magic-Link in einem frischen Browserfenster öffnen und den Kundenlogin vollständig abschließen. SYMMEDIS verifiziert die Session serverseitig und setzt dieses Gate automatisch.',
  },
  restore_drill: {
    title: 'Als Nächstes: Restore-Drill freigeben und durchführen',
    text: 'Keine kosten- oder betriebsrelevante Restore-Aktion ohne ausdrückliche Freigabe starten. Nach Freigabe das Recovery-Runbook ausführen, Integrität und Storage separat prüfen und erst dann den Nachweis dokumentieren.',
  },
}

export function LaunchReadinessCard() {
  const { accessToken, echteAuthentifizierung, session } = useSession()
  const toast = useToast()
  const [state, setState] = useState({ loading: true, data: null, error: null })
  const [notes, setNotes] = useState({ custom_smtp: '', restore_drill: '' })
  const [savingGate, setSavingGate] = useState(null)

  const load = async () => {
    if (!echteAuthentifizierung || !accessToken) return
    setState((current) => ({ ...current, loading: true, error: null }))
    try {
      const data = await fetchLaunchReadiness(accessToken)
      setState({ loading: false, data, error: null })
    } catch (error) {
      setState({ loading: false, data: null, error: error instanceof Error ? error.message : 'Launch-Gates konnten nicht geladen werden.' })
    }
  }

  useEffect(() => {
    let active = true
    if (!echteAuthentifizierung || !accessToken) {
      setState({ loading: false, data: null, error: null })
      return () => { active = false }
    }
    fetchLaunchReadiness(accessToken)
      .then((data) => { if (active) setState({ loading: false, data, error: null }) })
      .catch((error) => { if (active) setState({ loading: false, data: null, error: error instanceof Error ? error.message : 'Launch-Gates konnten nicht geladen werden.' }) })
    return () => { active = false }
  }, [accessToken, echteAuthentifizierung])

  const orderedGates = useMemo(() => [...(state.data?.gates || [])].sort((a, b) => GATE_ORDER.indexOf(a.key) - GATE_ORDER.indexOf(b.key)), [state.data])
  const openGates = useMemo(() => orderedGates.filter((gate) => gate.passed !== true), [orderedGates])
  const nextGate = openGates[0] || null
  const nextStep = nextGate ? nextSteps[nextGate.key] : null

  const verifyManualGate = async (gateKey) => {
    if (!session?.istAdmin || !session?.organisationId || !session?.userId || savingGate) return
    setSavingGate(gateKey)
    try {
      await saveLaunchGateEvidence(accessToken, session.organisationId, session.userId, gateKey, notes[gateKey])
      setNotes((current) => ({ ...current, [gateKey]: '' }))
      toast.show({ title: 'Launch-Nachweis verifiziert', description: gateKey === 'custom_smtp' ? 'SMTP/Absender-Konfiguration ist dokumentiert.' : 'Restore-Drill ist dokumentiert.', variant: 'success' })
      await load()
    } catch (error) {
      toast.show({ title: 'Nachweis nicht gespeichert', description: error instanceof Error ? error.message : 'Bitte erneut versuchen.', variant: 'danger' })
    } finally {
      setSavingGate(null)
    }
  }

  if (!echteAuthentifizierung) return null

  const data = state.data
  return <Card className="border-brand-border">
    <CardHeader title="Reale Launch-Nachweise" subtitle="Externe Produktionsgates werden nur mit tatsächlich dokumentierter Evidenz grün." icon={IconShield} action={<Chip toneName={data?.ready ? 'ok' : 'warn'}>{data ? `${data.verifiedCount}/${data.totalCount}` : '…'} nachgewiesen</Chip>} />
    <CardBody className="space-y-4">
      {state.loading ? <p className="text-sm text-ink-3">Launch-Nachweise werden geladen …</p> : null}
      {state.error ? <Banner toneName="warn" icon={IconClock} title="Launch-Nachweise nicht verfügbar">{state.error}</Banner> : null}
      {data ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{orderedGates.map((gate) => {
        const passed = gate.passed === true
        const manual = MANUAL_GATES.has(gate.key)
        return <div key={gate.key} className="rounded-xl border border-line bg-surface p-4">
          <div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-ink">{gate.label}</p><Chip size="sm" toneName={passed ? 'ok' : 'neutral'} icon={passed ? IconCheck : IconClock}>{passed ? (gate.status === 'verified' ? 'Verifiziert' : 'Bestätigt') : 'Offen'}</Chip></div>
          <p className="mt-2 text-xs leading-relaxed text-ink-3">{gate.evidenceNote || guidance[gate.key] || 'Noch kein belastbarer Nachweis dokumentiert.'}</p>
          {!passed && manual && session?.istAdmin ? <div className="mt-3 space-y-2 border-t border-line pt-3">
            <Textarea rows={3} maxLength={2000} label="Konkreter Nachweis" value={notes[gate.key]} onChange={(event) => setNotes((current) => ({ ...current, [gate.key]: event.target.value }))} />
            <Button size="sm" fullWidth disabled={savingGate === gate.key || !notes[gate.key].trim()} onClick={() => verifyManualGate(gate.key)}>{savingGate === gate.key ? 'Wird verifiziert …' : 'Nachweis als verifiziert speichern'}</Button>
          </div> : null}
        </div>
      })}</div> : null}
      {data ? <Banner toneName={data.ready ? 'ok' : 'warn'} icon={data.ready ? IconCheck : IconClock} title={data.ready ? 'Externe Launch-Gates vollständig' : nextStep?.title || 'Launch-Gate bleibt geschlossen'}>
        {data.ready ? 'Alle externen Produktionsnachweise sind dokumentiert.' : nextStep?.text || 'Mindestens ein externer Produktionsnachweis ist noch offen.'}
        {!data.ready && openGates.length > 1 ? ` Danach verbleiben ${openGates.length - 1} weitere externe Gate${openGates.length - 1 === 1 ? '' : 's'}.` : ''}
      </Banner> : null}
    </CardBody>
  </Card>
}
