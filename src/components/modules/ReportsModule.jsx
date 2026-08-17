import { KATEGORIE_MAP } from '../../data/catalog.js'
import { formatDate } from '../../lib/format.js'
import { scoreStufe } from '../../lib/tone.js'
import { useToast } from '../../hooks/useToast.js'
import { Button, Chip } from '../ui/primitives.jsx'
import { Card, CardBody, CardHeader, Banner, MetricCard } from '../ui/layout.jsx'
import { DataTable, KeyValueList } from '../ui/data.jsx'
import { IconDocument, IconDownload, IconLock, IconShield, IconTarget } from '../ui/Icons.jsx'

const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]))

function analyseCsv(kunde, nurFreigegeben) {
  const kopf = ['Dimension', 'Score', 'Stufe', 'Priorität', 'Beobachtung', 'Empfehlung', 'Beleg']
  const zeilen = kunde.analyse.filter((a) => !nurFreigegeben || a.sichtbarKunde).map((a) => [
    KATEGORIE_MAP[a.kategorieId].label, a.score, scoreStufe(a.score).label, a.prioritaet, a.beobachtung, a.empfehlung, a.beleg,
  ])
  return [kopf, ...zeilen].map((zeile) => zeile.map((feld) => `"${String(feld).replaceAll('"', '""')}"`).join(';')).join('\n')
}

