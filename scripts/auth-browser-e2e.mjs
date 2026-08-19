import { spawn } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE_URL = (process.env.E2E_BASE_URL || 'http://127.0.0.1:4176').replace(/\/$/, '')
const CHROME = process.env.CHROME_BIN || ''
const REQUIRE_AUTH = process.env.E2E_REQUIRE_AUTH === 'true'

const scenarios = [
  {
    name: 'staff',
    email: process.env.E2E_STAFF_EMAIL || '',
    password: process.env.E2E_STAFF_PASSWORD || '',
    loginPath: '/login?rolle=intern',
    expectedPath: '/intern/',
    expectedText: process.env.E2E_STAFF_EXPECTED_TEXT || 'SYMMEDIS Staging Lab',
    requiredTexts: ['Arbeitsfokus', 'Zur Website', 'Abmelden'],
    forbiddenText: 'Geschützter SYMMEDIS-Zugang',
    routeChecks: [
      { path: '/intern/aufgaben', requiredTexts: ['Aufgaben', 'Bei SYMMEDIS'] },
      { path: '/intern/freigaben', requiredTexts: ['Freigaben'] },
      { path: '/intern/dokumente', requiredTexts: ['Dokumente'] },
      { path: '/intern/posteingang', requiredTexts: ['Posteingang'] },
    ],
  },
  {
    name: 'customer',
    email: process.env.E2E_CUSTOMER_EMAIL || '',
    password: process.env.E2E_CUSTOMER_PASSWORD || '',
    loginPath: '/login?rolle=kunde',
    expectedPath: '/portal/',
    expectedText: process.env.E2E_CUSTOMER_EXPECTED_TEXT || '',
    requiredTexts: ['Wo stehen wir, was bremst, was jetzt?', 'Menschlich geprüft'],
    forbiddenText: 'Interne Notizen',
    routeChecks: [
      { path: '/portal/aufgaben', requiredTexts: ['Aufgaben', 'Maßnahmen aus dem 90-Tage-Plan'] },
      { path: '/portal/dokumente', requiredTexts: ['Dokumente', 'Ihre Unterlagen'] },
      { path: '/portal/berichte', requiredTexts: ['Berichte und Export'] },
      { path: '/portal/nachrichten', requiredTexts: ['Nachrichten', 'Direkter, geschützter Projektkanal'] },
    ],
  },
]

function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)) }

async function waitFor(fn, timeoutMs = 15000, intervalMs = 200) {
  const start = Date.now()
  let lastError
  while (Date.now() - start < timeoutMs) {
    try {
      const value = await fn()
      if (value) return value
    } catch (error) {
      lastError = error
    }
    await sleep(intervalMs)
  }
  throw lastError || new Error(`Zeitüberschreitung nach ${timeoutMs} ms`)
}

class Cdp {
  constructor(url) {
    this.ws = new WebSocket(url)
    this.nextId = 1
    this.pending = new Map()
  }

  async ready() {
    if (this.ws.readyState === WebSocket.OPEN) return
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Chrome DevTools WebSocket konnte nicht geöffnet werden.')), 10000)
      this.ws.addEventListener('open', () => { clearTimeout(timer); resolve() }, { once: true })
      this.ws.addEventListener('error', () => { clearTimeout(timer); reject(new Error('Chrome DevTools WebSocket-Fehler.')) }, { once: true })
      this.ws.addEventListener('message', (event) => {
        const message = JSON.parse(String(event.data))
        if (!message.id || !this.pending.has(message.id)) return
        const { resolve: done, reject: fail } = this.pending.get(message.id)
        this.pending.delete(message.id)
        if (message.error) fail(new Error(message.error.message || 'CDP-Fehler'))
        else done(message.result)
      })
    })
  }

  send(method, params = {}) {
    const id = this.nextId++
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }

  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Browser-Auswertung fehlgeschlagen.')
    return result.result?.value
  }

  close() { this.ws.close() }
}

async function pageWebSocket(port) {
  return waitFor(async () => {
    const response = await fetch(`http://127.0.0.1:${port}/json`)
    if (!response.ok) return null
    const pages = await response.json()
    return pages.find((item) => item.type === 'page')?.webSocketDebuggerUrl || null
  }, 12000)
}

