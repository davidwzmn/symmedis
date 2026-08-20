import { useEffect, useState } from 'react'
import { useSession } from '../../hooks/useSession.js'
import { fetchLaunchReadiness } from '../../lib/launchReadinessApi.js'
import { Chip } from '../ui/primitives.jsx'
import { Banner, Card, CardBody, CardHeader } from '../ui/layout.jsx'
import { IconCheck, IconClock, IconShield } from '../ui/Icons.jsx'

export function LaunchReadinessCard() {
  const { accessToken, echteAuthentifizierung } = useSession()
  const [state, setState] = useState({ loading: true, data: null, error: null })

  useEffect(() => {
    let active = true
    if (!echteAuthentifizierung || !accessToken) {
      setState({ loading: false, data: null, error: null })
      return () => { active = false }
    }
    setState({ loading: true, data: null, error: null })
    fetchLaunchReadiness(accessToken)
      .then((data) => { if (active) setState({ loading: false, data, error: null }) })
      .catch((error) => { if (active) setState({ loading: false, data: null, error: error instanceof Error ? error.message : 'Launch-Gates konnten nicht geladen werden.' }) })
    return () => { active = false }
  }, [accessToken, echteAuthentifizierung])

  if (!echteAuthentifizierung) return null

  const data = state.data
  return <Card className="border-brand-border">
    <CardHeader title="Reale Launch-Nachweise" subtitle="Externe Produktionsgates werden nur mit tatsächlich dokumentierter Evidenz grün." icon={IconShield} action={<Chip toneName={data?.ready ? 'ok' : 'warn'}>{data ? `${data.verifiedCount}/${data.totalCount}` : '…'} nachgewiesen</Chip>} />
    <CardBody className="space-y-4">
      {state.loading ? <p className="text-sm text-ink-3">Launch-Nachweise werden geladen …</p> : null}
      {state.error ? <Banner toneName="warn" icon={IconClock} title="Launch-Nachweise nicht verfügbar">{state.error}</Banner> : null}
      {data ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{(data.gates || []).map((gate) => {
        const passed = gate.status === 'confirmed' || gate.status === 'verified'
        return <div key={gate.key} className="rounded-xl border border-line bg-surface p-4"><div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-ink">{gate.label}</p><Chip size="sm" toneName={passed ? 'ok' : 'neutral'} icon={passed ? IconCheck : IconClock}>{passed ? (gate.status === 'verified' ? 'Verifiziert' : 'Bestätigt') : 'Offen'}</Chip></div>{gate.evidenceNote ? <p className="mt-2 text-xs leading-relaxed text-ink-3">{gate.evidenceNote}</p> : <p className="mt-2 text-xs leading-relaxed text-ink-3">Noch kein belastbarer Nachweis dokumentiert.</p>}</div>
      })}</div> : null}
      {data ? <Banner toneName={data.ready ? 'ok' : 'warn'} icon={data.ready ? IconCheck : IconClock} title={data.ready ? 'Externe Launch-Gates vollständig' : 'Launch-Gate bleibt geschlossen'}>{data.ready ? 'Alle externen Produktionsnachweise sind dokumentiert.' : 'Custom SMTP, reale Invite-Zustellung, realer Magic-Link-Login und Restore-Drill bleiben offen, bis echte Nachweise vorliegen.'}</Banner> : null}
    </CardBody>
  </Card>
}
