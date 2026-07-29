import { Reveal } from '../ui/Reveal.jsx'

export function SectionHeading({ label, headline, text, headlineId, align = 'left' }) {
  const alignment = align === 'center' ? 'mx-auto text-center' : ''
  return (
    <div className={`max-w-2xl ${alignment}`}>
      <Reveal as="p" className="eyebrow">
        {label}
      </Reveal>
      <Reveal
        as="h2"
        delay={60}
        id={headlineId}
        className="mt-4 text-[1.75rem] leading-[1.2] sm:text-[2.125rem]"
      >
        {headline}
      </Reveal>
      {text ? (
        <Reveal as="p" delay={120} className="mt-5 text-[1.0625rem] leading-relaxed prose-muted">
          {text}
        </Reveal>
      ) : null}
    </div>
  )
}
