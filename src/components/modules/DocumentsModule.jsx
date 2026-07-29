import { useMemo, useRef, useState } from 'react'
import { DOKUMENT_TYPEN } from '../../data/catalog.js'
import { formatBytes, formatDate } from '../../lib/format.js'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { useToast } from '../../hooks/useToast.js'
import { Button, Chip } from '../ui/primitives.jsx'
import { Card, CardBody, CardHeader, EmptyState, Banner } from '../ui/layout.jsx'
import { DataTable } from '../ui/data.jsx'
import { SearchInput, Segmented } from '../ui/forms.jsx'
import {
  IconDocument,
  IconDownload,
  IconFolder,
  IconHistory,
  IconShield,
  IconUpload,
} from '../ui/Icons.jsx'

const ENDUNG_TYP = {
  pdf: 'pdf',
  doc: 'docx',
  docx: 'docx',
  xls: 'xlsx',
  xlsx: 'xlsx',
  csv: 'xlsx',
  ppt: 'pptx',
  pptx: 'pptx',
  png: 'bild',
  jpg: 'bild',
  jpeg: 'bild',
}

/**
 * Dokumentenbereich mit Versionsstand.
 *
 * Der Upload legt bewusst nur einen Eintrag im Arbeitsspeicher an – es findet
 * keine Übertragung statt. Das ist in der Oberfläche ausgewiesen.
 */