async function assertPageState(cdp, scenario, { expectedPath, requiredTexts = [], forbiddenTexts = [] }) {
  return waitFor(async () => {
    const state = await cdp.evaluate(`({ href: location.href, body: document.body.innerText })`)
    if (!state.href.includes(expectedPath)) return null
    if (state.body.includes('Workspace konnte nicht geladen werden')) throw new Error(`${scenario.name}: Workspace-Laden ist fehlgeschlagen.`)
    if (state.body.includes('Etwas ist schiefgelaufen')) throw new Error(`${scenario.name}: globaler Renderfehler.`)
    for (const forbiddenText of forbiddenTexts) {
      if (forbiddenText && state.body.includes(forbiddenText)) {
        throw new Error(`${scenario.name}: verbotener Inhalt sichtbar: ${forbiddenText}`)
      }
    }
    for (const requiredText of requiredTexts) {
      if (requiredText && !state.body.includes(requiredText)) return null
    }
    return state
  }, 20000)
}

async function clickRouteAndAssert(cdp, scenario, check) {
  const clicked = await cdp.evaluate(`(() => {
    const path = ${JSON.stringify(check.path)};
    const links = [...document.querySelectorAll('a[href]')];
    const link = links.find((item) => {
      const href = item.getAttribute('href') || '';
      return href === path || new URL(item.href, location.href).pathname === path;
    });
    if (!link) return false;
    link.click();
    return true;
  })()`)
  if (!clicked) throw new Error(`${scenario.name}: sichtbarer Navigationslink fehlt: ${check.path}`)
  await assertPageState(cdp, scenario, {
    expectedPath: check.path,
    requiredTexts: check.requiredTexts,
    forbiddenTexts: [scenario.forbiddenText, ...(check.forbiddenTexts || [])],
  })
  console.log(`  ✓ ${scenario.name}: Navigation per UI → ${check.path}`)
}

async function assertLogout(cdp, scenario) {
  const clicked = await cdp.evaluate(`(() => {
    const direct = document.querySelector('button[aria-label="Abmelden"]');
    const candidates = [...document.querySelectorAll('button')];
    const button = direct || candidates.find((item) => item.textContent?.trim() === 'Abmelden');
    if (!button) return false;
    button.click();
    return true;
  })()`)
  if (!clicked) throw new Error(`${scenario.name}: Logout-Button fehlt.`)

  const expectedBase = new URL(`${BASE_URL}/`)
  const finalState = await waitFor(async () => {
    const state = await cdp.evaluate(`({
      href: location.href,
      body: document.body.innerText,
      session: localStorage.getItem('symmedis.supabase.session') || ''
    })`)
    if (state.session.includes('access_token')) return null
    if (!state.body.includes('Wachstum stockt selten wegen mangelnder Aktivität')) return null
    return state
  }, 20000)

  const finalUrl = new URL(finalState.href)
  if (finalUrl.origin !== expectedBase.origin || finalUrl.pathname !== expectedBase.pathname) {
    throw new Error(`${scenario.name}: Logout hat die App-Basis verlassen: ${finalState.href}`)
  }
  console.log(`✓ ${scenario.name}: Logout löscht Session und bleibt sicher auf ${expectedBase.pathname}`)
}

