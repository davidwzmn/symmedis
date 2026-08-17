import { IconCheck, IconChart, IconRoute, IconShield, IconTarget } from '../../components/ui/Icons.jsx'

const NODES = [
  { label: 'Positionierung', x: 16, y: 24, tone: 'brand' },
  { label: 'Zielgruppe', x: 68, y: 16, tone: 'accent' },
  { label: 'Website', x: 78, y: 54, tone: 'brand' },
  { label: 'Vertrieb', x: 56, y: 78, tone: 'accent' },
  { label: 'Marktaktivierung', x: 13, y: 68, tone: 'brand' },
]

export function GrowthSystemVisual() {
  return (
    <div className="relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1220] p-5 shadow-2xl shadow-black/20 sm:p-7">
      <div aria-hidden="true" className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(124,156,255,.35), transparent 30%), radial-gradient(circle at 85% 75%, rgba(93,232,196,.22), transparent 28%)' }} />
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.14) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      <div className="relative flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/45">Diagnosis Graph</p>
          <p className="mt-1 text-sm font-semibold text-white">Wachstum als System verstehen</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[0.68rem] font-semibold text-emerald-200">
          <span className="size-1.5 rounded-full bg-emerald-300" /> Evidenz aktiv
        </span>
      </div>

      <div className="relative mt-5 aspect-[1.05] min-h-[340px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
        <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 size-full">
          <defs>
            <linearGradient id="symLine" x1="0" x2="1">
              <stop offset="0" stopColor="rgba(124,156,255,.38)" />
              <stop offset="1" stopColor="rgba(93,232,196,.32)" />
            </linearGradient>
          </defs>
          {NODES.map((node, index) => {
            const next = NODES[(index + 1) % NODES.length]
            return <line key={`${node.label}-${next.label}`} x1={node.x} y1={node.y} x2={next.x} y2={next.y} stroke="url(#symLine)" strokeWidth="0.55" strokeDasharray="2 2" />
          })}
          {NODES.map((node) => <line key={`center-${node.label}`} x1="48" y1="48" x2={node.x} y2={node.y} stroke="rgba(255,255,255,.14)" strokeWidth="0.45" />)}
        </svg>

        <div className="absolute left-1/2 top-1/2 z-10 w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/15 bg-slate-950/80 p-4 text-center shadow-xl backdrop-blur">
          <span className="mx-auto inline-flex size-10 items-center justify-center rounded-xl bg-white text-slate-950"><IconTarget className="size-5" /></span>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-white/45">Priorität #1</p>
          <p className="mt-1 text-sm font-semibold leading-snug text-white">Nutzenargumentation bricht zwischen Website und Vertrieb</p>
          <div className="mt-3 flex items-center justify-center gap-2 text-[0.68rem] text-white/55"><span>Confidence</span><strong className="text-emerald-200">87 %</strong></div>
        </div>

        {NODES.map((node) => (
          <div key={node.label} className="absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-slate-900/90 px-3 py-1.5 text-[0.65rem] font-semibold text-white/80 shadow-lg backdrop-blur" style={{ left: `${node.x}%`, top: `${node.y}%` }}>
            {node.label}
          </div>
        ))}
      </div>

      <div className="relative mt-4 grid grid-cols-3 gap-2">
        <Mini icon={IconChart} label="Diagnose" value="10 Dimensionen" />
        <Mini icon={IconShield} label="Freigabe" value="Human reviewed" />
        <Mini icon={IconRoute} label="Umsetzung" value="90 Tage" />
      </div>

      <div className="relative mt-4 flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-[0.7rem] leading-relaxed text-white/55">
        <IconCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-200" />
        Hypothesen, Evidenz und freigegebene Ergebnisse bleiben sichtbar getrennt.
      </div>
    </div>
  )
}

function Mini({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
      <Icon className="size-4 text-white/55" />
      <p className="mt-2 text-[0.62rem] uppercase tracking-[0.1em] text-white/35">{label}</p>
      <p className="mt-0.5 text-[0.72rem] font-semibold text-white/80">{value}</p>
    </div>
  )
}
