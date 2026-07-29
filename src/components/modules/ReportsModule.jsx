import { KATEGORIE_MAP } from '../../data/catalog.js'
import { formatDate } from '../../lib/format.js'
import { scoreStufe } from '../../lib/tone.js'
import { useToast } from '../../hooks/useToast.js'
import { Button, Chip } from '../ui/primitives.jsx'
import { Card, CardBody, CardHeader, Banner } from '../ui/layout.jsx'
import { DataTable, KeyValueList } from '../ui/data.jsx'
import { IconDocument, IconDownload, IconLock, IconShield } from '../ui/Icons.jsx'

/** Baut aus dem Projektstand eine CSV-Zeilenliste der freigegebenen Analyse. */
function analyseCsv(kunde, nurFreigegeben) {
  const kopf = ['Dimension', 'Score', 'Stufe', 'Priorität', 'Beobachtung', 'Empfehlung', 'Beleg']
  const zeilen = kunde.analyse
    .filter((a) => !nurFreigegeben || a.sichtbarKunde)
    .map((a) => [
      KATEGORIE_MAP[a.kategorieId].label,
      a.score,
      scoreStufe(a.score).label,
      a.prioritaet,
      a.beobachtung,
      a.empfehlung,
      a.beleg,
    ])
  return [kopf, ...zeilen]
    .map((zeile) => zeile.map((feld) => `"${String(feld).replaceAll('"', '""')}"`).join(';'))
    .join('\n')
}

/**
 * Berichte und Export.
 *
 * Der Export erzeugt die Datei im Browser aus dem aktuellen Projektstand –
 * ohne Serveraufruf. Interne Notizen sind nie Teil des Exports.
 */
export function ReportsModule({ kunde, rolle = 'kunde' }) {
  const toast = useToast()
  const nurFreigegeben = rolle === 'kunde'

  const exportieren = () => {
    const inhalt = analyseCsv(kunde, nurFreigegeben)
    // BOM voranstellen, sonst zeigt Excel Umlaute falsch an.
    const blob = new Blob([`\uFEFF${inhalt}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `symmedis-analyse-${kunde.id}.csv`
    document.body.append(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    toast.show({
      title: 'CSV erstellt',
      description: nurFreigegeben
        ? 'Enthält alle für Sie freigegebenen Analysepunkte.'
        : 'Enthält alle Analysepunkte ohne interne Notizen.',
      variant: 'success',
    })
  }

  const verfuegbar = kunde.berichte.filter((b) => !nurFreigegeben || b.stand === 'final')

  const spalten = [
    {
      key: 'titel',
      label: 'Bericht',
      render: (b) => (
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-muted text-ink-2">
            <IconDocument className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium text-ink">{b.titel}</span>
            <span className="block text-xs text-ink-3">
              {b.typ} · {b.seiten} Seiten
            </span>
          </span>
        </span>
      ),
    },
    { key: 'autor', label: 'Erstellt von', hideBelow: 'lg', render: (b) => <span className="text-ink-2">{b.autor}</span> },
    {
      key: 'stand',
      label: 'Stand',
      render: (b) => (
        <Chip size="sm" toneName={b.stand === 'final' ? 'ok' : 'warn'}>
          {b.stand === 'final' ? 'Freigegeben' : 'Entwurf'}
        </Chip>
      ),
    },
    {
      key: 'datum',
      label: 'Datum',
      hideBelow: 'md',
      align: 'right',
      render: (b) => <span className="text-ink-2">{formatDate(b.datum)}</span>,
    },
    {
      key: 'aktion',
      label: '',
      align: 'right',
      render: (b) => (
        <Button
          variant="ghost"
          size="xs"
          onClick={() =>
            toast.show({
              title: 'Demo-Hinweis',
              description: `„${b.titel}“ ist ein Demo-Eintrag. Als Datei steht der CSV-Export der Analyse bereit.`,
            })
          }
        >
          <IconDownload className="size-3.5" />
          PDF
        </Button>
      ),
    },
  ]

  return (
    <div className="min-w-0 space-y-5">
      {rolle === 'kunde' && kunde.berichte.some((b) => b.stand !== 'final') ? (
        <Banner toneName="info" icon={IconLock} title="Berichte in Arbeit">
          {kunde.berichte.filter((b) => b.stand !== 'final').length} Bericht(e) befinden sich noch in
          der internen Prüfung und erscheinen hier nach der Freigabe.
        </Banner>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <Card>
          <CardHeader
            title="Berichte"
            subtitle={`${verfuegbar.length} von ${kunde.berichte.length} Dokumenten`}
          />
          <DataTable
            caption="Berichte des Projekts"
            columns={spalten}
            rows={verfuegbar}
            getKey={(b) => b.id}
            renderCard={(b) => (
              <div>
                <p className="text-[0.8125rem] font-medium text-ink">{b.titel}</p>
                <p className="mt-0.5 text-xs text-ink-3">
                  {b.typ} · {b.seiten} Seiten · {formatDate(b.datum)}
                </p>
                <div className="mt-1.5">
                  <Chip size="sm" toneName={b.stand === 'final' ? 'ok' : 'warn'}>
                    {b.stand === 'final' ? 'Freigegeben' : 'Entwurf'}
                  </Chip>
                </div>
              </div>
            )}
          />
        </Card>

        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader title="Export" subtitle="Aus dem aktuellen Projektstand" />
            <CardBody className="space-y-3">
              <p className="text-[0.8125rem] leading-relaxed text-ink-2">
                Der CSV-Export enthält alle{' '}
                {nurFreigegeben ? 'für Sie freigegebenen ' : ''}Analysedimensionen mit Score,
                Bewertungsstufe, Priorität, Beobachtung, Empfehlung und Beleg.
              </p>
              <Button fullWidth onClick={exportieren}>
                <IconDownload className="size-4" />
                Analyse als CSV exportieren
              </Button>
              <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-3">
                <IconShield className="mt-0.5 size-3.5 shrink-0" />
                Interne Notizen des SYMMEDIS-Teams sind nie Bestandteil eines Exports.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Projektdaten" />
            <CardBody>
              <KeyValueList
                items={[
                  { label: 'Unternehmen', value: kunde.unternehmen },
                  { label: 'Branche', value: kunde.branche },
                  { label: 'Analysestart', value: formatDate(kunde.start) },
                  { label: 'Ergebnistermin', value: formatDate(kunde.ergebnis) },
                  { label: 'Gesamtreifegrad', value: `${kunde.gesamtScore} / 100` },
                ]}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
