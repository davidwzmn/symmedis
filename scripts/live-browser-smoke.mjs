import { spawn } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME = process.env.CHROME_BIN || ''
const BASE = (process.env.LIVE_BASE_URL || 'https://davidwzmn.github.io/symmedis/').replace(/\/$/, '')
const EXPECTED_BUILD = process.env.LIVE_EXPECTED_BUILD || ''

const scenarios = [
  { name: 'home-light', hash: '#/', expected: ['Wachstum stockt selten wegen mangelnder Aktivität. Meist fehlt die richtige Diagnose.', 'Diagnosegespräch anfragen', 'Plattform ansehen', 'Menschliche Freigabe statt Blackbox', 'Die Menschen hinter SYMMEDIS'], theme: 'light' },
  { name: 'home-dark', hash: '#/', expected: ['Wachstum stockt selten wegen mangelnder Aktivität. Meist fehlt die richtige Diagnose.', 'Diagnosegespräch anfragen', 'Plattform ansehen', 'Menschliche Freigabe statt Blackbox', 'Die Menschen hinter SYMMEDIS'], theme: 'dark' },
  { name: 'demo', hash: '#/demo/uebersicht', expected: ['Sichere, interaktive Produktdemo', '5-Minuten-Produkttour'], theme: 'light' },
  { name: 'termin', hash: '#/termin', expected: ['Bringen Sie die Wachstumsfrage', 'Diagnosegespräch anfragen'], theme: 'light' },
  { name: 'login', hash: '#/login', expected: ['Geschützter SYMMEDIS-Zugang', 'Kundenportal', 'Mitarbeiterportal'], theme: 'light' },
]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function waitFor(fn, timeoutMs = 30000) {
  const start = Date.now()
  let error
  while (Date.now() - start < timeoutMs) {
    try {
      const value = await fn()
      if (value) return value
    } catch (current) {
      error = current
    }
    await sleep(250)
  }
  throw error || new Error(`Timeout nach ${timeoutMs} ms`)
}

