/**
 * Icon-Set als Inline-SVG – keine externen Requests, keine Icon-Font.
 * Einheitlich 24×24, Strichstärke 1.7, `currentColor`.
 * Icons sind dekorativ (`aria-hidden`); die Bedeutung trägt immer der Text daneben.
 */

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
  'aria-hidden': 'true',
  focusable: 'false',
}

export function IconGrid(p) {
  return (
    <svg {...S} {...p}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
    </svg>
  )
}

export function IconChart(p) {
  return (
    <svg {...S} {...p}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  )
}

export function IconPulse(p) {
  return (
    <svg {...S} {...p}>
      <path d="M2.5 12.5h4l2-6 3.5 12 2.5-8 1.8 3.5h5.2" />
    </svg>
  )
}

export function IconShare(p) {
  return (
    <svg {...S} {...p}>
      <circle cx="6" cy="12" r="2.6" />
      <circle cx="17.5" cy="6" r="2.6" />
      <circle cx="17.5" cy="18" r="2.6" />
      <path d="m8.4 10.9 6.8-3.6M8.4 13.1l6.8 3.6" />
    </svg>
  )
}

export function IconFolder(p) {
  return (
    <svg {...S} {...p}>
      <path d="M3.5 7.5a2 2 0 0 1 2-2h3.4l2 2.6h7.6a2 2 0 0 1 2 2v8.4a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z" />
    </svg>
  )
}

export function IconRoute(p) {
  return (
    <svg {...S} {...p}>
      <circle cx="5.5" cy="6" r="2.3" />
      <circle cx="18.5" cy="18" r="2.3" />
      <path d="M5.5 8.5v4a3.5 3.5 0 0 0 3.5 3.5h6.8" />
      <path d="M13 5.5h4a1.8 1.8 0 0 1 0 3.6h-1" />
    </svg>
  )
}

export function IconCheckSquare(p) {
  return (
    <svg {...S} {...p}>
      <path d="M20 11.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
      <path d="m8.5 11.5 3 3 8-8.5" />
    </svg>
  )
}

export function IconDocument(p) {
  return (
    <svg {...S} {...p}>
      <path d="M13.5 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z" />
      <path d="M13.5 3.5V9H19" />
      <path d="M8.5 13h7M8.5 16.5h4.5" />
    </svg>
  )
}

export function IconChat(p) {
  return (
    <svg {...S} {...p}>
      <path d="M20 12.2A6.7 6.7 0 0 1 13.3 19H8l-4 3v-4.6A6.7 6.7 0 0 1 8 5h5.3A6.7 6.7 0 0 1 20 11.7Z" />
    </svg>
  )
}

export function IconCalendar(p) {
  return (
    <svg {...S} {...p}>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8.5 3.5v4M15.5 3.5v4" />
    </svg>
  )
}

