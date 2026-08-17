import { useMemo, useRef, useState } from 'react'
import { DOKUMENT_TYPEN } from '../../data/catalog.js'
import { formatBytes, formatDate } from '../../lib/format.js'
import { downloadProjectFile } from '../../lib/supabase.js'
import { persistDocumentVisibility, searchProjectEvidence } from '../../lib/workspaceApi.js'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { useSession } from '../../hooks/useSession.js'
import { useToast } from '../../hooks/useToast.js'
import { Button, Chip } from '../ui/primitives.jsx'
import { Card, CardBody, CardHeader, EmptyState, Banner } from '../ui/layout.jsx'
import { DataTable } from '../ui/data.jsx'
import { SearchInput, Segmented } from '../ui/forms.jsx'
import { IconDocument, IconDownload, IconFolder, IconHistory, IconShield, IconUpload } from '../ui/Icons.jsx'

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024
const MAX_OFFICE_INDEX_BYTES = 25 * 1024 * 1024
const OFFICE_ENDUNGEN = new Set(['docx', 'xlsx', 'pptx'])
const ERLAUBTE_ENDUNGEN = new Set(['pdf', 'docx', 'xlsx', 'pptx', 'csv', 'txt', 'png', 'jpg', 'jpeg'])
const ENDUNG_TYP = {
  pdf: 'pdf', docx: 'docx', xlsx: 'xlsx', csv: 'csv',
  pptx: 'pptx', png: 'png', jpg: 'jpg', jpeg: 'jpeg', txt: 'txt',
}
const INDEX_STATUS = {
  indexed: { label: 'Durchsuchbar', tone: 'ok', hint: 'Der Inhalt ist in der projektweiten Evidenzsuche verfügbar.' },
  indexing: { label: 'Wird indexiert', tone: 'info', hint: 'Der Inhalt wird gerade für die Evidenzsuche aufbereitet.' },
  pending: { label: 'Prüfung offen', tone: 'warn', hint: 'Für die Indexierung ist noch ein interner Prüfschritt erforderlich.' },
  unsupported: { label: 'Nur Ablage', tone: 'neutral', hint: 'Die Datei ist sicher gespeichert, wird aber nicht automatisch inhaltlich indexiert.' },
  failed: { label: 'Indexierung prüfen', tone: 'urgent', hint: 'Die Datei ist gespeichert, die inhaltliche Indexierung war jedoch nicht erfolgreich.' },
}

function dateiEndung(datei) {
  return String(datei?.name || '').split('.').pop()?.toLowerCase() ?? ''
}

function uploadFehler(datei) {
  const endung = dateiEndung(datei)
  if (!ERLAUBTE_ENDUNGEN.has(endung)) return 'format'
  if (!Number.isFinite(datei?.size) || datei.size <= 0) return 'leer'
  if (datei.size > MAX_UPLOAD_BYTES) return 'upload-groesse'
  if (OFFICE_ENDUNGEN.has(endung) && datei.size > MAX_OFFICE_INDEX_BYTES) return 'office-groesse'
  return null
}

function ablehnungsText(abgelehnt) {
  const anzahl = (grund) => abgelehnt.filter((item) => item.grund === grund).length
  const teile = []
  const office = anzahl('office-groesse')
  const zuGross = anzahl('upload-groesse')
  const leer = anzahl('leer')
  const format = anzahl('format')
  if (office) teile.push(`${office} Office-${office === 1 ? 'Datei überschreitet' : 'Dateien überschreiten'} die 25-MB-Grenze für die lokale Indexierung.`)
  if (zuGross) teile.push(`${zuGross} ${zuGross === 1 ? 'Datei überschreitet' : 'Dateien überschreiten'} das allgemeine Upload-Limit von 50 MB.`)
  if (leer) teile.push(`${leer} ${leer === 1 ? 'Datei ist leer' : 'Dateien sind leer'}.`)
  if (format) teile.push(`${format} ${format === 1 ? 'Datei hat ein nicht unterstütztes Format' : 'Dateien haben ein nicht unterstütztes Format'}.`)
  return teile.join(' ')
}

