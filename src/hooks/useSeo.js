import { useEffect } from 'react'

/**
 * Route-spezifische Meta-Angaben (Title, Description, Open Graph) für die
 * öffentliche Website. Setzt zusätzlich das robots-Tag:
 *
 *   VITE_PUBLIC_LAUNCH === 'true'  → index, follow
 *   sonst                         → noindex, nofollow  (Standard, Vor-Launch)
 *
 * VITE_SITE_URL erzeugt – falls gesetzt – kanonische und og:url-Angaben.
 * Die Hash-Routen bleiben unangetastet; es werden nur <head>-Tags gepflegt.
 */

const SITE_URL = (import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '')
const PUBLIC_LAUNCH = import.meta.env.VITE_PUBLIC_LAUNCH === 'true'
const STANDARD_TITEL = 'SYMMEDIS – Strategische Ursachenanalyse für Gesundheitsunternehmen'

function upsertMeta(kind, key, content) {
  const selector = `meta[${kind}="${key}"]`
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(kind, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export function useSeo({ title, description, path } = {}) {
  useEffect(() => {
    const voll = title || STANDARD_TITEL
    document.title = voll
    upsertMeta('property', 'og:title', voll)
    if (description) {
      upsertMeta('name', 'description', description)
      upsertMeta('property', 'og:description', description)
    }
    upsertMeta('name', 'robots', PUBLIC_LAUNCH ? 'index, follow' : 'noindex, nofollow')

    if (SITE_URL && path) {
      const url = `${SITE_URL}/#${path}`
      upsertMeta('property', 'og:url', url)
      upsertCanonical(url)
    }
  }, [title, description, path])
}
