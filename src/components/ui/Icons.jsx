/**
 * Alle Icons als Inline-SVG – keine externen Requests, keine Icon-Fonts.
 * `aria-hidden`, weil Icons hier immer von Text begleitet werden.
 */

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
  'aria-hidden': 'true',
  focusable: 'false',
}

export function IconArrowRight(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

export function IconCheck(props) {
  return (
    <svg {...base} {...props}>
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  )
}

export function IconClose(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function IconMenu(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function IconSun(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
    </svg>
  )
}

export function IconMoon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M20 14.5A8.2 8.2 0 0 1 9.5 4 8.3 8.3 0 1 0 20 14.5Z" />
    </svg>
  )
}

export function IconTarget(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </svg>
  )
}

export function IconSpeech(props) {
  return (
    <svg {...base} {...props}>
      <path d="M20 12.5A6.5 6.5 0 0 1 13.5 19H8l-4 3v-4.4A6.5 6.5 0 0 1 8 5h5.5a6.5 6.5 0 0 1 6.5 6.5Z" />
      <path d="M9 12h6" />
    </svg>
  )
}

export function IconCompare(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4v16" />
      <path d="M6.5 8 3 14h7L6.5 8Z" />
      <path d="M17.5 8 14 14h7l-3.5-6Z" />
      <path d="M5 5h5M14 5h5" />
    </svg>
  )
}

export function IconPulse(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 12.5h3.8l2-5.5 3.3 11 2.4-7 1.6 3h4.9" />
    </svg>
  )
}

export function IconLock(props) {
  return (
    <svg {...base} {...props}>
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2" />
      <path d="M8 10.5V8a4 4 0 1 1 8 0v2.5" />
    </svg>
  )
}

export function IconUser(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.8 20c.9-3.6 3.7-5.6 7.2-5.6s6.3 2 7.2 5.6" />
    </svg>
  )
}

export function IconTeam(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="9" r="3.2" />
      <path d="M3.5 19c.7-3 2.9-4.7 5.5-4.7S13.8 16 14.5 19" />
      <path d="M16 6.4a3.2 3.2 0 0 1 0 6.2" />
      <path d="M17 14.6c2.1.4 3.6 2 4.1 4.4" />
    </svg>
  )
}

export function IconSend(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 12 20 4.5 15.5 20l-4-6.5L4.5 12Z" />
    </svg>
  )
}

export function IconSparkles(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4.5 13.6 9 18 10.5 13.6 12 12 16.5 10.4 12 6 10.5 10.4 9 12 4.5Z" />
      <path d="M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
    </svg>
  )
}

export function IconCalendar(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8.5 3.5v4M15.5 3.5v4" />
    </svg>
  )
}

export function IconAlert(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4.5 21 20H3l9-15.5Z" />
      <path d="M12 10v4.2" />
      <circle cx="12" cy="17.2" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconRefresh(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.7" />
      <path d="M20 4.5v4.2h-4.2" />
      <path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.3" />
      <path d="M4 19.5v-4.2h4.2" />
    </svg>
  )
}

export function IconDocument(props) {
  return (
    <svg {...base} {...props}>
      <path d="M13.5 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9l-5.5-5.5Z" />
      <path d="M13.5 3.5V9H19" />
      <path d="M8.5 13h7M8.5 16.5h4.5" />
    </svg>
  )
}
