import { IconCheck, IconChart, IconRoute, IconShield, IconTarget } from '../../components/ui/Icons.jsx'

const NODES = [
  { label: 'Positionierung', mobile: 'Position', x: 18, y: 23 },
  { label: 'Zielgruppe', mobile: 'Zielgruppe', x: 69, y: 17 },
  { label: 'Website', mobile: 'Website', x: 78, y: 54 },
  { label: 'Vertrieb', mobile: 'Vertrieb', x: 57, y: 79 },
  { label: 'Marktaktivierung', mobile: 'Aktivierung', x: 18, y: 69 },
]

export function GrowthSystemVisual() {
  return (
    <div className="relative isolate min-w-0 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0b1220] p-4 shadow-2xl shadow-black/20 sm:rounded-[2rem] sm:p-7">
      <div aria-hidden="true" className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(124,156,255,.35), transparent 30%), radial-gradient(circle at 85% 75%, rgba(93,232,196,.22), transparent 28%)' }} />
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.14) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      <div className="relative flex items-start justify-between gap-3 border-b border-white/10 pb-4">
        <div className="min-w-0">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-white/50 sm:text-[0.68rem] sm:tracking-[0.18em]">Diagnosis Graph</p>
          <p className="mt-1 text-xs font-semibold leading-snug text-white sm:text-sm">Wachstum als System verstehen</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-[0.6rem] font-semibold text-emerald-200 sm:px-2.5 sm:text-[0.68rem]">
          <span className="size-1.5 shrink-0 rounded-full bg-emerald-300" /> <span className="hidden min-[380px]:inline">Evidenz </span>aktiv
        </span>
      </div>

      <div className="relative mt-4 aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] sm:mt-5 sm:aspect-[1.05]">
        <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="symLine" x1="0" x2="1">
              <stop offset="0" stopColor="rgba(124,156,255,.38)" />
              <stop offset="1" stopColor="rgba(93,232,196,.32)" />
            </linearGradient>
          </defs>
          {NODES.map((node, index) => {
            const next = NODES[(index + 1) % NODES.length]
            return <line key={`${node.label}-${next.label}`} x1={node.x} y1={node.y} x2={next.x} y2={next.y} stroke="url(#symLine)" strokeWidth="0.55" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
          })}
          {NODES.map((node) => <line key={`center-${node.label}`} x1="48" y1="48" x2={node.x} y2={node.y} stroke="rgba(255,255,255,.14)" strokeWidth="0.45" vectorEffect="non-scaling-stroke" />)}
        </svg>

        <div className="absolute left-1/2 top-1/2 z-10 w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/15 bg-slate-950/85 p-3 text-center shadow-xl backdrop-blur sm:w-[42%] sm:rounded-2xl sm:p-4">
          <span className="mx-auto inline-flex size-8 items-center justify-center rounded-lg bg-white text-slate-950 sm:size-10 sm:rounded-xl"><IconTarget className="size-4 shrink-0 sm:size-5" /></span>
          <p className="mt-2 text-[0.55rem] font-semibold uppercase tracking-[0.1em] text-white/50 sm:mt-3 sm:text-xs sm:tracking-[0.12em]">Priorität #1</p>
          <p className="mt-1 text-[0.72rem] font-semibold leading-snug text-white sm:text-sm">Nutzenargumentation bricht zwischen Website und Vertrieb</p>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[0.58rem] text-white/60 sm:mt-3 sm:gap-2 sm:text-[0.68rem]"><span>Confidence</span><strong className="text-emerald-200">87 %</strong></div>
        </div>

        {NODES.map((node) => (
          <div key={node.label} className="absolute z-20 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-white/15 bg-slate-900/95 px-2 py-1 text-[0.55rem] font-semibold text-white/85 shadow-lg backdrop-blur sm:px-3 sm:py-1.5 sm:text-[0.65rem]" style={{ left: `${node.x}%`, top: `${node.y}%` }}>
            <span className="sm:hidden">{node.mobile}</span><span className="hidden sm:inline">{node.label}</span>
          </div>
        ))}
      </div>

      <div className="relative mt-3 grid grid-cols-3 gap-1.5 sm:mt-4 sm:gap-2">
        <Mini icon={IconChart} label="Diagnose" value="10 Dimensionen" />
        <Mini icon={IconShield} label="Freigabe" value="Human reviewed" />
        <Mini icon={IconRoute} label="Umsetzung" value="90 Tage" />
      </div>

      <div className="relative mt-3 flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-[0.65rem] leading-relaxed text-white/60 sm:mt-4 sm:text-[0.7rem]">
        <IconCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-200" />
        Hypothesen, Evidenz und freigegebene Ergebnisse bleiben sichtbar getrennt.
      </div>
    </div>
  )
}

function Mini({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-white/[0.035] p-2 sm:rounded-xl sm:p-3">
      <Icon className="size-3.5 shrink-0 text-white/60 sm:size-4" />
      <p className="mt-1.5 truncate text-[0.52rem] uppercase tracking-[0.07em] text-white/45 sm:mt-2 sm:text-[0.62rem] sm:tracking-[0.1em]">{label}</p>
      <p className="mt-0.5 break-words text-[0.62rem] font-semibold leading-tight text-white/85 sm:text-[0.72rem]">{value}</p>
    </div>
  )
}
