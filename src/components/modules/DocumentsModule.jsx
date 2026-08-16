import { useMemo, useRef, useState } from 'react'
import { DOKUMENT_TYPEN } from '../../data/catalog.js'
import { formatBytes, formatDate } from '../../lib/format.js'
import { downloadProjectFile } from '../../lib/supabase.js'
import { searchProjectEvidence } from '../../lib/workspaceApi.js'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { useSession } from '../../hooks/useSession.js'
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
  pdf: 'pdf', doc: 'docx', docx: 'docx', xls: 'xlsx', xlsx: 'xlsx', csv: 'xlsx',
  ppt: 'pptx', pptx: 'pptx', png: 'bild', jpg: 'bild', jpeg: 'bild', txt: 'txt',
}

export function DocumentsModule({ kunde, rolle = 'kunde' }) {
  const { addDokument, echteDaten } = useWorkspace()
  const { accessToken } = useSession()
  const toast = useToast()
  const [filter, setFilter] = useState('alle')
  const [suche, setSuche] = useState('')
  const [uploading, setUploading] = useState(false)
  const [evidenceQuery, setEvidenceQuery] = useState('')
  const [evidenceResults, setEvidenceResults] = useState([])
  const [evidenceLoading, setEvidenceLoading] = useState(false)
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

  const hochladenDateien = async (dateien) => {
    const files = Array.from(dateien)
    if (!files.length) return
    setUploading(true)
    try {
      await Promise.all(files.map((datei) => {
        const endung = datei.name.split('.').pop()?.toLowerCase() ?? ''
        return addDokument(kunde.id, {
          name: datei.name,
          typ: (ENDUNG_TYP[endung] ?? endung) || 'datei',
          groesse: datei.size,
          von: quelle,
        }, datei)
      }))
      toast.show({
        title: `${files.length} Datei${files.length > 1 ? 'en' : ''} ${echteDaten ? 'hochgeladen' : 'aufgenommen'}`,
        description: echteDaten ? 'Die Unterlagen wurden im privaten Projektbereich gespeichert.' : 'Demo: Es entstand nur ein lokaler Eintrag.',
        variant: 'success',
      })
    } catch (error) {
      toast.show({ title: 'Upload fehlgeschlagen', description: error instanceof Error ? error.message : 'Datei konnte nicht gespeichert werden.', variant: 'danger' })
    } finally {
      setUploading(false)
    }
  }

  const laden = async (dokument) => {
    if (!echteDaten || !dokument.storagePath || !accessToken) {
      toast.show({ title: 'Demo-Hinweis', description: `„${dokument.name}“ ist ein Demo-Eintrag ohne hinterlegte Datei.` })
      return
    }
    try {
      const blob = await downloadProjectFile(accessToken, dokument.storagePath)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = dokument.name
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.show({ title: 'Download fehlgeschlagen', description: error instanceof Error ? error.message : 'Datei konnte nicht geladen werden.', variant: 'danger' })
    }
  }

  const evidenceSuchen = async () => {
    const query = evidenceQuery.trim()
    if (query.length < 2 || !echteDaten || !accessToken || !kunde.projectId) return
    setEvidenceLoading(true)
    try {
      const rows = await searchProjectEvidence(accessToken, kunde.projectId, query, 8)
      setEvidenceResults(rows || [])
    } catch (error) {
      toast.show({ title: 'Evidenzsuche fehlgeschlagen', description: error instanceof Error ? error.message : 'Suche konnte nicht ausgeführt werden.', variant: 'danger' })
    } finally {
      setEvidenceLoading(false)
    }
  }

  const spalten = [
    {
      key: 'name', label: 'Dokument', render: (d) => (
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-muted text-ink-2"><IconDocument className="size-4" /></span>
          <span className="min-w-0">
            <span className="block truncate font-medium text-ink">{d.name}</span>
            <span className="block text-xs text-ink-3">{DOKUMENT_TYPEN[d.typ]?.label ?? d.typ} · {formatBytes(d.groesse)}</span>
          </span>
        </span>
      ),
    },
    { key: 'von', label: 'Quelle', hideBelow: 'lg', render: (d) => <Chip size="sm" toneName={d.von === 'kunde' ? 'brand' : 'accent'}>{d.von === 'kunde' ? kunde.kurz : 'SYMMEDIS'}</Chip> },
    { key: 'version', label: 'Version', hideBelow: 'lg', render: (d) => <span className="inline-flex items-center gap-1.5 text-ink-2"><IconHistory className="size-3.5 text-ink-3" />v{d.version}</span> },
    { key: 'status', label: 'Status', render: (d) => <Chip size="sm" toneName={d.status === 'geprueft' ? 'ok' : 'info'}>{d.status === 'geprueft' ? 'Gesichtet' : 'Neu'}</Chip> },
    { key: 'datum', label: 'Hochgeladen', hideBelow: 'md', align: 'right', render: (d) => <span className="text-ink-2">{formatDate(d.hochgeladen)}</span> },
    { key: 'aktion', label: '', align: 'right', render: (d) => <Button variant="ghost" size="xs" onClick={() => laden(d)}><IconDownload className="size-3.5" />Laden</Button> },
  ]

  return (
    <div className="space-y-5">
      <Banner toneName={echteDaten ? 'info' : 'neutral'} icon={IconShield} title={echteDaten ? 'Privater Projekt-Speicher' : 'Hinweis zur Demo'}>
        {echteDaten
          ? 'Dateien werden im privaten SYMMEDIS-Projektbereich gespeichert. Zugriff erhalten ausschließlich autorisierte Personen dieses Mandanten und das SYMMEDIS-Team.'
          : 'Dateien werden in dieser Demo nicht übertragen und nicht gespeichert. Beim Hochladen entsteht ausschließlich ein Eintrag im Arbeitsspeicher dieser Sitzung.'}
      </Banner>

      {rolle === 'intern' && echteDaten ? (
        <Card>
          <CardHeader title="Frag SYMMEDIS" subtitle="Projektweite Evidenzsuche über Analyse-Findings und indexiertes Kundenwissen" icon={IconShield} />
          <CardBody className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <SearchInput
                value={evidenceQuery}
                onChange={(event) => setEvidenceQuery(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') evidenceSuchen() }}
                placeholder="z. B. Warum ist die Conversion schwach?"
                label="Projektwissen durchsuchen"
                className="flex-1"
              />
              <Button onClick={evidenceSuchen} disabled={evidenceLoading || evidenceQuery.trim().length < 2}>
                {evidenceLoading ? 'Suche …' : 'Evidenz suchen'}
              </Button>
            </div>

            {evidenceResults.length ? (
              <div className="space-y-2">
                {evidenceResults.map((result) => (
                  <div key={`${result.source_type}-${result.source_id}`} className="rounded-lg border border-line bg-surface-muted p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip size="sm" toneName={result.source_type === 'finding' ? 'accent' : 'info'}>{result.source_type === 'finding' ? 'Finding' : 'Knowledge'}</Chip>
                      <span className="text-xs font-semibold text-ink-2">{result.source_label}</span>
                      <span className="ml-auto text-xs tabular text-ink-3">Match {Math.round(Number(result.similarity || 0) * 100)}%</span>
                    </div>
                    <p className="mt-2 line-clamp-4 text-[0.8125rem] leading-relaxed text-ink-2">{result.content}</p>
                  </div>
                ))}
              </div>
            ) : evidenceQuery.trim().length >= 2 && !evidenceLoading ? (
              <p className="text-xs text-ink-3">Noch keine Treffer. Findings werden sofort durchsucht; Dokument-Inhalte erscheinen nach Indexierung als zusätzliche Knowledge-Quellen.</p>
            ) : (
              <p className="text-xs text-ink-3">Die Suche respektiert dieselbe Projekt-/Tenant-RLS wie der restliche Workspace und kann keine fremden Kundendaten lesen.</p>
            )}
          </CardBody>
        </Card>
      ) : null}

      {hochladen ? (
        <Card>
          <CardBody>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files.length) hochladenDateien(e.dataTransfer.files) }}
              className="flex flex-col items-center rounded-lg border border-dashed border-line-strong px-6 py-8 text-center"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand-ink"><IconUpload className="size-5" /></span>
              <p className="mt-3 text-sm font-semibold text-ink">Unterlagen hinzufügen</p>
              <p className="mt-1 max-w-md text-[0.8125rem] leading-relaxed text-ink-2">PDF, Word, Excel, PowerPoint, CSV, Text oder Bilder. Maximal 50 MB pro Datei.</p>
              <input ref={inputRef} type="file" multiple accept=".pdf,.docx,.xlsx,.pptx,.csv,.txt,.png,.jpg,.jpeg" className="sr-only" onChange={(e) => { if (e.target.files?.length) hochladenDateien(e.target.files); e.target.value = '' }} />
              <Button className="mt-4" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>{uploading ? 'Upload läuft …' : 'Dateien auswählen'}</Button>
            </div>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader title="Dokumente" subtitle={`${gefiltert.length} von ${kunde.dokumente.length} Einträgen`} icon={IconFolder} />
        <CardBody className="space-y-4 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Segmented label="Dokumente filtern" value={filter} onChange={setFilter} options={[
              { value: 'alle', label: 'Alle' }, { value: 'kunde', label: kunde.kurz }, { value: 'symmedis', label: 'SYMMEDIS' }, { value: 'neu', label: 'Neu' },
            ]} />
            <SearchInput value={suche} onChange={(e) => setSuche(e.target.value)} placeholder="Dokument suchen …" label="Dokumente durchsuchen" className="sm:w-56" />
          </div>
        </CardBody>
        <div className="border-t border-line">
          <DataTable
            caption="Dokumente des Projekts" columns={spalten} rows={gefiltert} getKey={(d) => d.id}
            empty={<EmptyState icon={IconFolder} title="Keine Dokumente in dieser Auswahl" description="Setzen Sie den Filter zurück oder laden Sie Unterlagen hoch." />}
            renderCard={(d) => (
              <div className="flex items-start gap-3">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-muted text-ink-2"><IconDocument className="size-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.8125rem] font-medium text-ink">{d.name}</p>
                  <p className="mt-0.5 text-xs text-ink-3">{DOKUMENT_TYPEN[d.typ]?.label ?? d.typ} · {formatBytes(d.groesse)} · v{d.version}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Chip size="sm" toneName={d.von === 'kunde' ? 'brand' : 'accent'}>{d.von === 'kunde' ? kunde.kurz : 'SYMMEDIS'}</Chip>
                    <Chip size="sm" toneName={d.status === 'geprueft' ? 'ok' : 'info'}>{d.status === 'geprueft' ? 'Gesichtet' : 'Neu'}</Chip>
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
