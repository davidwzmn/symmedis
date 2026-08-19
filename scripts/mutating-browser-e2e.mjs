import { spawn } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE_URL = (process.env.E2E_BASE_URL || 'http://127.0.0.1:4176').replace(/\/$/, '')
const CHROME = process.env.CHROME_BIN || ''
const EMAIL = process.env.E2E_STAFF_EMAIL || ''
const PASSWORD = process.env.E2E_STAFF_PASSWORD || ''
const SUPABASE_URL = 'https://jmxxinrvszwggcxvlwfs.supabase.co'
const PROJECT_ID = 'a551b1c8-55d0-4a90-8897-1408e7a08bac'
const CLIENT_ID = 'cd269a65-a9d0-4d2a-90cd-026706133e57'
const TASK_TITLE = 'Staging: Onboarding-Flow vollständig prüfen'
const REPORT_TITLE = 'Staging Report – nicht freigeben'
const FIXTURE_CONFIRM = 'RESET_SYMMEDIS_E2E'

function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)) }

async function waitFor(fn, timeoutMs = 20000, intervalMs = 200) {
  const start = Date.now()
  let lastError
  while (Date.now() - start < timeoutMs) {
    try {
      const value = await fn()
      if (value) return value
    } catch (error) { lastError = error }
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

async function fixture(cdp, action, extra = {}) {
  const payload = JSON.stringify({ action, projectId: PROJECT_ID, ...extra })
  return cdp.evaluate(`(async () => {
    const raw = localStorage.getItem('symmedis.supabase.session') || '';
    const session = JSON.parse(raw || '{}');
    const token = session.access_token || session.currentSession?.access_token || '';
    if (!token) throw new Error('Keine Staff-Session für Fixture-Aufruf.');
    const response = await fetch('${SUPABASE_URL}/functions/v1/e2e-fixture', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: ${JSON.stringify(payload)}
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error('Fixture ' + ${JSON.stringify(action)} + ' fehlgeschlagen: ' + (body.error || response.status));
    return body;
  })()`)
}

async function clickText(cdp, text, { scopeText = '' } = {}) {
  const found = await cdp.evaluate(`(() => {
    const wanted = ${JSON.stringify(text)};
    const scope = ${JSON.stringify(scopeText)};
    const roots = scope ? [...document.querySelectorAll('div,li,section')].filter((el) => (el.innerText || '').includes(scope)) : [document.body];
    const root = roots.sort((a,b) => (a.innerText || '').length - (b.innerText || '').length)[0] || document.body;
    const candidates = [...root.querySelectorAll('button,a')];
    const target = candidates.find((el) => (el.innerText || '').trim() === wanted) || candidates.find((el) => (el.innerText || '').includes(wanted));
    if (!target) return false;
    target.click();
    return true;
  })()`)
  if (!found) throw new Error(`UI-Aktion nicht gefunden: ${text}${scopeText ? ` in ${scopeText}` : ''}`)
}

async function assertBody(cdp, text) {
  await waitFor(() => cdp.evaluate(`document.body.innerText.includes(${JSON.stringify(text)})`))
}

async function login(cdp) {
  await waitFor(() => cdp.evaluate(`Boolean(document.querySelector('input[type="email"]') && document.querySelector('input[type="password"]'))`))
  const credentials = JSON.stringify({ email: EMAIL, password: PASSWORD })
  await cdp.evaluate(`(() => {
    const credentials = ${credentials};
    const setValue = (input, value) => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true }));
    };
    setValue(document.querySelector('input[type="email"]'), credentials.email);
    setValue(document.querySelector('input[type="password"]'), credentials.password);
    document.querySelector('form button[type="submit"]')?.click();
    return true;
  })()`)
  await waitFor(async () => {
    const state = await cdp.evaluate(`({ href: location.href, body: document.body.innerText, session: localStorage.getItem('symmedis.supabase.session') || '' })`)
    if (state.body.includes('Anmeldung fehlgeschlagen') || state.body.includes('Invalid login credentials')) throw new Error('Staff-Anmeldung wurde abgelehnt.')
    return state.href.includes('/intern/') && state.session.includes('access_token') ? state : null
  }, 25000)
}

async function run() {
  if (!CHROME || !EMAIL || !PASSWORD) throw new Error('CHROME_BIN sowie E2E_STAFF_EMAIL/E2E_STAFF_PASSWORD sind für mutierenden E2E erforderlich.')
  const profileDir = await mkdtemp(join(tmpdir(), 'symmedis-mutating-'))
  const uploadPath = join(profileDir, 'symmedis-e2e-upload.txt')
  await writeFile(uploadPath, `SYMMEDIS E2E ${new Date().toISOString()}\n`, 'utf8')
  const port = 9250
  const chrome = spawn(CHROME, ['--headless=new','--no-sandbox','--disable-gpu','--hide-scrollbars','--window-size=1440,1000',`--remote-debugging-port=${port}`,`--user-data-dir=${profileDir}`,`${BASE_URL}/login?rolle=intern`], { stdio: ['ignore','ignore','pipe'] })
  let cdp
  try {
    cdp = new Cdp(await pageWebSocket(port)); await cdp.ready(); await cdp.send('Runtime.enable'); await cdp.send('Page.enable'); await cdp.send('DOM.enable')
    await login(cdp)

    const preflight = await fixture(cdp, 'reset', { confirm: FIXTURE_CONFIRM })
    if (!preflight.reset) throw new Error('Fixture-Preflight-Reset wurde nicht bestätigt.')
    console.log('✓ Fixture vor Testbeginn selbstheilend zurückgesetzt')

    const before = await fixture(cdp, 'inspect')
    const initialTask = before.fixture.tasks.find((item) => item.title === TASK_TITLE)
    const initialReport = before.fixture.reports.find((item) => item.title === REPORT_TITLE)
    if (!initialTask || initialTask.status !== 'offen') throw new Error('Fixture-Aufgabe ist nicht im erwarteten Ausgangszustand offen.')
    if (!initialReport || initialReport.state !== 'entwurf') throw new Error('Fixture-Report ist nicht im erwarteten Ausgangszustand entwurf.')
    if (before.fixture.documents.length || before.fixture.reportVersions.length) throw new Error('Fixture ist vor Testbeginn nicht sauber zurückgesetzt.')
    console.log('✓ Fixture-Ausgangszustand bestätigt')

    await cdp.evaluate(`location.assign(${JSON.stringify(`${BASE_URL}/intern/kunden/${CLIENT_ID}`)}); true`)
    await assertBody(cdp, 'SYMMEDIS Staging Lab')

    await clickText(cdp, 'Aufgaben')
    await assertBody(cdp, TASK_TITLE)
    const taskClicked = await cdp.evaluate(`(() => {
      const title = ${JSON.stringify(TASK_TITLE)};
      const row = [...document.querySelectorAll('li,div')].filter((el) => (el.innerText || '').includes(title)).sort((a,b) => (a.innerText || '').length-(b.innerText || '').length)[0];
      if (!row) return false;
      const button = row.querySelector('button[aria-label*="weiterschalten"], button');
      if (!button) return false; button.click(); return true;
    })()`)
    if (!taskClicked) throw new Error('Fixture-Aufgabe konnte in der UI nicht weitergeschaltet werden.')
    await waitFor(async () => {
      const state = await fixture(cdp, 'inspect')
      return state.fixture.tasks.find((item) => item.title === TASK_TITLE)?.status !== 'offen'
    })
    console.log('✓ Aufgabenstatus über UI persistiert')

    await clickText(cdp, 'Dokumente')
    await assertBody(cdp, 'Dokumente')
    const document = await cdp.send('DOM.getDocument', { depth: -1, pierce: true })
    const input = await cdp.send('DOM.querySelector', { nodeId: document.root.nodeId, selector: 'input[type="file"]' })
    if (!input.nodeId) throw new Error('Dokument-Upload-Feld wurde nicht gefunden.')
    await cdp.send('DOM.setFileInputFiles', { nodeId: input.nodeId, files: [uploadPath] })
    await cdp.evaluate(`document.querySelector('input[type="file"]')?.dispatchEvent(new Event('change', { bubbles: true })); true`)
    await waitFor(async () => (await fixture(cdp, 'inspect')).fixture.documents.length === 1, 30000)
    console.log('✓ Dokument über UI hochgeladen und registriert')

    await clickText(cdp, 'Berichte')
    await assertBody(cdp, REPORT_TITLE)
    await clickText(cdp, 'Freigabe prüfen', { scopeText: REPORT_TITLE })
    await assertBody(cdp, 'Jetzt final freigeben')
    await clickText(cdp, 'Jetzt final freigeben', { scopeText: REPORT_TITLE })
    await waitFor(async () => {
      const state = await fixture(cdp, 'inspect')
      const report = state.fixture.reports.find((item) => item.title === REPORT_TITLE)
      return report?.state === 'final' && state.fixture.reportVersions.length === 1
    }, 30000)
    console.log('✓ Report über UI finalisiert und versioniert')
  } finally {
    if (cdp) {
      try {
        const reset = await fixture(cdp, 'reset', { confirm: FIXTURE_CONFIRM })
        if (!reset.reset) throw new Error('Fixture-Reset wurde nicht bestätigt.')
        console.log('✓ E2E-Fixture vollständig zurückgesetzt')
      } catch (error) {
        console.error('KRITISCH: Fixture-Reset fehlgeschlagen:', error instanceof Error ? error.message : error)
        process.exitCode = 1
      }
      cdp.close()
    }
    chrome.kill('SIGTERM')
    await sleep(250)
    await rm(profileDir, { recursive: true, force: true })
  }
}

await run()
