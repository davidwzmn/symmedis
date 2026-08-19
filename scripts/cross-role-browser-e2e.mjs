import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE_URL = (process.env.E2E_BASE_URL || 'http://127.0.0.1:4176').replace(/\/$/, '')
const CHROME = process.env.CHROME_BIN || ''
const STAFF_EMAIL = process.env.E2E_STAFF_EMAIL || ''
const STAFF_PASSWORD = process.env.E2E_STAFF_PASSWORD || ''
const CUSTOMER_EMAIL = process.env.E2E_CUSTOMER_EMAIL || ''
const CUSTOMER_PASSWORD = process.env.E2E_CUSTOMER_PASSWORD || ''
const SUPABASE_URL = 'https://jmxxinrvszwggcxvlwfs.supabase.co'
const PROJECT_ID = 'a551b1c8-55d0-4a90-8897-1408e7a08bac'
const CLIENT_ID = 'cd269a65-a9d0-4d2a-90cd-026706133e57'
const STAFF_TASK_ID = '72e4af65-806c-44ad-9e03-4f5393a97d19'
const CUSTOMER_TASK_ID = '9d0d9f33-0ce2-4b8c-9d67-4f27791913c5'
const STAFF_TASK_TITLE = 'Staging: Onboarding-Flow vollständig prüfen'
const CUSTOMER_TASK_TITLE = 'Staging: Kunden-Aufgabe vollständig prüfen'
const REPORT_TITLE = 'Staging Report – nicht freigeben'
const FIXTURE_CONFIRM = 'RESET_SYMMEDIS_E2E'
const UPLOAD_NAME = 'symmedis-cross-role-e2e.txt'

function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)) }

