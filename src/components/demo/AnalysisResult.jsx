import { bewertung, branchenLabel } from '../../lib/analysis.js'
import { IconAlert, IconSparkles } from '../ui/Icons.jsx'

const TON_FARBE = {
  kritisch: 'var(--color-signal-critical)',
  auffaellig: 'var(--color-signal-warn)',
  solide: 'var(--color-signal-ok)',
  stark: 'var(--color-signal-strong)',
}

const TON_BADGE = {
  kritisch:
    'border-[#b4462f]/30 text-[#b4462f] bg-[#b4462f]/6 dark:text-[#e08a72] dark:border-[#e08a72]/35 dark:bg-[#e08a72]/10',
  auffaellig:
    'border-brass-400/40 text-brass-700 bg-brass-50 dark:text-brass-300 dark:border-brass-400/35 dark:bg-brass-400/10',
  solide:
    'border-marine-300 text-marine-700 bg-marine-50 dark:text-marine-300 dark:border-marine-600 dark:bg-marine-900/40',
  stark:
    'border-[#2f7a63]/30 text-[#2f7a63] bg-[#2f7a63]/6 dark:text-[#6fbfa5] dark:border-[#6fbfa5]/35 dark:bg-[#6fbfa5]/10',
}

export function AnalysisResult({ analysis, source, notice, eingabe }) {
  return (
    <div className="px-5 py-6 sm:px-7 sm:py-7">
      {/* Herkunft der Auswertung – transparent ausgewiesen */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6875rem] font-medium tracking-wide ${
            source === 'ki'
              ? 'border-marine-300 bg-marine-50 text-marine-800 dark:border-marine-600 dark:bg-marine-900/50 dark:text-marine-200'
              : 'border-shell-300 bg-shell-100 text-shell-600 dark:border-night-600 dark:bg-night-800 dark:text-night-200'
          }`}
        >
          <IconSparkles className="size-3.5" />
          {source === 'ki' ? 'KI-gestützte Auswertung' : 'Lokales Demo-Modell'}
        </span>
        <span className="rounded-full border border-shell-200 px-2.5 py-1 text-[0.6875rem] text-shell-500 dark:border-night-700 dark:text-night-300">
          Branche: {branchenLabel(eingabe.branche)}
        </span>
        <span className="rounded-full border border-brass-300/60 bg-brass-50 px-2.5 py-1 text-[0.6875rem] text-brass-700 dark:border-brass-400/40 dark:bg-brass-400/10 dark:text-brass-300">
          Beta-Demo · fiktive Daten
        </span>
      </div>

      {notice ? (
        <p className="mt-4 flex items-start gap-2 rounded-sm border border-shell-200 bg-shell-50 px-3.5 py-2.5 text-[0.8125rem] leading-relaxed prose-muted dark:border-night-700 dark:bg-night-800/60">
          <IconAlert className="mt-0.5 size-4 shrink-0 text-brass-500 dark:text-brass-400" />
          {notice}
        </p>
      ) : null}

      {/* Einordnung */}
      <div className="mt-6 border-l-2 border-brass-400 pl-5 dark:border-brass-500">
        <h3 className="text-[0.6875rem] font-semibold tracking-[0.16em] text-brass-600 uppercase dark:text-brass-300">
          Erste Einordnung
        </h3>
        <p className="mt-2.5 text-[1.0625rem] leading-relaxed text-marine-950 dark:text-night-100">
          {analysis.zusammenfassung}
        </p>
      </div>

      {/* Die vier Ursachen-Kategorien */}
      <section className="mt-9" aria-labelledby="analyse-kategorien">
        <h3
          id="analyse-kategorien"
          className="text-[0.6875rem] font-semibold tracking-[0.16em] text-marine-900 uppercase dark:text-night-200"
        >
          Bewertung der vier Ursachen-Kategorien
        </h3>

        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {analysis.kategorien.map((kategorie, index) => {
            const stufe = bewertung(kategorie.score)
            return (
              <li
                key={kategorie.id}
                className="rounded-sm border border-shell-200 p-4 dark:border-night-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-serif text-[0.6875rem] text-brass-600 tabular-nums dark:text-brass-400">
                      {kategorie.nummer}
                    </p>
                    <h4 className="mt-0.5 text-[0.9375rem] leading-snug">{kategorie.name}</h4>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[0.6875rem] font-medium ${TON_BADGE[stufe.ton]}`}
                  >
                    {stufe.label}
                  </span>
                </div>

                <div className="mt-3.5 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-shell-200 dark:bg-night-800">
                    <div
                      className="h-full origin-left rounded-full animate-bar"
                      style={{
                        width: `${kategorie.score}%`,
                        backgroundColor: TON_FARBE[stufe.ton],
                        animationDelay: `${index * 90}ms`,
                      }}
                    />
                  </div>
                  <span className="w-8 text-right font-serif text-[0.8125rem] text-shell-500 tabular-nums dark:text-night-300">
                    {kategorie.score}
                  </span>
                </div>

                <p className="mt-3 text-[0.8125rem] leading-relaxed prose-muted">
                  {kategorie.befund}
                </p>
              </li>
            )
          })}
        </ul>
        <p className="mt-3 text-[0.75rem] prose-muted">
          Reifegrad von 0 bis 100 – je niedriger der Wert, desto stärker bremst diese Kategorie.
        </p>
      </section>

      {/* Die drei größten Umsatzbremsen */}
      <section className="mt-10" aria-labelledby="analyse-bremsen">
        <h3
          id="analyse-bremsen"
          className="text-[0.6875rem] font-semibold tracking-[0.16em] text-marine-900 uppercase dark:text-night-200"
        >
          Die drei größten Umsatzbremsen
        </h3>

        <ol className="mt-5 space-y-4">
          {analysis.umsatzbremsen.map((bremse, index) => (
            <li
              key={bremse.titel}
              className="flex gap-4 rounded-sm border border-shell-200 bg-shell-50 p-4 dark:border-night-700 dark:bg-night-800/50"
            >
              <span
                aria-hidden="true"
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-marine-800 font-serif text-[0.8125rem] text-white dark:bg-marine-400 dark:text-night-950"
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <h4 className="text-[0.9375rem] leading-snug">{bremse.titel}</h4>
                <p className="mt-1.5 text-[0.875rem] leading-relaxed prose-muted">
                  {bremse.begruendung}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 90-Tage-Plan */}
      <section className="mt-10" aria-labelledby="analyse-plan">
        <h3
          id="analyse-plan"
          className="text-[0.6875rem] font-semibold tracking-[0.16em] text-marine-900 uppercase dark:text-night-200"
        >
          Skizze des 90-Tage-Plans
        </h3>

        <ol className="mt-5 grid gap-4 lg:grid-cols-3">
          {analysis.plan.map((phase) => (
            <li
              key={phase.phase}
              className="rounded-sm border border-shell-200 p-4 dark:border-night-700"
            >
              <p className="font-serif text-[0.9375rem] text-marine-900 dark:text-night-100">
                {phase.phase}
              </p>
              <p className="mt-1 text-[0.75rem] font-medium tracking-wide text-brass-600 dark:text-brass-300">
                {phase.fokus}
              </p>
              <ul className="mt-3.5 space-y-2">
                {phase.schritte.map((schritt) => (
                  <li key={schritt} className="flex gap-2.5 text-[0.8125rem] leading-relaxed">
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1 shrink-0 rounded-full bg-shell-400 dark:bg-night-600"
                    />
                    <span className="prose-muted">{schritt}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-9 rounded-sm border border-shell-200 bg-shell-50 px-4 py-3.5 text-[0.75rem] leading-relaxed prose-muted dark:border-night-700 dark:bg-night-800/50">
        Diese Vorschau ist eine automatisierte Skizze aus einer Beta-Demo und ersetzt die
        SYMMEDIS Ursachenanalyse nicht. Im realen Projekt werden Angebotslogik, Kommunikation,
        Vertriebsmaterial und Marktumfeld vollständig gesichtet – die Bewertung nimmt immer unser
        Team vor.
      </p>
    </div>
  )
}
