import { useId, useState } from 'react'
import { cn } from '../../lib/cn.js'
import { scoreStufe, tone } from '../../lib/tone.js'

/**
 * Diagramme als handgeschriebenes SVG – keine Chart-Bibliothek.
 *
 * Regeln (aus der Visualisierungs-Richtlinie):
 *  - Magnitude → eine Farbe, nach Wert sortiert; keine bunten Kategorien
 *  - jede Marke wird direkt beschriftet, Farbe trägt nie allein die Aussage
 *  - Raster und Achsen bleiben zurückhaltend
 *  - zu jedem Diagramm existiert eine Textalternative
 */

/* ----------------------------------------------------------------- ScoreBar */

/** Ein Analysewert 0–100 mit Stufe, Balken und sichtbarer Zahl. */
export function ScoreBar({ score, label, sublabel, showStufe = true, className, onClick }) {
  const stufe = scoreStufe(score)
  const t = tone(stufe.tone)
  const Wrapper = onClick ? 'button' : 'div'

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'w-full text-left',
        onClick && 'rounded-lg transition-colors hover:bg-surface-muted',
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-[0.8125rem] font-medium text-ink">{label}</span>
        <span className="flex shrink-0 items-baseline gap-2">
          {showStufe ? <span className={cn('text-xs font-medium', t.text)}>{stufe.label}</span> : null}
          <span className="tabular text-[0.8125rem] font-semibold text-ink">{score}</span>
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-viz-track">
        <div
          className={cn('h-full origin-left rounded-full animate-grow-x', t.bar)}
          style={{ width: `${Math.max(2, score)}%` }}
        />
      </div>
      {sublabel ? <p className="mt-1.5 text-xs leading-snug text-ink-3">{sublabel}</p> : null}
    </Wrapper>
  )
}

/* ------------------------------------------------------------------ BarList */

/**
 * Nach Wert sortierte Balkenliste (z. B. Social-Plattformen).
 * Eine Farbe – die Länge trägt den Vergleich, nicht der Farbton.
 */
export function BarList({ items, unit = '', max, className }) {
  const hoechst = max ?? Math.max(...items.map((i) => i.value), 1)
  return (
    <ul className={cn('space-y-2.5', className)}>
      {[...items]
        .sort((a, b) => b.value - a.value)
        .map((item) => (
          <li key={item.label}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2">
                {item.icon ? <item.icon className="size-3.5 shrink-0 text-ink-3" /> : null}
                <span className="min-w-0 truncate text-[0.8125rem] text-ink">{item.label}</span>
              </span>
              <span className="tabular shrink-0 text-[0.8125rem] font-medium text-ink">
                {item.display ?? item.value}
                {unit}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-viz-track">
              <div
                className="h-full origin-left rounded-full bg-viz-1 animate-grow-x"
                style={{ width: `${Math.max(2, (item.value / hoechst) * 100)}%` }}
              />
            </div>
          </li>
        ))}
    </ul>
  )
}

/* -------------------------------------------------------------- RadarChart */

/**
 * Profil über mehrere Analysedimensionen – eine Serie, optional eine
 * Vergleichsserie (Branchen-Median). Zwei Serien = Legende ist Pflicht.
 */
const RAND = 42

export function RadarChart({ axes, series, compare, size = 260, className }) {
  const [aktiv, setAktiv] = useState(null)
  const mitte = size / 2
  const radius = mitte - 24
  const anzahl = axes.length

  const punkt = (index, wert) => {
    const winkel = (Math.PI * 2 * index) / anzahl - Math.PI / 2
    const r = (wert / 100) * radius
    return [mitte + Math.cos(winkel) * r, mitte + Math.sin(winkel) * r]
  }

  const pfad = (werte) =>
    werte.map((w, i) => punkt(i, w).join(',')).join(' ')

  return (
    <div className={className}>
      {/* Der viewBox ist seitlich erweitert: die Achsenbeschriftungen stehen
          außerhalb des Rasters und wurden sonst am Rand abgeschnitten. */}
      <svg
        viewBox={`${-RAND} ${-RAND / 2} ${size + RAND * 2} ${size + RAND}`}
        className="mx-auto h-auto w-full max-w-[19rem]"
        role="img"
        aria-label={`Analyseprofil über ${anzahl} Dimensionen`}
      >
        {/* Raster – bewusst zurückhaltend */}
        {[25, 50, 75, 100].map((stufe) => (
          <polygon
            key={stufe}
            points={pfad(axes.map(() => stufe))}
            fill="none"
            stroke="var(--c-viz-grid)"
            strokeWidth="1"
          />
        ))}
        {axes.map((_, i) => {
          const [x, y] = punkt(i, 100)
          return <line key={i} x1={mitte} y1={mitte} x2={x} y2={y} stroke="var(--c-viz-grid)" strokeWidth="1" />
        })}

        {compare ? (
          <polygon
            points={pfad(compare)}
            fill="var(--c-viz-2)"
            fillOpacity="0.1"
            stroke="var(--c-viz-2)"
            strokeWidth="2"
            strokeDasharray="4 3"
          />
        ) : null}

        <polygon
          points={pfad(series)}
          fill="var(--c-viz-1)"
          fillOpacity="0.16"
          stroke="var(--c-viz-1)"
          strokeWidth="2"
        />

        {series.map((wert, i) => {
          const [x, y] = punkt(i, wert)
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={aktiv === i ? 5 : 3.5}
              fill="var(--c-viz-1)"
              stroke="var(--c-surface)"
              strokeWidth="2"
              onMouseEnter={() => setAktiv(i)}
              onMouseLeave={() => setAktiv(null)}
            />
          )
        })}

        {/* Achsenbeschriftung */}
        {axes.map((achse, i) => {
          const [x, y] = punkt(i, 116)
          return (
            <text
              key={achse.kurz}
              x={x}
              y={y}
              textAnchor={x < mitte - 6 ? 'end' : x > mitte + 6 ? 'start' : 'middle'}
              dominantBaseline="middle"
              fontSize="10"
              fill="var(--c-viz-axis)"
              fontWeight={aktiv === i ? 700 : 500}
            >
              {achse.kurz}
            </text>
          )
        })}
      </svg>

      {aktiv !== null ? (
        <p className="mt-1 text-center text-xs text-ink-2">
          <span className="font-medium text-ink">{axes[aktiv].label}</span>: {series[aktiv]}
          {compare ? ` · Median ${compare[aktiv]}` : ''}
        </p>
      ) : null}

      {compare ? (
        <div className="mt-2 flex items-center justify-center gap-4 text-xs text-ink-2">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="h-0.5 w-4 rounded bg-viz-1" />
            Ihr Profil
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-0.5 w-4 rounded bg-viz-2"
              style={{ backgroundImage: 'repeating-linear-gradient(90deg,currentColor 0 4px,transparent 4px 7px)' }}
            />
            Branchen-Median
          </span>
        </div>
      ) : null}
    </div>
  )
}

