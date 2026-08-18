import { Link } from 'react-router-dom'
import { KATEGORIE_MAP } from '../../data/catalog.js'
import { PROJEKT_STATUS } from '../../data/workspace.js'
import { formatDate, formatRelative, tageBis } from '../../lib/format.js'
import { faelligkeit } from '../../lib/aufgaben.js'
import { scoreStufe } from '../../lib/tone.js'
import { Button, Chip } from '../ui/primitives.jsx'
import { Card, CardBody, CardHeader, MetricCard, PageHeader, Banner, EmptyState } from '../ui/layout.jsx'
import { ProgressBar } from '../ui/data.jsx'
import { BremsenCards, AnalyseUebersicht } from './AnalysisModule.jsx'
import { PlanVorschau } from './PlanModule.jsx'
import { AufgabenVorschau } from './TasksModule.jsx'
import { SocialUeberblick } from './SocialModule.jsx'
import { NaechsterTermin } from './AppointmentsModule.jsx'
import { ActivityFeed } from './ActivityFeed.jsx'
import {
  IconAlert,
  IconArrowRight,
  IconChat,
  IconCheckCircle,
  IconClock,
  IconDocument,
  IconShield,
  IconTarget,
  IconUsers,
} from '../ui/Icons.jsx'

const STANDARD_STATUS = { label: 'Projekt aktiv', tone: 'neutral' }

function naechsteAktion(kunde) {
  const ueberfaellig = kunde.aufgaben.filter(
    (a) => a.status !== 'erledigt' && faelligkeit(a).ueberfaellig && a.verantwortlich === 'kunde',
  )
  if (ueberfaellig.length > 0) {
    return {
      titel: ueberfaellig[0].titel,
      text: `${ueberfaellig.length} überfällige ${ueberfaellig.length === 1 ? 'Aufgabe' : 'Aufgaben'} in Ihrer Verantwortung blockieren den nächsten Schritt.`,
      tone: 'urgent',
      ziel: 'aufgaben',
      label: 'Aufgaben öffnen',
    }
  }

  const neueDokumente = kunde.dokumente.filter((d) => d.status === 'neu')
  if (kunde.status === 'onboarding') {
    return {
      titel: 'Unterlagen vervollständigen',
      text: kunde.dokumente.length
        ? 'Die vorhandenen Unterlagen werden geprüft. Ergänzen Sie weitere relevante Vertriebs-, Marketing- oder Produktdokumente, wenn sie noch fehlen.'
        : 'Laden Sie die wichtigsten Vertriebs-, Marketing- und Produktunterlagen hoch, damit die Ursachenanalyse vollständig starten kann.',
      tone: 'warn',
      ziel: 'dokumente',
      label: 'Dokumente öffnen',
    }
  }
  if (neueDokumente.length > 0) {
    return {
      titel: `${neueDokumente.length} ${neueDokumente.length === 1 ? 'Dokument' : 'Dokumente'} in Sichtung`,
      text: 'Das SYMMEDIS-Team wertet die zuletzt hochgeladenen Unterlagen aus.',
      tone: 'info',
      ziel: 'dokumente',
      label: 'Dokumente ansehen',
    }
  }
  if (kunde.analyse.length === 0) {
    return {
      titel: 'Ursachenanalyse wird vorbereitet',
      text: 'Sobald die ersten Dimensionen bewertet und geprüft sind, werden hier Ergebnisse und konkrete nächste Schritte sichtbar.',
      tone: 'info',
      ziel: 'analyse',
      label: 'Analyse ansehen',
    }
  }

  const offen = kunde.aufgaben
    .filter((a) => a.status !== 'erledigt' && a.verantwortlich === 'kunde')
    .sort((a, b) => tageBis(a.faellig) - tageBis(b.faellig))[0]
  if (offen) {
    return {
      titel: offen.titel,
      text: `Fällig ${formatDate(offen.faellig)}${offen.kpi ? ` · Messgröße: ${offen.kpi}` : ''}`,
      tone: 'brand',
      ziel: 'aufgaben',
      label: 'Aufgabe öffnen',
    }
  }
  if (!kunde.plan.some((phase) => phase.aufgaben.length > 0)) {
    return {
      titel: '90-Tage-Plan wird abgeleitet',
      text: 'Die geprüften Analyseergebnisse werden jetzt in priorisierte Maßnahmen übersetzt.',
      tone: 'info',
      ziel: 'plan',
      label: 'Plan ansehen',
    }
  }

  return {
    titel: 'Ergebnisgespräch vorbereiten',
    text: 'Alle Aufgaben in Ihrer Verantwortung sind aktuell erledigt. Nutzen Sie den 90-Tage-Plan zur Vorbereitung der nächsten Prioritäten.',
    tone: 'ok',
    ziel: 'plan',
    label: '90-Tage-Plan ansehen',
  }
}