async function waitFor(fn, timeoutMs = 25000, intervalMs = 200) {
  const started = Date.now()
  let lastError
  while (Date.now() - started < timeoutMs) {
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

async function startBrowser({ port, profileDir, loginPath }) {
  const chrome = spawn(CHROME, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
    '--window-size=1440,1000', `--remote-debugging-port=${port}`, `--user-data-dir=${profileDir}`,
    `${BASE_URL}${loginPath}`,
  ], { stdio: ['ignore', 'ignore', 'pipe'] })
  const cdp = new Cdp(await pageWebSocket(port))
  await cdp.ready()
  await cdp.send('Runtime.enable')
  await cdp.send('Page.enable')
  await cdp.send('DOM.enable')
  return { chrome, cdp }
}

async function login(cdp, { email, password, expectedPath, label }) {
  await waitFor(() => cdp.evaluate(`Boolean(document.querySelector('input[type="email"]') && document.querySelector('input[type="password"]'))`))
  const credentials = JSON.stringify({ email, password })
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
    document.querySelector('form button[type="submit"]')?.click();
    return true;
  })()`)
  await waitFor(async () => {
    const state = await cdp.evaluate(`({ href: location.href, body: document.body.innerText, session: localStorage.getItem('symmedis.supabase.session') || '' })`)
    if (state.body.includes('Anmeldung fehlgeschlagen') || state.body.includes('Invalid login credentials')) throw new Error(`${label}: Anmeldung wurde abgelehnt.`)
    if (state.body.includes('Workspace konnte nicht geladen werden')) throw new Error(`${label}: Workspace konnte nicht geladen werden.`)
    return state.href.includes(expectedPath) && state.session.includes('access_token') ? state : null
  }, 30000)
}

async function fixture(staffCdp, action, extra = {}) {
  const payload = JSON.stringify({ action, projectId: PROJECT_ID, ...extra })
  return staffCdp.evaluate(`(async () => {
    const session = JSON.parse(localStorage.getItem('symmedis.supabase.session') || '{}');
    const token = session.access_token || '';
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
    const roots = scope ? [...document.querySelectorAll('div,li,section,tr')].filter((el) => (el.innerText || '').includes(scope)) : [document.body];
    const root = roots.sort((a,b) => (a.innerText || '').length - (b.innerText || '').length)[0] || document.body;
    const candidates = [...root.querySelectorAll('button,a')];
    const target = candidates.find((el) => (el.innerText || '').trim() === wanted) || candidates.find((el) => (el.innerText || '').includes(wanted));
    if (!target) return false;
    target.click(); return true;
  })()`)
  if (!found) throw new Error(`UI-Aktion nicht gefunden: ${text}${scopeText ? ` in ${scopeText}` : ''}`)
}

async function clickRoute(cdp, path) {
  const clicked = await cdp.evaluate(`(() => {
    const path = ${JSON.stringify(path)};
    const link = [...document.querySelectorAll('a[href]')].find((item) => {
      const href = item.getAttribute('href') || '';
      return href === path || new URL(item.href, location.href).pathname === path;
    });
    if (!link) return false;
    link.click(); return true;
  })()`)
  if (!clicked) throw new Error(`Navigationslink fehlt: ${path}`)
  await waitFor(() => cdp.evaluate(`location.pathname === ${JSON.stringify(path)}`))
}

async function assertBody(cdp, text) {
  await waitFor(() => cdp.evaluate(`document.body.innerText.includes(${JSON.stringify(text)})`))
}

async function setDownloadDirectory(cdp, path) {
  try {
    await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: path, eventsEnabled: true })
  } catch {
    await cdp.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: path })
  }
}

async function waitForDownloadedFile(dir, expectedName) {
  return waitFor(async () => {
    const files = await readdir(dir).catch(() => [])
    const file = files.find((name) => name === expectedName || name.startsWith(expectedName))
    if (!file || file.endsWith('.crdownload')) return null
    const content = await readFile(join(dir, file), 'utf8').catch(() => '')
    return content.includes('SYMMEDIS CROSS ROLE E2E') ? file : null
  }, 30000)
}

async function assertCustomerTaskOwnership(customerCdp) {
  await assertBody(customerCdp, CUSTOMER_TASK_TITLE)
  await assertBody(customerCdp, STAFF_TASK_TITLE)
  const ownership = await customerCdp.evaluate(`(() => {
    const findButton = (title) => [...document.querySelectorAll('button[aria-label]')].find((button) => (button.getAttribute('aria-label') || '').includes(title));
    const customer = findButton(${JSON.stringify(CUSTOMER_TASK_TITLE)});
    const staff = findButton(${JSON.stringify(STAFF_TASK_TITLE)});
    return { customerExists: Boolean(customer), customerDisabled: Boolean(customer?.disabled), staffExists: Boolean(staff), staffDisabled: Boolean(staff?.disabled) };
  })()`)
  if (!ownership.customerExists || ownership.customerDisabled) throw new Error('Customer-E2E: kundenverantwortliche Aufgabe ist nicht änderbar.')
  if (!ownership.staffExists || !ownership.staffDisabled) throw new Error('Customer-E2E: SYMMEDIS-Aufgabe ist für Kunden nicht read-only.')
  const clicked = await customerCdp.evaluate(`(() => {
    const button = [...document.querySelectorAll('button[aria-label]')].find((item) => (item.getAttribute('aria-label') || '').includes(${JSON.stringify(CUSTOMER_TASK_TITLE)}));
    if (!button || button.disabled) return false;
    button.click(); return true;
  })()`)
  if (!clicked) throw new Error('Customer-E2E: Kunden-Aufgabe konnte nicht weitergeschaltet werden.')
}

async function customerUploadAndDownload(customerCdp, uploadPath, downloadDir) {
  await clickRoute(customerCdp, '/portal/dokumente')
  await assertBody(customerCdp, 'Unterlagen hinzufügen')
  const document = await customerCdp.send('DOM.getDocument', { depth: -1, pierce: true })
  const input = await customerCdp.send('DOM.querySelector', { nodeId: document.root.nodeId, selector: 'input[type="file"]' })
  if (!input.nodeId) throw new Error('Customer-E2E: Datei-Input fehlt.')
  await customerCdp.send('DOM.setFileInputFiles', { nodeId: input.nodeId, files: [uploadPath] })
  await customerCdp.evaluate(`document.querySelector('input[type="file"]')?.dispatchEvent(new Event('change', { bubbles: true })); true`)
  await assertBody(customerCdp, UPLOAD_NAME)
  await setDownloadDirectory(customerCdp, downloadDir)
  await clickText(customerCdp, 'Laden', { scopeText: UPLOAD_NAME })
  await waitForDownloadedFile(downloadDir, UPLOAD_NAME)
}

async function staffFinalizeReport(staffCdp) {
  await staffCdp.evaluate(`location.assign(${JSON.stringify(`${BASE_URL}/intern/kunden/${CLIENT_ID}`)}); true`)
  await assertBody(staffCdp, 'SYMMEDIS Staging Lab')
  await clickText(staffCdp, 'Berichte')
  await assertBody(staffCdp, REPORT_TITLE)
  await clickText(staffCdp, 'Freigabe prüfen', { scopeText: REPORT_TITLE })
  await assertBody(staffCdp, 'Jetzt final freigeben')
  await clickText(staffCdp, 'Jetzt final freigeben', { scopeText: REPORT_TITLE })
}

async function run() {
  if (!CHROME) throw new Error('CHROME_BIN fehlt.')
  if (!STAFF_EMAIL || !STAFF_PASSWORD || !CUSTOMER_EMAIL || !CUSTOMER_PASSWORD) throw new Error('Cross-Role-E2E benötigt E2E_STAFF_* und E2E_CUSTOMER_* vollständig.')

  const rootDir = await mkdtemp(join(tmpdir(), 'symmedis-cross-role-'))
  const staffDir = join(rootDir, 'staff')
  const customerDir = join(rootDir, 'customer')
  const downloadDir = join(rootDir, 'downloads')
  const uploadPath = join(rootDir, UPLOAD_NAME)
  await Promise.all([mkdir(staffDir, { recursive: true }), mkdir(customerDir, { recursive: true }), mkdir(downloadDir, { recursive: true })])
  await writeFile(uploadPath, `SYMMEDIS CROSS ROLE E2E\n${new Date().toISOString()}\n`, 'utf8')

  let staff
  let customer
  try {
    staff = await startBrowser({ port: 9260, profileDir: staffDir, loginPath: '/login?rolle=intern' })
    await login(staff.cdp, { email: STAFF_EMAIL, password: STAFF_PASSWORD, expectedPath: '/intern/', label: 'Staff' })
    const reset = await fixture(staff.cdp, 'reset', { confirm: FIXTURE_CONFIRM })
    if (!reset.reset) throw new Error('Cross-Role-E2E: Preflight-Reset wurde nicht bestätigt.')
    console.log('✓ Fixture-Baseline vollständig hergestellt')

    customer = await startBrowser({ port: 9261, profileDir: customerDir, loginPath: '/login?rolle=kunde' })
    await login(customer.cdp, { email: CUSTOMER_EMAIL, password: CUSTOMER_PASSWORD, expectedPath: '/portal/', label: 'Customer' })
    await assertBody(customer.cdp, 'SYMMEDIS Staging Lab')

    await clickRoute(customer.cdp, '/portal/aufgaben')
    await assertCustomerTaskOwnership(customer.cdp)
    await waitFor(async () => {
      const state = await fixture(staff.cdp, 'inspect')
      const customerTask = state.fixture.tasks.find((task) => task.id === CUSTOMER_TASK_ID)
      const staffTask = state.fixture.tasks.find((task) => task.id === STAFF_TASK_ID)
      return customerTask?.status === 'in-arbeit' && staffTask?.status === 'offen'
    })
    console.log('✓ Kunde ändert nur die eigene Aufgabe; SYMMEDIS-Aufgabe bleibt unverändert')

    await customerUploadAndDownload(customer.cdp, uploadPath, downloadDir)
    await waitFor(async () => {
      const state = await fixture(staff.cdp, 'inspect')
      return state.fixture.documents.some((doc) => doc.name === UPLOAD_NAME && doc.source === 'kunde' && doc.customer_visible === true)
    }, 30000)
    console.log('✓ Customer Upload + authentifizierter Download über echte UI erfolgreich')

    await staffFinalizeReport(staff.cdp)
    await waitFor(async () => {
      const state = await fixture(staff.cdp, 'inspect')
      const report = state.fixture.reports.find((item) => item.title === REPORT_TITLE)
      return report?.state === 'final' && state.fixture.reportVersions.length === 1
    }, 30000)
    console.log('✓ Staff finalisiert Report; unveränderliche Version wurde erzeugt')

    await customer.cdp.evaluate(`location.assign(${JSON.stringify(`${BASE_URL}/portal/berichte`)}); true`)
    await assertBody(customer.cdp, REPORT_TITLE)
    await assertBody(customer.cdp, 'Freigegeben')
    await assertBody(customer.cdp, 'Unveränderlich')
    console.log('✓ Kunde sieht nach Reload exakt den finalisierten Report und die archivierte Version')
  } finally {
    if (staff?.cdp) {
      try {
        const reset = await fixture(staff.cdp, 'reset', { confirm: FIXTURE_CONFIRM })
        if (!reset.reset) throw new Error('Finaler Fixture-Reset wurde nicht bestätigt.')
        console.log('✓ Cross-Role-Fixture vollständig zurückgesetzt')
      } catch (error) {
        console.error('KRITISCH: Cross-Role-Fixture-Reset fehlgeschlagen:', error instanceof Error ? error.message : error)
        process.exitCode = 1
      }
    }
    for (const browser of [staff, customer]) {
      if (!browser) continue
      browser.cdp?.close()
      browser.chrome?.kill('SIGTERM')
    }
    await sleep(300)
    await rm(rootDir, { recursive: true, force: true })
  }
}

await run()