async function runScenario(scenario, port) {
  const profileDir = await mkdtemp(join(tmpdir(), `symmedis-${scenario.name}-`))
  const url = `${BASE_URL}${scenario.loginPath}`
  const chrome = spawn(CHROME, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
    '--window-size=1280,900', `--remote-debugging-port=${port}`, `--user-data-dir=${profileDir}`,
    url,
  ], { stdio: ['ignore', 'ignore', 'pipe'] })

  let stderr = ''
  chrome.stderr.on('data', (chunk) => { stderr += String(chunk) })

  try {
    const wsUrl = await pageWebSocket(port)
    const cdp = new Cdp(wsUrl)
    await cdp.ready()
    await cdp.send('Runtime.enable')
    await cdp.send('Page.enable')

    await waitFor(() => cdp.evaluate(`Boolean(document.querySelector('input[type="email"]') && document.querySelector('input[type="password"]'))`))

    const credentials = JSON.stringify({ email: scenario.email, password: scenario.password })
    await cdp.evaluate(`(() => {
      const credentials = ${credentials};
      const setValue = (input, value) => {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setter.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      };
      setValue(document.querySelector('input[type="email"]'), credentials.email);
      setValue(document.querySelector('input[type="password"]'), credentials.password);
      const submit = document.querySelector('form button[type="submit"]');
      if (!submit) throw new Error('Login-Submit fehlt.');
      submit.click();
      return true;
    })()`)

    await waitFor(async () => {
      const state = await cdp.evaluate(`({ href: location.href, body: document.body.innerText })`)
      if (state.body.includes('Anmeldung fehlgeschlagen') || state.body.includes('Invalid login credentials')) {
        throw new Error(`${scenario.name}: Anmeldung wurde abgelehnt.`)
      }
      return state.href.includes(scenario.expectedPath) ? state : null
    }, 20000)

    const state = await waitFor(async () => {
      const value = await cdp.evaluate(`({
        href: location.href,
        body: document.body.innerText,
        session: localStorage.getItem('symmedis.supabase.session') || ''
      })`)
      if (!value.session.includes('access_token')) return null
      if (value.body.includes('Workspace konnte nicht geladen werden')) throw new Error(`${scenario.name}: Workspace-Laden ist fehlgeschlagen.`)
      return value
    }, 20000)

    if (scenario.forbiddenText && state.body.includes(scenario.forbiddenText)) {
      throw new Error(`${scenario.name}: verbotener Inhalt sichtbar: ${scenario.forbiddenText}`)
    }
    if (scenario.expectedText && !state.body.includes(scenario.expectedText)) {
      throw new Error(`${scenario.name}: erwarteter Workspace-Inhalt fehlt: ${scenario.expectedText}`)
    }
    for (const requiredText of scenario.requiredTexts || []) {
      if (!state.body.includes(requiredText)) {
        throw new Error(`${scenario.name}: Portal-UX-Vertrag fehlt im echten Browser: ${requiredText}`)
      }
    }
    if (state.body.includes('Etwas ist schiefgelaufen')) throw new Error(`${scenario.name}: globaler Renderfehler.`)

    console.log(`✓ ${scenario.name}: echte Browser-Session, geschützter Workspace und Portal-UX erfolgreich`)
    for (const check of scenario.routeChecks || []) await clickRouteAndAssert(cdp, scenario, check)
    console.log(`✓ ${scenario.name}: Kernnavigation vollständig per UI erreichbar`)
    await assertLogout(cdp, scenario)
    cdp.close()
  } finally {
    chrome.kill('SIGTERM')
    await sleep(200)
    await rm(profileDir, { recursive: true, force: true })
    if (chrome.exitCode && chrome.exitCode !== 0 && stderr) console.error(stderr.slice(-2000))
  }
}

if (!CHROME) {
  console.error('CHROME_BIN fehlt.')
  process.exit(1)
}

const configured = scenarios.filter((scenario) => scenario.email && scenario.password)
const partial = scenarios.filter((scenario) => Boolean(scenario.email) !== Boolean(scenario.password))
if (partial.length) {
  console.error(`Unvollständige E2E-Credentials für: ${partial.map((scenario) => scenario.name).join(', ')}`)
  process.exit(1)
}

if (REQUIRE_AUTH && configured.length !== scenarios.length) {
  const missing = scenarios.filter((scenario) => !scenario.email || !scenario.password).map((scenario) => scenario.name)
  console.error(`Authentifizierter Release-Gate ist verpflichtend, aber Credentials fehlen für: ${missing.join(', ')}`)
  process.exit(1)
}

if (!configured.length) {
  console.log('::warning::Authentifizierter Browser-E2E ist vorbereitet, aber noch nicht ausführbar: E2E_STAFF_* / E2E_CUSTOMER_* Secrets fehlen.')
  process.exit(0)
}

for (let index = 0; index < configured.length; index += 1) {
  await runScenario(configured[index], 9230 + index)
}