export function ProjectDashboard({ kunde, basis, rolle = 'kunde', begruessung }) {
  const status = PROJEKT_STATUS[kunde.status] || STANDARD_STATUS
  const aktion = naechsteAktion(kunde)
  const score = Number(kunde.gesamtScore || 0)
  const stufe = scoreStufe(score)
  const analyseGesamt = kunde.analyse.length
  const bremse =
    [...kunde.analyse].filter((a) => a.sichtbarKunde).sort((a, b) => Number(a.score || 0) - Number(b.score || 0))[0] ??
    [...kunde.analyse].sort((a, b) => Number(a.score || 0) - Number(b.score || 0))[0]
  const freigegeben = kunde.analyse.filter((a) => a.sichtbarKunde).length
  const inPruefung = Math.max(0, analyseGesamt - freigegeben)
  const pruefFortschritt = analyseGesamt ? Math.round((freigegeben / analyseGesamt) * 100) : 0
  const analyseFortschritt = Number.isFinite(Number(kunde.fortschritt)) ? Math.max(0, Math.min(100, Number(kunde.fortschritt))) : pruefFortschritt
  const offeneAufgaben = kunde.aufgaben.filter((a) => a.status !== 'erledigt').length
  const letzteRueckmeldung = kunde.chat.filter((n) => n.from === 'symmedis').at(-1)
  const name = kunde.ansprechpartner?.name?.trim()
  const nachname = name ? name.split(' ').at(-1) : null

  return (
    <div className="space-y-6">
      <PageHeader
        title={begruessung ?? (nachname ? `Guten Tag, ${nachname}` : 'Willkommen in Ihrem Projekt')}
        subtitle={`Ursachenanalyse für ${kunde.unternehmen}${kunde.start ? ` · Analysestart ${formatDate(kunde.start)}` : ''}${kunde.ergebnis ? ` · Ergebnistermin ${formatDate(kunde.ergebnis)}` : ''}`}
        meta={<><Chip toneName={status.tone} dot>{status.label}</Chip><Chip toneName="neutral" icon={IconUsers}>Betreuung: SYMMEDIS Team</Chip><Chip toneName="accent" icon={IconShield}>Menschlich geprüft</Chip></>}
        actions={<Button as={Link} to={`${basis}/nachrichten`} variant="secondary" size="sm"><IconChat className="size-4" />Nachricht an SYMMEDIS</Button>}
      />

      <Card className="lg:hidden">
        <CardBody className="space-y-3.5">
          <div className="flex items-center justify-between gap-3"><span className="text-[0.8125rem] font-medium text-ink-2">Reifegrad</span><span className="flex items-baseline gap-1.5"><span className="text-lg font-semibold tabular text-ink">{analyseGesamt ? score : '–'}</span>{analyseGesamt ? <span className="text-xs text-ink-3">/ 100</span> : null}{analyseGesamt ? <Chip size="sm" toneName={stufe.tone} className="ml-1">{stufe.label}</Chip> : null}</span></div>
          {bremse ? <div className="border-t border-line pt-3"><span className="text-[0.8125rem] font-medium text-ink-2">Größte Wachstumsbremse</span><p className="mt-1 text-[0.8125rem] font-semibold text-ink">{KATEGORIE_MAP[bremse.kategorieId]?.label || bremse.kategorieId || 'Noch nicht zugeordnet'}</p><p className="mt-0.5 line-clamp-2 text-[0.8125rem] leading-relaxed text-ink-2">{bremse.beobachtung || 'Die Detailbewertung wird derzeit vorbereitet.'}</p></div> : null}
          <div className="border-t border-line pt-3"><span className="text-[0.8125rem] font-medium text-ink-2">Nächster Schritt</span><p className="mt-1 text-[0.8125rem] font-semibold text-ink">{aktion.titel}</p></div>
          <Button as={Link} to={`${basis}/analyse`} size="sm" fullWidth className="mt-1">Vollständige Analyse öffnen<IconArrowRight className="size-4" /></Button>
        </CardBody>
      </Card>

      <Banner toneName={aktion.tone} icon={aktion.tone === 'urgent' ? IconAlert : IconTarget} title={`Nächster Schritt: ${aktion.titel}`} action={<Button as={Link} to={`${basis}/${aktion.ziel}`} size="sm" variant="secondary">{aktion.label}<IconArrowRight className="size-4" /></Button>}>{aktion.text}</Banner>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Gesamtreifegrad" value={analyseGesamt ? score : '–'} unit={analyseGesamt ? '/ 100' : undefined} icon={IconTarget} toneName={analyseGesamt ? stufe.tone : 'neutral'} hint={analyseGesamt ? `Stufe: ${stufe.label}` : 'Entsteht mit den ersten geprüften Dimensionen'} />
        <MetricCard label="Analysefortschritt" value={`${analyseFortschritt} %`} icon={IconCheckCircle} toneName="brand" hint={analyseGesamt ? `${freigegeben} von ${analyseGesamt} Punkten freigegeben` : 'Noch keine Analysedimensionen vorhanden'} footer={<ProgressBar value={analyseFortschritt} size="sm" hideLabel label="Analysefortschritt" />} />
        <MetricCard label="Offene Aufgaben" value={offeneAufgaben} icon={IconClock} toneName={offeneAufgaben > 5 ? 'warn' : 'neutral'} hint={kunde.aufgaben.length ? `${kunde.aufgaben.length - offeneAufgaben} erledigt` : 'Noch keine Maßnahmen zugewiesen'} />
        <MetricCard label="Tage bis Ergebnistermin" value={kunde.ergebnis ? Math.max(0, tageBis(kunde.ergebnis)) : '–'} icon={IconDocument} toneName="accent" hint={kunde.ergebnis ? formatDate(kunde.ergebnis) : 'Termin wird abgestimmt'} />
      </div>

      <Card>
        <CardHeader title="Stand der menschlichen Prüfung" subtitle="Software strukturiert, das SYMMEDIS-Team bewertet und gibt frei" icon={IconShield} />
        <CardBody className="space-y-3">
          {analyseGesamt ? <><div className="flex flex-wrap items-center gap-2"><Chip toneName="ok" icon={IconCheckCircle}>{freigegeben} freigegeben</Chip><Chip toneName={inPruefung > 0 ? 'warn' : 'neutral'} icon={inPruefung > 0 ? IconClock : undefined}>{inPruefung} in Prüfung</Chip></div><ProgressBar value={pruefFortschritt} label={`${freigegeben} von ${analyseGesamt} Analysedimensionen freigegeben`} toneName={inPruefung === 0 ? 'ok' : 'brand'} /><p className="text-[0.8125rem] leading-relaxed text-ink-2">Kein Analysepunkt wird automatisch veröffentlicht. Jede Bewertung durchläuft die Prüfung durch unser Team, bevor sie hier erscheint.</p></> : <EmptyState compact icon={IconShield} title="Prüfung startet mit den ersten Ergebnissen" description="Sobald erste Analysedimensionen vorliegen, sehen Sie hier transparent, welche Punkte bereits menschlich geprüft und freigegeben wurden." />}
        </CardBody>
      </Card>

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3"><h2 className="text-base font-semibold text-ink">Die drei größten Umsatzbremsen</h2><Button as={Link} to={`${basis}/analyse`} variant="ghost" size="sm">Zur Analyse</Button></div>
        <BremsenCards kunde={kunde} />
      </section>

      <div className="grid gap-5 lg:grid-cols-3"><AnalyseUebersicht kunde={kunde} /><PlanVorschau kunde={kunde} /><AufgabenVorschau kunde={kunde} nurRolle="kunde" /></div>

      <div className="grid gap-5 lg:grid-cols-3">
        <SocialUeberblick kunde={kunde} />
        <Card><CardHeader title="Letzte Rückmeldung" subtitle="Aus dem Nachrichtenverlauf" icon={IconChat} /><CardBody>{letzteRueckmeldung ? <><p className="text-[0.875rem] leading-relaxed text-ink">{letzteRueckmeldung.text.length > 220 ? `${letzteRueckmeldung.text.slice(0, 220)} …` : letzteRueckmeldung.text}</p><p className="mt-2.5 text-xs text-ink-3">{letzteRueckmeldung.author || 'SYMMEDIS'} · {formatRelative(letzteRueckmeldung.zeit)}</p><Button as={Link} to={`${basis}/nachrichten`} variant="ghost" size="sm" className="mt-3 -ml-3">Verlauf öffnen<IconArrowRight className="size-4" /></Button></> : <EmptyState compact icon={IconChat} title="Noch keine Rückmeldung" description="Sobald das Team antwortet, erscheint die Nachricht hier." />}</CardBody></Card>
        <NaechsterTermin kunde={kunde} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <ActivityFeed kunde={kunde} titel="Projektverlauf" limit={5} />
        <Card>
          <CardHeader title="Zuletzt hinzugefügte Dokumente" icon={IconDocument} action={<Button as={Link} to={`${basis}/dokumente`} variant="ghost" size="sm">Alle</Button>} />
          <CardBody className="px-0 py-0">
            {kunde.dokumente.length ? <ul className="divide-y divide-line">{kunde.dokumente.slice(0, 5).map((dokument) => <li key={dokument.id} className="flex items-center gap-3 px-4 py-3 sm:px-5"><span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-muted text-ink-2"><IconDocument className="size-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-[0.8125rem] font-medium text-ink">{dokument.name}</span><span className="block text-xs text-ink-3">{dokument.von === 'kunde' ? kunde.kurz : 'SYMMEDIS'}{dokument.hochgeladen ? ` · ${formatDate(dokument.hochgeladen)}` : ''}</span></span><Chip size="sm" toneName={dokument.status === 'geprueft' ? 'ok' : 'info'}>{dokument.status === 'geprueft' ? 'Gesichtet' : 'Neu'}</Chip></li>)}</ul> : <EmptyState compact icon={IconDocument} title="Noch keine Dokumente" description="Sobald Unterlagen hochgeladen oder Arbeitsergebnisse bereitgestellt wurden, erscheinen sie hier." />}
          </CardBody>
        </Card>
      </div>

      {rolle === 'demo' ? <Banner toneName="neutral" icon={IconShield} title="Demo-Datenstand">Alle Werte auf dieser Seite stammen aus einem fiktiven Beispielprojekt ({KATEGORIE_MAP.positionierung.label} bis {KATEGORIE_MAP.wettbewerb.label}). Es besteht keine Verbindung zu echten Unternehmensdaten.</Banner> : null}
    </div>
  )
}