class Cdp {
  constructor(url) {
    this.ws = new WebSocket(url)
    this.id = 1
    this.pending = new Map()
    this.ws.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data))
      if (!message.id || !this.pending.has(message.id)) return
      const pending = this.pending.get(message.id)
      this.pending.delete(message.id)
      if (message.error) pending.reject(new Error(message.error.message || 'CDP-Fehler'))
      else pending.resolve(message.result)
    })
  }

  async ready() {
    if (this.ws.readyState === WebSocket.OPEN) return
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('DevTools-WebSocket nicht geöffnet.')), 15000)
      this.ws.addEventListener('open', () => { clearTimeout(timer); resolve() }, { once: true })
      this.ws.addEventListener('error', () => { clearTimeout(timer); reject(new Error('DevTools-WebSocket-Fehler.')) }, { once: true })
    })
  }

  send(method, params = {}) {
    const id = this.id++
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

async function pageSocket(port) {
  return waitFor(async () => {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json`)
      if (!response.ok) return null
      const targets = await response.json()
      return targets.find((target) => target.type === 'page')?.webSocketDebuggerUrl || null
    } catch {
      return null
    }
  }, 18000)
}

async function verifyTeamPortraits(cdp, scenarioName) {
  await cdp.evaluate(`document.querySelector('[data-team-portrait="David Constantin Waizmann"]')?.scrollIntoView({ block: 'center' }); true`)
  const portraits = await waitFor(() => cdp.evaluate(`(() => {
    const expected = ['Alfred Michael Waizmann', 'David Constantin Waizmann'];
    const result = expected.map((name) => {
      const img = document.querySelector('[data-team-portrait="' + name + '"]');
      return img ? { name, complete: img.complete, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight } : { name, missing: true };
    });
    return result.every((item) => !item.missing && item.complete && item.naturalWidth > 0 && item.naturalHeight > 0) ? result : null;
  })()`), 30000)
  const david = portraits.find((portrait) => portrait.name === 'David Constantin Waizmann')
  if (!david || david.naturalWidth <= 0 || david.naturalHeight <= 0) throw new Error(`${scenarioName}: David-Porträt wurde nicht erfolgreich decodiert.`)
  console.log(`✓ live ${scenarioName}: Team-Porträts geladen (${portraits.map((portrait) => `${portrait.name} ${portrait.naturalWidth}x${portrait.naturalHeight}`).join(', ')})`)
}

async function runScenarioAttempt(scenario, index, attempt) {
  const port = 9340 + (index * 2) + attempt
  const profile = await mkdtemp(join(tmpdir(), `symmedis-live-${scenario.name}-${attempt}-`))
  const targetUrl = `${BASE}/${scenario.hash}?smoke=${Date.now()}`
  console.log(`→ live ${scenario.name}: starte Versuch ${attempt + 1} ${targetUrl}`)
  const chrome = spawn(CHROME, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
    '--window-size=390,844', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
    targetUrl,
  ], { stdio: ['ignore', 'ignore', 'pipe'] })

  let stderr = ''
  chrome.stderr.on('data', (chunk) => { stderr += String(chunk) })

  try {
    const socket = await pageSocket(port)
    const cdp = new Cdp(socket)
    await cdp.ready()
    await cdp.send('Runtime.enable')
    await cdp.send('Page.enable')
    await waitFor(() => cdp.evaluate(`document.readyState !== 'loading' && Boolean(document.querySelector('#root'))`), 45000)

    if (scenario.theme === 'dark') {
      await cdp.evaluate(`localStorage.setItem('symmedis-theme', 'dark'); location.reload(); true`)
      await waitFor(() => cdp.evaluate(`document.readyState !== 'loading' && Boolean(document.querySelector('#root'))`), 45000)
    } else {
      await cdp.evaluate(`localStorage.setItem('symmedis-theme', 'light'); document.documentElement.classList.remove('dark'); true`)
    }

    const state = await waitFor(async () => {
      const value = await cdp.evaluate(`(() => {
        const tinyVisibleText = [...document.querySelectorAll('body *')]
          .filter((el) => {
            const style = getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            const text = (el.childElementCount === 0 ? el.textContent : '').trim();
            return text && rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && parseFloat(style.fontSize) < 10.5;
          })
          .slice(0, 8)
          .map((el) => ({ text: (el.textContent || '').trim().slice(0, 80), size: getComputedStyle(el).fontSize }));
        return {
          ready: document.readyState,
          body: document.body?.innerText || '',
          root: Boolean(document.querySelector('#root')),
          dark: document.documentElement.classList.contains('dark'),
          width: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          href: location.href,
          build: document.querySelector('meta[name="symmedis-build"]')?.getAttribute('content') || '',
          tinyVisibleText
        };
      })()`)
      if (!value.root || value.ready === 'loading') return null
      if (value.body.includes('Etwas ist schiefgelaufen')) throw new Error(`${scenario.name}: globaler Error Boundary sichtbar.`)
      return scenario.expected.every((text) => value.body.includes(text)) ? value : null
    }, 45000)

    if (EXPECTED_BUILD && state.build !== EXPECTED_BUILD) throw new Error(`${scenario.name}: erwarteter Build ${EXPECTED_BUILD}, ausgeliefert ${state.build || 'kein Marker'}.`)
    if ((scenario.theme === 'dark') !== state.dark) throw new Error(`${scenario.name}: Theme ${scenario.theme} wurde nicht aktiv.`)
    if (state.scrollWidth > state.width + 2) {
      const offenders = await cdp.evaluate(`[...document.querySelectorAll('body *')].map((el) => {
        const r = el.getBoundingClientRect();
        return { tag: el.tagName, cls: String(el.className || '').slice(0, 120), text: (el.textContent || '').trim().slice(0, 80), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) };
      }).filter((x) => x.width > 0 && (x.left < -2 || x.right > innerWidth + 2)).slice(0, 8)`)
      throw new Error(`${scenario.name}: horizontaler Mobile-Overflow ${state.scrollWidth}px > ${state.width}px. Kandidaten: ${JSON.stringify(offenders)}`)
    }
    if (state.body.includes('Interaktive Beta-Demo')) throw new Error(`${scenario.name}: veraltete Beta-Copy ist wieder sichtbar.`)
    if (scenario.name.startsWith('home-') && state.tinyVisibleText.length) throw new Error(`${scenario.name}: sichtbarer Text unter 10.5px gefunden: ${JSON.stringify(state.tinyVisibleText)}`)
    if (scenario.name.startsWith('home-')) await verifyTeamPortraits(cdp, scenario.name)
    console.log(`✓ live ${scenario.name}: ${state.width}px viewport, ${state.scrollWidth}px content, ${scenario.theme}, build ${state.build.slice(0, 7) || 'n/a'}`)
    cdp.close()
  } finally {
    chrome.kill('SIGTERM')
    await sleep(250)
    await rm(profile, { recursive: true, force: true })
    if (chrome.exitCode && chrome.exitCode !== 0 && stderr) console.error(stderr.slice(-1500))
  }
}

async function runScenario(scenario, index) {
  let firstError
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await runScenarioAttempt(scenario, index, attempt)
      return
    } catch (error) {
      if (!firstError) firstError = error
      if (attempt === 0) {
        console.warn(`↻ live ${scenario.name}: erster Browser-Versuch fehlgeschlagen (${error instanceof Error ? error.message : error}); neuer isolierter Versuch.`)
        await sleep(750)
        continue
      }
      throw error instanceof Error ? error : firstError
    }
  }
}

if (!CHROME) {
  console.error('CHROME_BIN fehlt.')
  process.exit(1)
}
if (!EXPECTED_BUILD) {
  console.error('LIVE_EXPECTED_BUILD fehlt.')
  process.exit(1)
}
for (let index = 0; index < scenarios.length; index += 1) await runScenario(scenarios[index], index)
