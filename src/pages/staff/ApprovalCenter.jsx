import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { useToast } from '../../hooks/useToast.js'
import { KATEGORIE_MAP } from '../../data/catalog.js'
import { FREIGABE, PRIORITAETEN, scoreStufe } from '../../lib/tone.js'
import { formatDate } from '../../lib/format.js'
import { Button, Chip } from '../../components/ui/primitives.jsx'
import { Card, CardBody, CardHeader, EmptyState, PageHeader, Banner } from '../../components/ui/layout.jsx'
import { Segmented } from '../../components/ui/forms.jsx'
import { ConfirmDialog } from '../../components/ui/overlays.jsx'
import { IconCheckCircle, IconEye, IconLock, IconShield } from '../../components/ui/Icons.jsx'

const STUFEN = ['vorgeschlagen', 'pruefung', 'bearbeitet', 'intern', 'kunde']
const kategorieLabel = (id) => KATEGORIE_MAP[id]?.label || id || 'Unbekannte Dimension'
const prioritaetInfo = (key) => PRIORITAETEN[key] || { label: key || 'Offen', tone: 'neutral' }
const freigabeInfo = (key) => FREIGABE[key] || { label: key || 'Unbekannt', kurz: key || '–', tone: 'neutral' }

export function ApprovalCenter() {
  const { kunden, setFreigabe, freigebenAlle, addAktivitaet } = useWorkspace()
  const toast = useToast()
  const [stufe, setStufe] = useState('offen')
  const [bestaetigung, setBestaetigung] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savingKey, setSavingKey] = useState(null)

  const eintraege = useMemo(() => {
    const alle = kunden.flatMap((kunde) => kunde.analyse.map((eintrag) => ({ ...eintrag, kunde })))
    if (stufe === 'offen') return alle.filter((e) => e.freigabe === 'bearbeitet' || e.freigabe === 'intern')
    if (stufe === 'alle') return alle
    return alle.filter((e) => e.freigabe === stufe)
  }, [kunden, stufe])

  const zaehler = useMemo(() => {
    const alle = kunden.flatMap((kunde) => kunde.analyse)
    return Object.fromEntries(STUFEN.map((key) => [key, alle.filter((e) => e.freigabe === key).length]))
  }, [kunden])

  const offenGesamt = zaehler.bearbeitet + zaehler.intern

  const freigeben = async (eintrag) => {
    const key = `${eintrag.kunde.id}-${eintrag.kategorieId}`
    if (saving || savingKey) return
    setSavingKey(key)
    try {
      const gespeichert = await setFreigabe(eintrag.kunde.id, eintrag.kategorieId, 'kunde')
      if (!gespeichert) {
        toast.show({ title: 'Freigabe nicht gespeichert', description: 'Der vorherige Status wurde wiederhergestellt. Bitte erneut versuchen.', variant: 'danger' })
        return
      }

      const protokolliert = await addAktivitaet(eintrag.kunde.id, {
        titel: `${kategorieLabel(eintrag.kategorieId)} für den Kunden freigegeben`,
        actor: 'SYMMEDIS',
        tone: 'ok',
      })
      toast.show({
        title: 'Freigegeben',
        description: protokolliert === false
          ? `${kategorieLabel(eintrag.kategorieId)} ist im Portal von ${eintrag.kunde.kurz} sichtbar. Der zusätzliche Aktivitätseintrag konnte nicht gespeichert werden.`
          : `${kategorieLabel(eintrag.kategorieId)} ist im Portal von ${eintrag.kunde.kurz} sichtbar.`,
        variant: protokolliert === false ? 'warning' : 'success',
      })
    } catch (error) {
      toast.show({ title: 'Freigabe fehlgeschlagen', description: error instanceof Error ? error.message : 'Die Freigabe konnte nicht gespeichert werden.', variant: 'danger' })
    } finally {
      setSavingKey(null)
    }
  }

  const alleFreigeben = async () => {
    if (saving || savingKey || offenGesamt === 0) return
    setSaving(true)
    try {
      const kandidaten = kunden.map((kunde) => ({
        kunde,
        erwartet: kunde.analyse.filter((item) => item.freigabe === 'intern' || item.freigabe === 'bearbeitet').length,
      })).filter((item) => item.erwartet > 0)

      const ergebnisse = await Promise.all(kandidaten.map(async ({ kunde, erwartet }) => {
        const anzahl = await freigebenAlle(kunde.id)
        if (anzahl > 0) {
          await addAktivitaet(kunde.id, { titel: `${anzahl} Analysepunkte für den Kunden freigegeben`, actor: 'SYMMEDIS', tone: 'ok' })
        }
        return { erwartet, anzahl }
      }))

      const summe = ergebnisse.reduce((total, item) => total + item.anzahl, 0)
      const fehlgeschlagen = ergebnisse.filter((item) => item.anzahl < item.erwartet).length
      if (!summe) {
        toast.show({ title: 'Keine Freigabe gespeichert', description: 'Die Änderungen wurden nicht übernommen. Bitte die betroffenen Projekte einzeln prüfen.', variant: 'danger' })
      } else {
        toast.show({
          title: `${summe} Punkte freigegeben`,
          description: fehlgeschlagen ? `${fehlgeschlagen} Projekt${fehlgeschlagen > 1 ? 'e' : ''} konnte${fehlgeschlagen > 1 ? 'n' : ''} nicht vollständig freigegeben werden.` : 'Alle geprüften Punkte wurden in den jeweiligen Kundenportalen sichtbar.',
          variant: fehlgeschlagen ? 'warning' : 'success',
        })
      }
    } catch (error) {
      toast.show({ title: 'Sammelfreigabe fehlgeschlagen', description: error instanceof Error ? error.message : 'Die Freigaben konnten nicht vollständig verarbeitet werden.', variant: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6" aria-busy={saving}>
      <PageHeader
        title="Freigabezentrum"
        subtitle="Analysepunkte prüfen und für die jeweiligen Kundenportale freigeben. Automatisch wird nichts veröffentlicht."
        actions={<Button size="sm" disabled={offenGesamt === 0 || saving || Boolean(savingKey)} onClick={() => setBestaetigung('alle')}><IconShield className="size-4" />{saving ? 'Freigaben laufen …' : `Alle geprüften freigeben (${offenGesamt})`}</Button>}
      />

      <Banner toneName="warn" icon={IconLock} title="Interne Inhalte">Interne Notizen sind nie Teil einer Freigabe. Sie bleiben im Mitarbeiterportal, auch wenn die zugehörige Dimension für den Kunden sichtbar geschaltet wird.</Banner>

      <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {STUFEN.map((key) => {
          const info = freigabeInfo(key)
          return <Card key={key} className="p-4"><p className="text-xs font-medium text-ink-2">{info.label}</p><p className="tabular mt-1.5 text-2xl font-semibold text-ink">{zaehler[key]}</p><div className="mt-2"><Chip size="sm" toneName={info.tone}>{info.kurz}</Chip></div></Card>
        })}
      </div>

      <Card>
        <CardHeader title="Analysepunkte" subtitle={`${eintraege.length} Einträge in der aktuellen Auswahl`} action={<Segmented size="sm" label="Freigabestand filtern" value={stufe} onChange={setStufe} options={[{ value: 'offen', label: 'Zu prüfen', count: offenGesamt }, { value: 'kunde', label: 'Freigegeben', count: zaehler.kunde }, { value: 'alle', label: 'Alle' }]} />} />
        <CardBody className="px-0 py-0">
          {eintraege.length === 0 ? (
            <EmptyState icon={IconCheckCircle} title="Nichts zu prüfen" description={stufe === 'offen' ? 'Aktuell wartet kein geprüfter Analysepunkt auf Kundenfreigabe.' : 'In dieser Auswahl gibt es keine Analysepunkte.'} />
          ) : (
            <ul className="divide-y divide-line">
              {eintraege.map((eintrag) => {
                const bewertung = scoreStufe(eintrag.score)
                const prio = prioritaetInfo(eintrag.prioritaet)
                const freigabe = freigabeInfo(eintrag.freigabe)
                const key = `${eintrag.kunde.id}-${eintrag.kategorieId}`
                const rowSaving = savingKey === key
                return (
                  <li key={key} className="flex flex-col gap-3 px-4 py-4 sm:px-5 lg:flex-row lg:items-start" aria-busy={rowSaving}>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link to={`/intern/kunden/${eintrag.kunde.id}`} className="text-[0.8125rem] font-semibold text-brand-ink hover:underline">{eintrag.kunde.kurz}</Link>
                        <span aria-hidden="true" className="text-ink-3">·</span>
                        <span className="text-[0.875rem] font-medium text-ink">{kategorieLabel(eintrag.kategorieId)}</span>
                      </div>
                      <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-2">{eintrag.beobachtung || 'Noch keine Beobachtung dokumentiert.'}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Chip size="sm" toneName={bewertung.tone}>Score {eintrag.score} · {bewertung.label}</Chip>
                        <Chip size="sm" toneName={prio.tone}>Priorität {prio.label}</Chip>
                        <Chip size="sm" toneName={freigabe.tone} icon={eintrag.sichtbarKunde ? IconEye : undefined}>{freigabe.label}</Chip>
                        {eintrag.internNotiz ? <Chip size="sm" toneName="warn" icon={IconLock}>Interne Notiz vorhanden</Chip> : null}
                        <span className="text-xs text-ink-3">Ergebnistermin {formatDate(eintrag.kunde.ergebnis)}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button as={Link} to={`/intern/kunden/${eintrag.kunde.id}`} variant="secondary" size="sm">Prüfen</Button>
                      {eintrag.freigabe !== 'kunde' ? <Button size="sm" disabled={saving || Boolean(savingKey)} onClick={() => setBestaetigung(eintrag)}>{rowSaving ? 'Speichert …' : 'Freigeben'}</Button> : null}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardBody>
      </Card>

      <ConfirmDialog
        open={Boolean(bestaetigung)}
        onClose={() => setBestaetigung(null)}
        onConfirm={() => {
          if (bestaetigung === 'alle') void alleFreigeben()
          else if (bestaetigung) void freigeben(bestaetigung)
        }}
        confirmLabel="Freigeben"
        title="Für Kunden freigeben?"
        description={bestaetigung === 'alle' ? `${offenGesamt} geprüfte Analysepunkte werden in den jeweiligen Kundenportalen sichtbar. Interne Notizen bleiben davon unberührt.` : bestaetigung ? `„${kategorieLabel(bestaetigung.kategorieId)}“ wird im Portal von ${bestaetigung.kunde?.kurz} sichtbar. Interne Notizen werden nicht übertragen.` : ''}
      />
    </div>
  )
}
