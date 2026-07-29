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

/**
 * Freigabezentrum.
 *
 * Zentrale Stelle für den Übergang „intern geprüft“ → „für Kunden sichtbar“.
 * Nichts wird automatisch veröffentlicht; jede Freigabe ist eine bewusste
 * Handlung und wird im Prüfpfad festgehalten.
 */
export function ApprovalCenter() {
  const { kunden, setFreigabe, freigebenAlle, addAktivitaet } = useWorkspace()
  const toast = useToast()
  const [stufe, setStufe] = useState('offen')
  const [bestaetigung, setBestaetigung] = useState(null)

  const eintraege = useMemo(() => {
    const alle = kunden.flatMap((kunde) =>
      kunde.analyse.map((eintrag) => ({ ...eintrag, kunde })),
    )
    if (stufe === 'offen') {
      return alle.filter((e) => e.freigabe === 'bearbeitet' || e.freigabe === 'intern')
    }
    if (stufe === 'alle') return alle
    return alle.filter((e) => e.freigabe === stufe)
  }, [kunden, stufe])

  const zaehler = useMemo(() => {
    const alle = kunden.flatMap((kunde) => kunde.analyse)
    return Object.fromEntries(
      STUFEN.map((key) => [key, alle.filter((e) => e.freigabe === key).length]),
    )
  }, [kunden])

  const offenGesamt = zaehler.bearbeitet + zaehler.intern

  const freigeben = (eintrag) => {
    setFreigabe(eintrag.kunde.id, eintrag.kategorieId, 'kunde')
    addAktivitaet(eintrag.kunde.id, {
      titel: `${KATEGORIE_MAP[eintrag.kategorieId].label} für den Kunden freigegeben`,
      actor: 'SYMMEDIS',
      tone: 'ok',
    })
    toast.show({
      title: 'Freigegeben',
      description: `${KATEGORIE_MAP[eintrag.kategorieId].label} ist im Portal von ${eintrag.kunde.kurz} sichtbar.`,
      variant: 'success',
    })
  }

  const alleFreigeben = () => {
    let summe = 0
    for (const kunde of kunden) {
      const anzahl = freigebenAlle(kunde.id)
      if (anzahl > 0) {
        summe += anzahl
        addAktivitaet(kunde.id, {
          titel: `${anzahl} Analysepunkte für den Kunden freigegeben`,
          actor: 'SYMMEDIS',
          tone: 'ok',
        })
      }
    }
    toast.show({
      title: `${summe} Punkte freigegeben`,
      description: 'Über alle Projekte hinweg.',
      variant: 'success',
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Freigabezentrum"
        subtitle="Analysepunkte prüfen und für die jeweiligen Kundenportale freigeben. Automatisch wird nichts veröffentlicht."
        actions={
          <Button size="sm" disabled={offenGesamt === 0} onClick={() => setBestaetigung('alle')}>
            <IconShield className="size-4" />
            Alle geprüften freigeben ({offenGesamt})
          </Button>
        }
      />

      <Banner toneName="warn" icon={IconLock} title="Interne Inhalte">
        Interne Notizen sind nie Teil einer Freigabe. Sie bleiben im Mitarbeiterportal, auch wenn
        die zugehörige Dimension für den Kunden sichtbar geschaltet wird.
      </Banner>

      <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {STUFEN.map((key) => (
          <Card key={key} className="p-4">
            <p className="text-xs font-medium text-ink-2">{FREIGABE[key].label}</p>
            <p className="tabular mt-1.5 text-2xl font-semibold text-ink">{zaehler[key]}</p>
            <div className="mt-2">
              <Chip size="sm" toneName={FREIGABE[key].tone}>
                {FREIGABE[key].kurz}
              </Chip>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Analysepunkte"
          subtitle={`${eintraege.length} Einträge in der aktuellen Auswahl`}
          action={
            <Segmented
              size="sm"
              label="Freigabestand filtern"
              value={stufe}
              onChange={setStufe}
              options={[
                { value: 'offen', label: 'Zu prüfen', count: offenGesamt },
                { value: 'kunde', label: 'Freigegeben', count: zaehler.kunde },
                { value: 'alle', label: 'Alle' },
              ]}
            />
          }
        />
        <CardBody className="px-0 py-0">
          {eintraege.length === 0 ? (
            <EmptyState
              icon={IconCheckCircle}
              title="Nichts zu prüfen"
              description="Alle Bewertungen in dieser Auswahl sind bearbeitet."
            />
          ) : (
            <ul className="divide-y divide-line">
              {eintraege.map((eintrag) => {
                const kategorie = KATEGORIE_MAP[eintrag.kategorieId]
                const bewertung = scoreStufe(eintrag.score)
                return (
                  <li
                    key={`${eintrag.kunde.id}-${eintrag.kategorieId}`}
                    className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-start sm:px-5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/intern/kunden/${eintrag.kunde.id}`}
                          className="text-[0.8125rem] font-semibold text-brand-ink hover:underline"
                        >
                          {eintrag.kunde.kurz}
                        </Link>
                        <span aria-hidden="true" className="text-ink-3">
                          ·
                        </span>
                        <span className="text-[0.875rem] font-medium text-ink">
                          {kategorie.label}
                        </span>
                      </div>

                      <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-2">
                        {eintrag.beobachtung}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Chip size="sm" toneName={bewertung.tone}>
                          Score {eintrag.score} · {bewertung.label}
                        </Chip>
                        <Chip size="sm" toneName={PRIORITAETEN[eintrag.prioritaet].tone}>
                          Priorität {PRIORITAETEN[eintrag.prioritaet].label}
                        </Chip>
                        <Chip
                          size="sm"
                          toneName={FREIGABE[eintrag.freigabe].tone}
                          icon={eintrag.sichtbarKunde ? IconEye : undefined}
                        >
                          {FREIGABE[eintrag.freigabe].label}
                        </Chip>
                        {eintrag.internNotiz ? (
                          <Chip size="sm" toneName="warn" icon={IconLock}>
                            Interne Notiz vorhanden
                          </Chip>
                        ) : null}
                        <span className="text-xs text-ink-3">
                          Ergebnistermin {formatDate(eintrag.kunde.ergebnis)}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        as={Link}
                        to={`/intern/kunden/${eintrag.kunde.id}`}
                        variant="secondary"
                        size="sm"
                      >
                        Prüfen
                      </Button>
                      {eintrag.freigabe !== 'kunde' ? (
                        <Button size="sm" onClick={() => setBestaetigung(eintrag)}>
                          Freigeben
                        </Button>
                      ) : null}
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
          if (bestaetigung === 'alle') alleFreigeben()
          else if (bestaetigung) freigeben(bestaetigung)
        }}
        confirmLabel="Freigeben"
        title="Für Kunden freigeben?"
        description={
          bestaetigung === 'alle'
            ? `${offenGesamt} geprüfte Analysepunkte werden in den jeweiligen Kundenportalen sichtbar. Interne Notizen bleiben davon unberührt.`
            : bestaetigung
              ? `„${KATEGORIE_MAP[bestaetigung.kategorieId]?.label}“ wird im Portal von ${bestaetigung.kunde?.kurz} sichtbar. Interne Notizen werden nicht übertragen.`
              : ''
        }
      />
    </div>
  )
}