/* --------------------------------------------------------------- Sparkline */

/** Verlaufslinie mit hervorgehobenem Endpunkt und Direktwert. */
export function Sparkline({ values, width = 120, height = 34, toneName = 'brand', label, className }) {
  const id = useId()
  const t = tone(toneName)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const spanne = max - min || 1

  const punkte = values.map((v, i) => [
    (i / (values.length - 1)) * (width - 4) + 2,
    height - 4 - ((v - min) / spanne) * (height - 10),
  ])
  const d = punkte.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const flaeche = `${d} L${width - 2},${height} L2,${height} Z`
  const [ex, ey] = punkte[punkte.length - 1]

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('h-auto w-full', className)}
      role="img"
      aria-label={label ?? `Verlauf, aktuell ${values[values.length - 1]}`}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g className={t.text}>
        <path d={flaeche} fill={`url(#${id})`} />
        <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={ex} cy={ey} r="3" fill="currentColor" stroke="var(--c-surface)" strokeWidth="2" />
      </g>
    </svg>
  )
}

/* -------------------------------------------------------------- DonutStat */

/** Ringdiagramm mit Wert in der Mitte – für einen einzelnen Fortschritt. */
export function DonutStat({ value, label, sublabel, toneName = 'brand', size = 132, className }) {
  const t = tone(toneName)
  const stroke = 10
  const r = (size - stroke) / 2
  const umfang = 2 * Math.PI * r
  const anteil = Math.max(0, Math.min(100, value))

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="size-full -rotate-90" role="img" aria-label={`${label}: ${anteil} Prozent`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--c-viz-track)" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            className={t.text}
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={umfang}
            strokeDashoffset={umfang - (anteil / 100) * umfang}
            style={{ transition: 'stroke-dashoffset .8s var(--ease-out)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="tabular text-2xl font-semibold text-ink">{Math.round(anteil)}</span>
          <span className="text-xs text-ink-3">%</span>
        </div>
      </div>
      <p className="mt-2 text-center text-[0.8125rem] font-medium text-ink">{label}</p>
      {sublabel ? <p className="mt-0.5 text-center text-xs text-ink-3">{sublabel}</p> : null}
    </div>
  )
}

/* ------------------------------------------------------------- StatusSplit */

/**
 * Verteilung über Status. Jedes Segment trägt Label und Zahl in der Legende –
 * die Farbe ist nur die zweite Kodierung.
 */
export function StatusSplit({ segments, className }) {
  const gesamt = segments.reduce((sum, s) => sum + s.value, 0) || 1
  return (
    <div className={className}>
      <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full">
        {segments
          .filter((s) => s.value > 0)
          .map((segment) => (
            <div
              key={segment.label}
              className={cn('h-full first:rounded-l-full last:rounded-r-full', tone(segment.tone).bar)}
              style={{ width: `${(segment.value / gesamt) * 100}%` }}
            />
          ))}
      </div>
      <ul className="mt-3 grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-center justify-between gap-2 text-xs">
            <span className="flex min-w-0 items-center gap-2">
              <span aria-hidden="true" className={cn('size-2 shrink-0 rounded-full', tone(segment.tone).dot)} />
              <span className="truncate text-ink-2">{segment.label}</span>
            </span>
            <span className="tabular shrink-0 font-medium text-ink">{segment.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