function executiveHtml(kunde) {
  const findings = kunde.analyse.filter((a) => a.sichtbarKunde)
  const verified = findings.filter((a) => a.impactVerified)
  const impact = verified.reduce((sum, item) => ({
    min: sum.min + (item.revenueImpactMin || 0) + (item.costImpactMin || 0),
    max: sum.max + (item.revenueImpactMax || 0) + (item.costImpactMax || 0),
  }), { min: 0, max: 0 })
  const measurements = (kunde.messungen || []).filter((m) => m.sichtbarKunde)
  const blockers = kunde.bremsen.slice(0, 3)
  const tasks = kunde.aufgaben.filter((task) => task.status !== 'erledigt').slice(0, 8)
  const rows = findings.map((item) => `<tr><td>${escapeHtml(KATEGORIE_MAP[item.kategorieId]?.label || item.kategorieId)}</td><td>${item.score}/100</td><td>${escapeHtml(item.beobachtung)}</td><td>${escapeHtml(item.empfehlung)}</td></tr>`).join('')
  const blockerHtml = blockers.map((item) => `<li><strong>${escapeHtml(item.titel)}</strong><br><span>${escapeHtml(item.ursache)}</span></li>`).join('')
  const taskHtml = tasks.map((item) => `<li>${escapeHtml(item.titel)} <span>(${escapeHtml(item.faellig || 'ohne Termin')})</span></li>`).join('')
  const measurementHtml = measurements.map((item) => `<tr><td>${escapeHtml(item.label)}</td><td>${escapeHtml(item.baseline ?? '–')} ${escapeHtml(item.unit)}</td><td>${escapeHtml(item.current ?? '–')} ${escapeHtml(item.unit)}</td><td>${escapeHtml(item.target ?? '–')} ${escapeHtml(item.unit)}</td></tr>`).join('')

  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>SYMMEDIS Executive Report – ${escapeHtml(kunde.unternehmen)}</title><style>
    @page{size:A4;margin:15mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#141414;margin:0;font-size:11px;line-height:1.45}h1{font-size:27px;margin:0}h2{font-size:16px;margin:24px 0 9px;border-bottom:1px solid #ddd;padding-bottom:6px}.brand{font-weight:800;letter-spacing:.08em}.muted{color:#666}.meta{margin:7px 0 22px}.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.metric{border:1px solid #ddd;border-radius:9px;padding:12px}.metric strong{display:block;font-size:18px;margin-top:4px}table{width:100%;border-collapse:collapse;margin-top:7px}th,td{text-align:left;vertical-align:top;border-bottom:1px solid #e5e5e5;padding:7px 6px}th{font-size:9px;text-transform:uppercase;color:#666}ul{padding-left:18px}li{margin-bottom:8px}.notice{padding:10px;border:1px solid #ddd;border-radius:8px;background:#f7f7f7}.footer{margin-top:28px;padding-top:8px;border-top:1px solid #ddd;color:#777;font-size:9px}tr,li,.metric{break-inside:avoid}
  </style></head><body>
    <div class="brand">SYMMEDIS</div><h1>Executive Diagnosis Report</h1><div class="meta"><strong>${escapeHtml(kunde.unternehmen)}</strong> · ${escapeHtml(kunde.branche || 'Branche offen')} · Stand ${escapeHtml(new Date().toLocaleDateString('de-DE'))}</div>
    <div class="metrics"><div class="metric">Gesamtreifegrad<strong>${kunde.gesamtScore}/100</strong></div><div class="metric">Verifizierter Impact min.<strong>${euro.format(impact.min)}</strong></div><div class="metric">Verifizierter Impact max.<strong>${euro.format(impact.max)}</strong></div></div>
    <p class="notice"><strong>Methodik:</strong> Monetäre Impact-Werte erscheinen nur, wenn sie vom SYMMEDIS-Team gegen reale Kundendaten verifiziert wurden. Nicht freigegebene Findings und interne Notizen sind ausgeschlossen.</p>
    <h2>Die drei größten Wachstumsbremsen</h2><ol>${blockerHtml}</ol>
    <h2>Freigegebene Diagnose</h2><table><thead><tr><th>Dimension</th><th>Score</th><th>Beobachtung</th><th>Empfehlung</th></tr></thead><tbody>${rows || '<tr><td colspan="4">Noch keine Findings freigegeben.</td></tr>'}</tbody></table>
    <h2>30/60/90-Tage-Umsetzung</h2><ul>${taskHtml || '<li>Noch keine Maßnahmen geplant.</li>'}</ul>
    ${measurements.length ? `<h2>Vorher/Nachher-Messung</h2><table><thead><tr><th>KPI</th><th>Baseline</th><th>Aktuell</th><th>Ziel</th></tr></thead><tbody>${measurementHtml}</tbody></table>` : ''}
    <div class="footer">SYMMEDIS · evidenzbasierte Ursachenanalyse · Dieser Bericht basiert auf dem zum Exportzeitpunkt freigegebenen Projektstand.</div>
  </body></html>`
}

export function ReportsModule({ kunde, rolle = 'kunde' }) {
  const toast = useToast()
  const nurFreigegeben = rolle === 'kunde'
  const verified = kunde.analyse.filter((a) => a.sichtbarKunde && a.impactVerified)
  const impact = verified.reduce((sum, item) => ({ min: sum.min + (item.revenueImpactMin || 0) + (item.costImpactMin || 0), max: sum.max + (item.revenueImpactMax || 0) + (item.costImpactMax || 0) }), { min: 0, max: 0 })

  const exportieren = () => {
    const inhalt = analyseCsv(kunde, nurFreigegeben)
    const blob = new Blob([`\uFEFF${inhalt}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `symmedis-analyse-${kunde.id}.csv`
    document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(url)
    toast.show({ title: 'CSV erstellt', description: nurFreigegeben ? 'Enthält alle für Sie freigegebenen Analysepunkte.' : 'Enthält alle Analysepunkte ohne interne Notizen.', variant: 'success' })
  }

  const executiveDrucken = () => {
    const popup = window.open('', '_blank')
    if (!popup) {
      toast.show({ title: 'Pop-up blockiert', description: 'Bitte Pop-ups für SYMMEDIS erlauben und erneut exportieren.' })
      return
    }
    try { popup.opener = null } catch { /* Browser kann opener schreibgeschützt behandeln. */ }
    popup.document.open()
    popup.document.write(executiveHtml(kunde))
    popup.document.close()
    popup.focus()
    const printWhenReady = () => window.setTimeout(() => popup.print(), 120)
    if (popup.document.readyState === 'complete') printWhenReady()
    else popup.addEventListener('load', printWhenReady, { once: true })
  }

  const verfuegbar = kunde.berichte.filter((b) => !nurFreigegeben || b.stand === 'final')
  const spalten = [
    { key: 'titel', label: 'Bericht', render: (b) => <span className="flex min-w-0 items-center gap-2.5"><span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-muted text-ink-2"><IconDocument className="size-4" /></span><span className="min-w-0"><span className="block truncate font-medium text-ink">{b.titel}</span><span className="block text-xs text-ink-3">{b.typ} · {b.seiten} Seiten</span></span></span> },
    { key: 'autor', label: 'Erstellt von', hideBelow: 'lg', render: (b) => <span className="text-ink-2">{b.autor}</span> },
    { key: 'stand', label: 'Stand', render: (b) => <Chip size="sm" toneName={b.stand === 'final' ? 'ok' : 'warn'}>{b.stand === 'final' ? 'Freigegeben' : 'Entwurf'}</Chip> },
    { key: 'datum', label: 'Datum', hideBelow: 'md', align: 'right', render: (b) => <span className="text-ink-2">{formatDate(b.datum)}</span> },
  ]

  return (
    <div className="min-w-0 space-y-5">
      {rolle === 'kunde' && kunde.berichte.some((b) => b.stand !== 'final') ? <Banner toneName="info" icon={IconLock} title="Berichte in Arbeit">{kunde.berichte.filter((b) => b.stand !== 'final').length} Bericht(e) befinden sich noch in der internen Prüfung und erscheinen hier nach der Freigabe.</Banner> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Freigegebene Findings" value={kunde.analyse.filter((a) => a.sichtbarKunde).length} unit={`/ ${kunde.analyse.length}`} icon={IconShield} toneName="info" />
        <MetricCard label="Verifizierter Impact min." value={euro.format(impact.min)} icon={IconTarget} toneName="info" />
        <MetricCard label="Verifizierter Impact max." value={euro.format(impact.max)} icon={IconTarget} toneName="brand" />
      </div>

      <Card>
        <CardHeader title="Executive Diagnosis Report" subtitle="Managementtauglicher Bericht aus ausschließlich freigegebenen und verifizierten Projektdaten" />
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-[0.8125rem] leading-relaxed text-ink-2">Enthält Diagnose, Top-Wachstumsbremsen, 30/60/90-Tage-Maßnahmen, verifizierten €-Impact und – sobald gepflegt – Vorher/Nachher-KPIs. Über den Browser-Dialog kann der Bericht direkt als PDF gespeichert werden.</p>
          <Button onClick={executiveDrucken}><IconDownload className="size-4" />Management-Report als PDF</Button>
        </CardBody>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <Card>
          <CardHeader title="Berichte" subtitle={`${verfuegbar.length} von ${kunde.berichte.length} Dokumenten`} />
          <DataTable caption="Berichte des Projekts" columns={spalten} rows={verfuegbar} getKey={(b) => b.id} renderCard={(b) => <div><p className="text-[0.8125rem] font-medium text-ink">{b.titel}</p><p className="mt-0.5 text-xs text-ink-3">{b.typ} · {b.seiten} Seiten · {formatDate(b.datum)}</p><div className="mt-1.5"><Chip size="sm" toneName={b.stand === 'final' ? 'ok' : 'warn'}>{b.stand === 'final' ? 'Freigegeben' : 'Entwurf'}</Chip></div></div>} />
        </Card>
        <div className="min-w-0 space-y-5">
          <Card><CardHeader title="Datenexport" subtitle="Aus dem aktuellen Projektstand" /><CardBody className="space-y-3"><p className="text-[0.8125rem] leading-relaxed text-ink-2">CSV mit {nurFreigegeben ? 'freigegebenen ' : ''}Analysedimensionen, Score, Priorität, Beobachtung, Empfehlung und Beleg.</p><Button fullWidth variant="secondary" onClick={exportieren}><IconDownload className="size-4" />Analyse als CSV</Button><p className="flex items-start gap-2 text-xs leading-relaxed text-ink-3"><IconShield className="mt-0.5 size-3.5 shrink-0" />Interne Notizen sind nie Bestandteil eines Exports.</p></CardBody></Card>
          <Card><CardHeader title="Projektdaten" /><CardBody><KeyValueList items={[{ label: 'Unternehmen', value: kunde.unternehmen }, { label: 'Branche', value: kunde.branche }, { label: 'Analysestart', value: formatDate(kunde.start) }, { label: 'Ergebnistermin', value: formatDate(kunde.ergebnis) }, { label: 'Gesamtreifegrad', value: `${kunde.gesamtScore} / 100` }]} /></CardBody></Card>
        </div>
      </div>
    </div>
  )
}
