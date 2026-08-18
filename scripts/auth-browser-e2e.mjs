import { spawn } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE_URL = (process.env.E2E_BASE_URL || 'http://127.0.0.1:4176').replace(/\/$/, '')
const CHROME = process.env.CHROME_BIN || ''

const scenarios = [
  {
    name: 'staff',
    email: process.env.E2E_STAFF_EMAIL || '',
    password: process.env.E2E_STAFF_PASSWORD || '',
    loginPath: '/login?rolle=intern',
    expectedPath: '/intern/',
    expectedText: process.env.E2E_STAFF_EXPECTED_TEXT || 'SYMMEDIS Staging Lab',
    forbiddenText: 'Geschützter SYMMEDIS-Zugang',
  },
  {
    name: 'customer',
    email: process.env.E2E_CUSTOMER_EMAIL || '',
    password: process.env.E2E_CUSTOMER_PASSWORD || '',
    loginPath: '/login?rolle=kunde',
    expectedPath: '/portal/',
    expectedText: process.env.E2E_CUSTOMER_EXPECTED_TEXT || '',
    forbiddenText: 'Interne Notizen',
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
    if (state.body.includes('Etwas ist schiefgelaufen')) throw new Error(`${scenario.name}: globaler Renderfehler.`)

    console.log(`✓ ${scenario.name}: echte Browser-Session und geschützter Workspace erfolgreich`)
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

if (!configured.length) {
  console.log('::warning::Authentifizierter Browser-E2E ist vorbereitet, aber noch nicht ausführbar: E2E_STAFF_* / E2E_CUSTOMER_* Secrets fehlen.')
  process.exit(0)
}

for (let index = 0; index < configured.length; index += 1) {
  await runScenario(configured[index], 9230 + index)
}