export function DocumentsModule({ kunde, rolle = 'kunde' }) {
  const { addDokument } = useWorkspace()
  const toast = useToast()
  const [filter, setFilter] = useState('alle')
  const [suche, setSuche] = useState('')
  const inputRef = useRef(null)

  const hochladen = rolle !== 'demo'
  const quelle = rolle === 'intern' ? 'symmedis' : 'kunde'

  const gefiltert = useMemo(() => {
    const q = suche.trim().toLowerCase()
    return kunde.dokumente.filter((dokument) => {
      if (filter === 'kunde' && dokument.von !== 'kunde') return false
      if (filter === 'symmedis' && dokument.von !== 'symmedis') return false
      if (filter === 'neu' && dokument.status !== 'neu') return false
      if (q && !dokument.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [kunde.dokumente, filter, suche])

  const aufnehmen = (dateien) => {
    Array.from(dateien).forEach((datei) => {
      const endung = datei.name.split('.').pop()?.toLowerCase() ?? ''
      addDokument(kunde.id, {
        name: datei.name,
        typ: ENDUNG_TYP[endung] ?? 'pdf',
        groesse: datei.size,
        von: quelle,
      })
    })
    toast.show({
      title: `${dateien.length} Datei${dateien.length > 1 ? 'en' : ''} aufgenommen`,
      description: 'Demo: Die Datei wird nicht übertragen, nur der Eintrag entsteht lokal.',
      variant: 'success',
    })
  }

  const spalten = [
    {
      key: 'name',
      label: 'Dokument',
      render: (d) => (
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-muted text-ink-2">
            <IconDocument className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium text-ink">{d.name}</span>
            <span className="block text-xs text-ink-3">
              {DOKUMENT_TYPEN[d.typ]?.label ?? d.typ} · {formatBytes(d.groesse)}
            </span>
          </span>
        </span>
      ),
    },
    {
      key: 'von',
      label: 'Quelle',
      hideBelow: 'lg',
      render: (d) => (
        <Chip size="sm" toneName={d.von === 'kunde' ? 'brand' : 'accent'}>
          {d.von === 'kunde' ? kunde.kurz : 'SYMMEDIS'}
        </Chip>
      ),
    },
    {
      key: 'version',
      label: 'Version',
      hideBelow: 'lg',
      render: (d) => (
        <span className="inline-flex items-center gap-1.5 text-ink-2">
          <IconHistory className="size-3.5 text-ink-3" />
          v{d.version}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (d) => (
        <Chip size="sm" toneName={d.status === 'geprueft' ? 'ok' : 'info'}>
          {d.status === 'geprueft' ? 'Gesichtet' : 'Neu'}
        </Chip>
      ),
    },
    {
      key: 'datum',
      label: 'Hochgeladen',
      hideBelow: 'md',
      align: 'right',
      render: (d) => <span className="text-ink-2">{formatDate(d.hochgeladen)}</span>,
    },
    {
      key: 'aktion',
      label: '',
      align: 'right',
      render: (d) => (
        <Button
          variant="ghost"
          size="xs"
          onClick={() =>
            toast.show({
              title: 'Demo-Hinweis',
              description: `„${d.name}“ ist ein Demo-Eintrag ohne hinterlegte Datei.`,
            })
          }
        >
          <IconDownload className="size-3.5" />
          Laden
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <Banner toneName="neutral" icon={IconShield} title="Hinweis zur Demo">
        Dateien werden in dieser Demo nicht übertragen und nicht gespeichert. Beim Hochladen
        entsteht ausschließlich ein Eintrag im Arbeitsspeicher dieser Sitzung.
      </Banner>

      {hochladen ? (
        <Card>
          <CardBody>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                if (e.dataTransfer.files.length) aufnehmen(e.dataTransfer.files)
              }}
              className="flex flex-col items-center rounded-lg border border-dashed border-line-strong px-6 py-8 text-center"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                <IconUpload className="size-5" />
              </span>
              <p className="mt-3 text-sm font-semibold text-ink">Unterlagen hinzufügen</p>
              <p className="mt-1 max-w-md text-[0.8125rem] leading-relaxed text-ink-2">
                Vertriebspräsentationen, Produktkataloge, Studien und Website-Exporte. Ziehen Sie
                Dateien hierher oder wählen Sie sie aus.
              </p>
              <input
                ref={inputRef}
                type="file"
                multiple
                className="sr-only"
                onChange={(e) => {
                  if (e.target.files?.length) aufnehmen(e.target.files)
                  e.target.value = ''
                }}
              />
              <Button className="mt-4" size="sm" onClick={() => inputRef.current?.click()}>
                Dateien auswählen
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader
          title="Dokumente"
          subtitle={`${gefiltert.length} von ${kunde.dokumente.length} Einträgen`}
          icon={IconFolder}
        />
        <CardBody className="space-y-4 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Segmented
              label="Dokumente filtern"
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'alle', label: 'Alle' },
                { value: 'kunde', label: kunde.kurz },
                { value: 'symmedis', label: 'SYMMEDIS' },
                { value: 'neu', label: 'Neu' },
              ]}
            />
            <SearchInput
              value={suche}
              onChange={(e) => setSuche(e.target.value)}
              placeholder="Dokument suchen …"
              label="Dokumente durchsuchen"
              className="sm:w-56"
            />
          </div>
        </CardBody>
        <div className="border-t border-line">
          <DataTable
            caption="Dokumente des Projekts"
            columns={spalten}
            rows={gefiltert}
            getKey={(d) => d.id}
            empty={
              <EmptyState
                icon={IconFolder}
                title="Keine Dokumente in dieser Auswahl"
                description="Setzen Sie den Filter zurück oder laden Sie Unterlagen hoch."
              />
            }
            renderCard={(d) => (
              <div className="flex items-start gap-3">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-muted text-ink-2">
                  <IconDocument className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.8125rem] font-medium text-ink">{d.name}</p>
                  <p className="mt-0.5 text-xs text-ink-3">
                    {DOKUMENT_TYPEN[d.typ]?.label ?? d.typ} · {formatBytes(d.groesse)} · v{d.version}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Chip size="sm" toneName={d.von === 'kunde' ? 'brand' : 'accent'}>
                      {d.von === 'kunde' ? kunde.kurz : 'SYMMEDIS'}
                    </Chip>
                    <Chip size="sm" toneName={d.status === 'geprueft' ? 'ok' : 'info'}>
                      {d.status === 'geprueft' ? 'Gesichtet' : 'Neu'}
                    </Chip>
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      </Card>
    </div>
  )
}