function indexStatus(dokument) {
  if (!dokument.indexStatus) return null
  return INDEX_STATUS[dokument.indexStatus] || { label: String(dokument.indexStatus), tone: 'neutral', hint: dokument.indexError || '' }
}

function dokumentTyp(dokument) {
  const typ = String(dokument?.typ || '').toLowerCase()
  return DOKUMENT_TYPEN[typ]?.label || typ.toUpperCase() || 'Datei'
}

export function DocumentsModule({ kunde, rolle = 'kunde' }) {
  const { addDokument, echteDaten, neuLaden } = useWorkspace()
  const { accessToken } = useSession()
  const toast = useToast()
  const [filter, setFilter] = useState('alle')
  const [suche, setSuche] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [visibilitySaving, setVisibilitySaving] = useState(null)
  const [evidenceQuery, setEvidenceQuery] = useState('')
  const [evidenceResults, setEvidenceResults] = useState([])
  const [evidenceLoading, setEvidenceLoading] = useState(false)
  const evidenceRequestRef = useRef(0)
  const inputRef = useRef(null)

  const hochladen = rolle !== 'demo'
  const quelle = rolle === 'intern' ? 'symmedis' : 'kunde'

  const gefiltert = useMemo(() => {
    const q = suche.trim().toLowerCase()
    return kunde.dokumente.filter((dokument) => {
      if (filter === 'kunde' && dokument.von !== 'kunde') return false
      if (filter === 'symmedis' && dokument.von !== 'symmedis') return false
      if (filter === 'sichtbar' && !dokument.sichtbarKunde) return false
      if (filter === 'intern' && dokument.sichtbarKunde) return false
      if (filter === 'neu' && dokument.status !== 'neu') return false
      if (q && !String(dokument.name || '').toLowerCase().includes(q)) return false
      return true
    })
  }, [kunde.dokumente, filter, suche])

  const hochladenDateien = async (dateien) => {
    const files = Array.from(dateien)
    if (!files.length || uploading) return

    const bewertet = files.map((datei) => ({ datei, grund: uploadFehler(datei) }))
    const abgelehnt = bewertet.filter((item) => item.grund)
    const gueltig = bewertet.filter((item) => !item.grund).map((item) => item.datei)

    if (abgelehnt.length) {
      toast.show({
        title: `${abgelehnt.length} Datei${abgelehnt.length > 1 ? 'en' : ''} nicht übernommen`,
        description: `${ablehnungsText(abgelehnt)} Unterstützt: PDF, DOCX, XLSX, PPTX, CSV, TXT, PNG und JPG.`,
        variant: gueltig.length ? 'warning' : 'danger',
      })
    }
    if (!gueltig.length) return

    setUploading(true)
    setUploadStatus(`${gueltig.length} Datei${gueltig.length > 1 ? 'en werden' : ' wird'} hochgeladen …`)
    try {
      const ergebnisse = await Promise.allSettled(gueltig.map((datei) => {
        const endung = dateiEndung(datei)
        return addDokument(kunde.id, {
          name: datei.name,
          typ: ENDUNG_TYP[endung] || endung || 'datei',
          groesse: datei.size,
          von: quelle,
          sichtbarKunde: rolle !== 'intern',
        }, datei)
      }))

      const erfolgreich = ergebnisse.filter((result) => result.status === 'fulfilled').length
      const fehlgeschlagen = gueltig.length - erfolgreich
      if (erfolgreich && echteDaten) await neuLaden().catch(() => null)

      if (erfolgreich) {
        toast.show({
          title: `${erfolgreich} Datei${erfolgreich > 1 ? 'en' : ''} ${echteDaten ? 'hochgeladen' : 'aufgenommen'}`,
          description: fehlgeschlagen
            ? `${fehlgeschlagen} Datei${fehlgeschlagen > 1 ? 'en konnten' : ' konnte'} nicht gespeichert werden. Erfolgreiche Uploads bleiben erhalten.`
            : echteDaten
              ? rolle === 'intern'
                ? 'Neue interne Uploads bleiben zunächst intern. Unterstützte Office-, CSV- und Textdateien werden ohne bezahlte KI für die Evidenzsuche indexiert.'
                : 'Die Unterlagen wurden im privaten Projektbereich gespeichert. Unterstützte Formate werden im Hintergrund für die Suche aufbereitet.'
              : 'Demo: Es entstand nur ein lokaler Eintrag.',
          variant: fehlgeschlagen ? 'warning' : 'success',
        })
      }

      if (!erfolgreich) {
        const ersterFehler = ergebnisse.find((result) => result.status === 'rejected')
        const grund = ersterFehler?.reason instanceof Error ? ersterFehler.reason.message : 'Dateien konnten nicht gespeichert werden.'
        toast.show({ title: 'Upload fehlgeschlagen', description: grund, variant: 'danger' })
      }
    } finally {
      setUploading(false)
      setUploadStatus('')
    }
  }

  const laden = async (dokument) => {
    if (!echteDaten) {
      toast.show({ title: 'Demo-Hinweis', description: `„${dokument.name || 'Dieses Dokument'}“ ist ein Demo-Eintrag ohne hinterlegte Datei.` })
      return
    }
    if (!accessToken) {
      toast.show({ title: 'Download nicht möglich', description: 'Ihre Sitzung ist nicht mehr verfügbar. Melden Sie sich erneut an.', variant: 'danger' })
      return
    }
    if (!dokument.storagePath) {
      toast.show({ title: 'Datei nicht verfügbar', description: 'Für diesen Dokumenteintrag ist kein Storage-Pfad hinterlegt. Der Eintrag bleibt sichtbar, damit der Datenfehler nachvollzogen werden kann.', variant: 'warning' })
      return
    }
    try {
      const blob = await downloadProjectFile(accessToken, dokument.storagePath)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = dokument.name || 'symmedis-dokument'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 0)
    } catch (error) {
      toast.show({ title: 'Download fehlgeschlagen', description: error instanceof Error ? error.message : 'Datei konnte nicht geladen werden.', variant: 'danger' })
    }
  }

  const sichtbarkeitSetzen = async (dokument) => {
    if (!accessToken || !echteDaten || rolle !== 'intern' || visibilitySaving) return
    const next = !dokument.sichtbarKunde
    setVisibilitySaving(dokument.id)
    try {
      await persistDocumentVisibility(accessToken, dokument.id, next)
      await neuLaden()
      toast.show({
        title: next ? 'Dokument freigegeben' : 'Dokument intern gesetzt',
        description: next ? 'Kunden mit Projektzugang können dieses Dokument jetzt sehen und laden.' : 'Das Dokument ist ab sofort nur noch intern sichtbar.',
        variant: 'success',
      })
    } catch (error) {
      toast.show({ title: 'Sichtbarkeit konnte nicht geändert werden', description: error instanceof Error ? error.message : 'Änderung fehlgeschlagen.', variant: 'danger' })
    } finally {
      setVisibilitySaving(null)
    }
  }

  const evidenceSuchen = async () => {
    const query = evidenceQuery.trim()
    if (query.length < 2 || !echteDaten || !accessToken || !kunde.projectId) return
    const requestId = evidenceRequestRef.current + 1
    evidenceRequestRef.current = requestId
    setEvidenceLoading(true)
    try {
      const rows = await searchProjectEvidence(accessToken, kunde.projectId, query, 8)
      if (requestId !== evidenceRequestRef.current) return
      setEvidenceResults(Array.isArray(rows) ? rows : [])
    } catch (error) {
      if (requestId !== evidenceRequestRef.current) return
      setEvidenceResults([])
      toast.show({ title: 'Evidenzsuche fehlgeschlagen', description: error instanceof Error ? error.message : 'Suche konnte nicht ausgeführt werden.', variant: 'danger' })
    } finally {
      if (requestId === evidenceRequestRef.current) setEvidenceLoading(false)
    }
  }

  const spalten = [
    {
      key: 'name', label: 'Dokument', render: (d) => (
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-muted text-ink-2"><IconDocument className="size-4" /></span>
          <span className="min-w-0"><span className="block truncate font-medium text-ink">{d.name || 'Unbenanntes Dokument'}</span><span className="block text-xs text-ink-3">{dokumentTyp(d)} · {formatBytes(Number(d.groesse) || 0)}</span></span>
        </span>
      ),
    },
    { key: 'von', label: 'Quelle', hideBelow: 'lg', render: (d) => <Chip size="sm" toneName={d.von === 'kunde' ? 'brand' : 'accent'}>{d.von === 'kunde' ? kunde.kurz : 'SYMMEDIS'}</Chip> },
    { key: 'sichtbarkeit', label: 'Sichtbarkeit', render: (d) => <Chip size="sm" toneName={d.sichtbarKunde ? 'ok' : 'neutral'}>{d.sichtbarKunde ? 'Kunde' : 'Intern'}</Chip> },
    { key: 'index', label: 'Suche', hideBelow: 'lg', render: (d) => { const state = indexStatus(d); return state ? <Chip size="sm" toneName={state.tone} title={d.indexError || state.hint}>{state.label}</Chip> : <span className="text-xs text-ink-3">–</span> } },
    { key: 'version', label: 'Version', hideBelow: 'xl', render: (d) => <span className="inline-flex items-center gap-1.5 text-ink-2"><IconHistory className="size-3.5 text-ink-3" />v{Number(d.version) || 1}</span> },
    { key: 'status', label: 'Status', hideBelow: 'lg', render: (d) => <Chip size="sm" toneName={d.status === 'geprueft' ? 'ok' : d.status === 'neu' ? 'info' : 'neutral'}>{d.status === 'geprueft' ? 'Gesichtet' : d.status === 'neu' ? 'Neu' : d.status || 'Unbekannt'}</Chip> },
    { key: 'datum', label: 'Hochgeladen', hideBelow: 'md', align: 'right', render: (d) => <span className="text-ink-2">{d.hochgeladen ? formatDate(d.hochgeladen) : '–'}</span> },
    {
      key: 'aktion', label: '', align: 'right', render: (d) => (
        <span className="flex justify-end gap-1">
          {rolle === 'intern' && echteDaten ? <Button variant="ghost" size="xs" disabled={Boolean(visibilitySaving)} onClick={() => sichtbarkeitSetzen(d)}><IconShield className="size-3.5" />{d.sichtbarKunde ? 'Intern setzen' : 'Für Kunde'}</Button> : null}
          <Button variant="ghost" size="xs" onClick={() => laden(d)}><IconDownload className="size-3.5" />Laden</Button>
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <Banner toneName={echteDaten ? 'info' : 'neutral'} icon={IconShield} title={echteDaten ? 'Privater Projekt-Speicher mit Freigabegrenze' : 'Hinweis zur Demo'}>
        {echteDaten ? rolle === 'intern' ? 'Interne Uploads bleiben standardmäßig ausschließlich für das SYMMEDIS-Team sichtbar. Die Kundenfreigabe erfolgt bewusst pro Dokument und wird zusätzlich durch Datenbank- und Storage-RLS erzwungen.' : 'Sie sehen ausschließlich Dokumente, die für Ihren Projektzugang freigegeben wurden. Eigene Uploads bleiben in Ihrem Mandantenbereich.' : 'Dateien werden in dieser Demo nicht übertragen und nicht gespeichert. Beim Hochladen entsteht ausschließlich ein Eintrag im Arbeitsspeicher dieser Sitzung.'}
      </Banner>

      {rolle === 'intern' && echteDaten ? (
        <Card>
          <CardHeader title="Frag SYMMEDIS" subtitle="Projektweite Evidenzsuche über Analyse-Findings und indexiertes Kundenwissen" icon={IconShield} />
          <CardBody className="space-y-4" aria-busy={evidenceLoading}>
            <div className="flex flex-col gap-2 sm:flex-row">
              <SearchInput value={evidenceQuery} onChange={(event) => { const value = event.target.value; setEvidenceQuery(value); if (value.trim().length < 2) { evidenceRequestRef.current += 1; setEvidenceLoading(false); setEvidenceResults([]) } }} onKeyDown={(event) => { if (event.key === 'Enter') evidenceSuchen() }} placeholder="z. B. Warum ist die Conversion schwach?" label="Projektwissen durchsuchen" className="flex-1" />
              <Button onClick={evidenceSuchen} disabled={evidenceLoading || evidenceQuery.trim().length < 2}>{evidenceLoading ? 'Suche …' : 'Evidenz suchen'}</Button>
            </div>
            {evidenceLoading ? <p className="text-xs text-ink-3" role="status" aria-live="polite">Projektwissen wird durchsucht …</p> : evidenceResults.length ? (
              <div className="space-y-2">
                {evidenceResults.map((result, index) => {
                  const similarity = Math.max(0, Math.min(1, Number(result.similarity) || 0))
                  return <div key={`${result.source_type || 'source'}-${result.source_id || index}`} className="rounded-lg border border-line bg-surface-muted p-3"><div className="flex flex-wrap items-center gap-2"><Chip size="sm" toneName={result.source_type === 'finding' ? 'accent' : 'info'}>{result.source_type === 'finding' ? 'Finding' : 'Knowledge'}</Chip><span className="text-xs font-semibold text-ink-2">{result.source_label || 'Projektwissen'}</span><span className="ml-auto text-xs tabular text-ink-3">Match {Math.round(similarity * 100)}%</span></div><p className="mt-2 line-clamp-4 text-[0.8125rem] leading-relaxed text-ink-2">{result.content || 'Kein Textauszug verfügbar.'}</p></div>
                })}
              </div>
            ) : evidenceQuery.trim().length >= 2 ? <p className="text-xs text-ink-3">Keine Treffer für diese Suche. Findings werden sofort durchsucht; Dokument-Inhalte erscheinen nach Indexierung als zusätzliche Knowledge-Quellen.</p> : <p className="text-xs text-ink-3">Die Suche respektiert dieselbe Projekt-/Tenant-RLS wie der restliche Workspace und kann keine fremden Kundendaten lesen.</p>}
          </CardBody>
        </Card>
      ) : null}

      {hochladen ? (
        <Card><CardBody><div aria-busy={uploading} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (!uploading && event.dataTransfer.files.length) hochladenDateien(event.dataTransfer.files) }} className="flex flex-col items-center rounded-lg border border-dashed border-line-strong px-6 py-8 text-center"><span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand-ink"><IconUpload className="size-5" /></span><p className="mt-3 text-sm font-semibold text-ink">Unterlagen hinzufügen</p><p className="mt-1 max-w-lg text-[0.8125rem] leading-relaxed text-ink-2">PDF, DOCX, XLSX, PPTX, CSV, TXT, PNG oder JPG · allgemein maximal 50 MB pro Datei.</p>{echteDaten ? <p className="mt-2 max-w-xl text-xs leading-relaxed text-ink-3"><strong className="font-semibold text-ink-2">Für die kostenlose Evidenzsuche:</strong> DOCX, XLSX und PPTX maximal 25 MB. CSV und TXT werden lokal aufbereitet. Bilder bleiben sichere Ablage; PDFs warten auf den kontrollierten internen Extraktionsschritt.</p> : null}{rolle === 'intern' && echteDaten ? <p className="mt-2 text-xs font-medium text-ink-3">Neue SYMMEDIS-Uploads sind zunächst intern.</p> : null}<input ref={inputRef} type="file" multiple accept=".pdf,.docx,.xlsx,.pptx,.csv,.txt,.png,.jpg,.jpeg" className="sr-only" onChange={(event) => { if (event.target.files?.length) hochladenDateien(event.target.files); event.target.value = '' }} /><Button className="mt-4" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>{uploading ? 'Upload läuft …' : 'Dateien auswählen'}</Button><p className="mt-2 min-h-4 text-xs text-ink-3" role="status" aria-live="polite">{uploadStatus}</p></div></CardBody></Card>
      ) : null}

      <Card>
        <CardHeader title="Dokumente" subtitle={`${gefiltert.length} von ${kunde.dokumente.length} Einträgen`} icon={IconFolder} />
        <CardBody className="space-y-4 px-4 py-4 sm:px-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><Segmented label="Dokumente filtern" value={filter} onChange={setFilter} options={rolle === 'intern' ? [{ value: 'alle', label: 'Alle' }, { value: 'sichtbar', label: 'Kundensichtbar' }, { value: 'intern', label: 'Intern' }, { value: 'kunde', label: kunde.kurz }, { value: 'symmedis', label: 'SYMMEDIS' }, { value: 'neu', label: 'Neu' }] : [{ value: 'alle', label: 'Alle' }, { value: 'kunde', label: kunde.kurz }, { value: 'symmedis', label: 'SYMMEDIS' }, { value: 'neu', label: 'Neu' }]} /><SearchInput value={suche} onChange={(event) => setSuche(event.target.value)} placeholder="Dokument suchen …" label="Dokumente durchsuchen" className="sm:w-56" /></div></CardBody>
        <div className="border-t border-line"><DataTable caption="Dokumente des Projekts" columns={spalten} rows={gefiltert} getKey={(d) => d.id} empty={<EmptyState icon={IconFolder} title={kunde.dokumente.length ? 'Keine Dokumente in dieser Auswahl' : 'Noch keine Dokumente'} description={kunde.dokumente.length ? 'Setzen Sie den Filter zurück oder ändern Sie die Suche.' : 'Laden Sie die ersten Projektunterlagen hoch. Sie erscheinen anschließend hier mit Quelle, Sichtbarkeit und Indexstatus.'} action={(filter !== 'alle' || suche) ? <Button variant="secondary" size="sm" onClick={() => { setFilter('alle'); setSuche('') }}>Filter zurücksetzen</Button> : undefined} />} renderCard={(d) => { const state = indexStatus(d); return <div className="flex items-start gap-3"><span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-muted text-ink-2"><IconDocument className="size-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-[0.8125rem] font-medium text-ink">{d.name || 'Unbenanntes Dokument'}</p><p className="mt-0.5 text-xs text-ink-3">{dokumentTyp(d)} · {formatBytes(Number(d.groesse) || 0)} · v{Number(d.version) || 1}</p><div className="mt-1.5 flex flex-wrap gap-1.5"><Chip size="sm" toneName={d.von === 'kunde' ? 'brand' : 'accent'}>{d.von === 'kunde' ? kunde.kurz : 'SYMMEDIS'}</Chip><Chip size="sm" toneName={d.sichtbarKunde ? 'ok' : 'neutral'}>{d.sichtbarKunde ? 'Kundensichtbar' : 'Intern'}</Chip><Chip size="sm" toneName={d.status === 'geprueft' ? 'ok' : d.status === 'neu' ? 'info' : 'neutral'}>{d.status === 'geprueft' ? 'Gesichtet' : d.status === 'neu' ? 'Neu' : d.status || 'Unbekannt'}</Chip>{state ? <Chip size="sm" toneName={state.tone} title={d.indexError || state.hint}>{state.label}</Chip> : null}</div>{state && (d.indexError || state.hint) ? <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-3">{d.indexError || state.hint}</p> : null}<div className="mt-3 flex flex-wrap gap-2">{rolle === 'intern' && echteDaten ? <Button variant="secondary" size="xs" disabled={Boolean(visibilitySaving)} onClick={() => sichtbarkeitSetzen(d)}><IconShield className="size-3.5" />{d.sichtbarKunde ? 'Intern setzen' : 'Für Kunde'}</Button> : null}<Button variant="secondary" size="xs" onClick={() => laden(d)}><IconDownload className="size-3.5" />Laden</Button></div></div></div> }} /></div>
      </Card>
    </div>
  )
}