export function IconSettings(p) {
  return (
    <svg {...S} {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
    </svg>
  )
}

export function IconUsers(p) {
  return (
    <svg {...S} {...p}>
      <circle cx="9" cy="8.5" r="3.3" />
      <path d="M3.5 19.5c.8-3.2 2.9-4.9 5.5-4.9s4.7 1.7 5.5 4.9" />
      <path d="M16.5 5.6a3.3 3.3 0 0 1 0 6.4" />
      <path d="M17.5 14.9c2.1.5 3.5 2 4 4.6" />
    </svg>
  )
}

export function IconUser(p) {
  return (
    <svg {...S} {...p}>
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M5 20c.9-3.5 3.6-5.4 7-5.4s6.1 1.9 7 5.4" />
    </svg>
  )
}

export function IconBuilding(p) {
  return (
    <svg {...S} {...p}>
      <path d="M4 20.5V5a1.5 1.5 0 0 1 1.5-1.5h7A1.5 1.5 0 0 1 14 5v15.5" />
      <path d="M14 9.5h4.5A1.5 1.5 0 0 1 20 11v9.5" />
      <path d="M2.5 20.5h19M7 7.5h4M7 11h4M7 14.5h4M17 13h1M17 16.5h1" />
    </svg>
  )
}

export function IconShield(p) {
  return (
    <svg {...S} {...p}>
      <path d="M12 3.5 19.5 6v6c0 4.2-3 7.4-7.5 8.5C7.5 19.4 4.5 16.2 4.5 12V6Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </svg>
  )
}

export function IconBell(p) {
  return (
    <svg {...S} {...p}>
      <path d="M18 8.5a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5Z" />
      <path d="M13.7 19a2 2 0 0 1-3.4 0" />
    </svg>
  )
}

export function IconSearch(p) {
  return (
    <svg {...S} {...p}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.4-4.4" />
    </svg>
  )
}

export function IconFilter(p) {
  return (
    <svg {...S} {...p}>
      <path d="M3.5 6h17M6.5 12h11M10 18h4" />
    </svg>
  )
}

export function IconPlus(p) {
  return (
    <svg {...S} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function IconClose(p) {
  return (
    <svg {...S} {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

export function IconMenu(p) {
  return (
    <svg {...S} {...p}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function IconCheck(p) {
  return (
    <svg {...S} {...p}>
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  )
}

export function IconCheckCircle(p) {
  return (
    <svg {...S} {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.2 12.2 2.6 2.6 5-5.4" />
    </svg>
  )
}

export function IconAlert(p) {
  return (
    <svg {...S} {...p}>
      <path d="M12 4.5 21 20H3z" />
      <path d="M12 10v4.2" />
      <circle cx="12" cy="17.2" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconInfo(p) {
  return (
    <svg {...S} {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11.2v5" />
      <circle cx="12" cy="8.2" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconClock(p) {
  return (
    <svg {...S} {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </svg>
  )
}

export function IconChevronRight(p) {
  return (
    <svg {...S} {...p}>
      <path d="m9 5 7 7-7 7" />
    </svg>
  )
}

export function IconChevronDown(p) {
  return (
    <svg {...S} {...p}>
      <path d="m5 9 7 7 7-7" />
    </svg>
  )
}

export function IconArrowRight(p) {
  return (
    <svg {...S} {...p}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  )
}

export function IconArrowUpRight(p) {
  return (
    <svg {...S} {...p}>
      <path d="M7 17 17 7M8.5 7H17v8.5" />
    </svg>
  )
}

export function IconTrendUp(p) {
  return (
    <svg {...S} {...p}>
      <path d="m3.5 16.5 5.5-5.5 3.5 3.5 7-7.5" />
      <path d="M15 7h4.5v4.5" />
    </svg>
  )
}

export function IconTrendDown(p) {
  return (
    <svg {...S} {...p}>
      <path d="m3.5 7.5 5.5 5.5 3.5-3.5 7 7.5" />
      <path d="M15 17h4.5v-4.5" />
    </svg>
  )
}

export function IconUpload(p) {
  return (
    <svg {...S} {...p}>
      <path d="M4.5 15v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3" />
      <path d="M12 3.5v11M8 7.5l4-4 4 4" />
    </svg>
  )
}

export function IconDownload(p) {
  return (
    <svg {...S} {...p}>
      <path d="M4.5 15v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3" />
      <path d="M12 14.5v-11M8 10.5l4 4 4-4" />
    </svg>
  )
}

export function IconEdit(p) {
  return (
    <svg {...S} {...p}>
      <path d="M4 20h4l10-10a2.4 2.4 0 0 0-3.4-3.4L4.6 16.6z" />
      <path d="m14 7 3 3" />
    </svg>
  )
}

export function IconEye(p) {
  return (
    <svg {...S} {...p}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  )
}

export function IconEyeOff(p) {
  return (
    <svg {...S} {...p}>
      <path d="M9.6 6a8.6 8.6 0 0 1 2.4-.3c6 0 9.5 6.3 9.5 6.3a15 15 0 0 1-2.7 3.4M6.2 7.8A15 15 0 0 0 2.5 12s3.5 6.3 9.5 6.3c1.5 0 2.8-.3 4-.8" />
      <path d="m4 4 16 16" />
    </svg>
  )
}

export function IconLock(p) {
  return (
    <svg {...S} {...p}>
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2" />
      <path d="M8 10.5V8a4 4 0 1 1 8 0v2.5" />
    </svg>
  )
}

export function IconLogout(p) {
  return (
    <svg {...S} {...p}>
      <path d="M15 4.5h2.5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H15" />
      <path d="M10 8.5 6 12l4 3.5M6 12h9" />
    </svg>
  )
}

export function IconSun(p) {
  return (
    <svg {...S} {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
    </svg>
  )
}

export function IconMoon(p) {
  return (
    <svg {...S} {...p}>
      <path d="M20 14.5A8.2 8.2 0 0 1 9.5 4 8.3 8.3 0 1 0 20 14.5Z" />
    </svg>
  )
}

export function IconSparkles(p) {
  return (
    <svg {...S} {...p}>
      <path d="M12 4.5 13.6 9 18 10.5 13.6 12 12 16.5 10.4 12 6 10.5 10.4 9Z" />
      <path d="m18.5 15.5.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7Z" />
    </svg>
  )
}

export function IconTarget(p) {
  return (
    <svg {...S} {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconLayers(p) {
  return (
    <svg {...S} {...p}>
      <path d="m12 3.5 8.5 4.3-8.5 4.4-8.5-4.4z" />
      <path d="m3.5 12.2 8.5 4.3 8.5-4.3M3.5 16.4l8.5 4.3 8.5-4.3" />
    </svg>
  )
}

export function IconList(p) {
  return (
    <svg {...S} {...p}>
      <path d="M8.5 6.5h12M8.5 12h12M8.5 17.5h12" />
      <circle cx="4.4" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="4.4" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="4.4" cy="17.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconKanban(p) {
  return (
    <svg {...S} {...p}>
      <rect x="3.5" y="4.5" width="5" height="15" rx="1.4" />
      <rect x="10" y="4.5" width="5" height="10" rx="1.4" />
      <rect x="16.5" y="4.5" width="4" height="13" rx="1.4" />
    </svg>
  )
}

export function IconRefresh(p) {
  return (
    <svg {...S} {...p}>
      <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.7" />
      <path d="M20 4.5v4.2h-4.2" />
      <path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.3" />
      <path d="M4 19.5v-4.2h4.2" />
    </svg>
  )
}

export function IconSend(p) {
  return (
    <svg {...S} {...p}>
      <path d="M4.5 12 20 4.5 15.5 20l-4-6.5z" />
    </svg>
  )
}

export function IconLink(p) {
  return (
    <svg {...S} {...p}>
      <path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 1 0-5.7-5.7l-1.3 1.3" />
      <path d="M13.5 10.5a4 4 0 0 0-5.7 0l-2.6 2.6a4 4 0 1 0 5.7 5.7l1.3-1.3" />
    </svg>
  )
}

export function IconFlag(p) {
  return (
    <svg {...S} {...p}>
      <path d="M5.5 20.5V4.5h10l-1.5 3.5 1.5 3.5h-10" />
    </svg>
  )
}

export function IconHistory(p) {
  return (
    <svg {...S} {...p}>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
      <path d="M3.5 4.5V9H8" />
      <path d="M12 7.8V12l3 1.8" />
    </svg>
  )
}

export function IconNote(p) {
  return (
    <svg {...S} {...p}>
      <path d="M5 5.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v9l-5 5H7a2 2 0 0 1-2-2z" />
      <path d="M19 14.5h-3.5a1.5 1.5 0 0 0-1.5 1.5v3.5" />
      <path d="M8.5 9h7M8.5 12.5h4" />
    </svg>
  )
}

export function IconCommand(p) {
  return (
    <svg {...S} {...p}>
      <path d="M9 6.5a2.5 2.5 0 1 0-2.5 2.5H17a2.5 2.5 0 1 0-2.5-2.5v11a2.5 2.5 0 1 0 2.5-2.5H7a2.5 2.5 0 1 0 2.5 2.5z" />
    </svg>
  )
}

export function IconMail(p) {
  return (
    <svg {...S} {...p}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m3.5 7.5 8.5 6 8.5-6" />
    </svg>
  )
}

export function IconVideo(p) {
  return (
    <svg {...S} {...p}>
      <rect x="3" y="6" width="12" height="12" rx="2" />
      <path d="m15 11 6-3.5v9L15 13z" />
    </svg>
  )
}

export function IconTrash(p) {
  return (
    <svg {...S} {...p}>
      <path d="M4.5 6.5h15M9.5 6.5V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v1.5" />
      <path d="M6.5 6.5 7.4 19a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5l.9-12.5" />
    </svg>
  )
}
