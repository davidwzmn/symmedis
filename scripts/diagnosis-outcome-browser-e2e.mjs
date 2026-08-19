import { spawn } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
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
const ANALYSIS_ITEM_ID = '63e6f8df-c28b-4cc2-9a72-dc9750746f0e'
const FINDING_TEXT = 'E2E: Positionierungs-Finding wartet auf Kundenfreigabe.'
const FIXTURE_CONFIRM = 'RESET_SYMMEDIS_E2E'
const METRIC_LABEL = 'Wirkungskennzahl'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function waitFor(fn, timeoutMs = 30000, intervalMs = 200) {
  const started = Date.now()
  let lastError
  while (Date.now() - started < timeoutMs) {
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
      const timer = setTimeout(() => reject(new Error('Chrome DevTools WebSocket konnte nicht geöffnet werden.')), 15000)
      this.ws.addEventListener('open', () => { clearTimeout(timer); resolve() }, { once: true })
      this.ws.addEventListener('error', () => { clearTimeout(timer); reject(new Error('Chrome DevTools WebSocket-Fehler.')) }, { once: true })
      this.ws.addEventListener('message', (event) => {
        const message = JSON.parse(String(event.data))
        if (!message.id || !this.pending.has(message.id)) return
        const pending = this.pending.get(message.id)
        this.pending.delete(message.id)
        if (message.error) pending.reject(new Error(message.error.message || 'CDP-Fehler'))
        else pending.resolve(message.result)
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
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json`)
      if (!response.ok) return null
      const pages = await response.json()
      return pages.find((item) => item.type === 'page')?.webSocketDebuggerUrl || null
    } catch {
      return null
    }
  }, 25000, 250)
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
  return { chrome, cdp }
}

async function login(cdp, { email, password, expectedPath, label }) {
  await waitFor(() => cdp.evaluate(`Boolean(document.querySelector('input[type="email"]') && document.querySelector('input[type="password"]'))`))
  const credentials = JSON.stringify({ email, password })
  await cdp.evaluate(`(() => {
    const credentials = ${credentials};
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    const setValue = (input, value) => {
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

async function assertBody(cdp, text) {
  await waitFor(() => cdp.evaluate(`document.body.innerText.includes(${JSON.stringify(text)})`))
}

async function assertBodyMissing(cdp, text) {
  const visible = await cdp.evaluate(`document.body.innerText.includes(${JSON.stringify(text)})`)
  if (visible) throw new Error(`Unerwartet sichtbar: ${text}`)
}

async function clickText(cdp, text, scopeText = '') {
  const clicked = await cdp.evaluate(`(() => {
    const wanted = ${JSON.stringify(text)};
    const scope = ${JSON.stringify(scopeText)};
    const roots = scope
      ? [...document.querySelectorAll('div,li,section,article')].filter((el) => (el.innerText || '').includes(scope) && el.querySelector('button,a'))
      : [document.body];
    const root = roots.sort((a,b) => (a.innerText || '').length - (b.innerText || '').length)[0] || document.body;
    const candidates = [...root.querySelectorAll('button,a')];
    const target = candidates.find((el) => (el.innerText || '').trim() === wanted)
      || candidates.find((el) => (el.innerText || '').includes(wanted));
    if (!target || target.disabled) return false;
    target.click();
    return true;
  })()`)
  if (!clicked) throw new Error(`UI-Aktion nicht gefunden: ${text}${scopeText ? ` in ${scopeText}` : ''}`)
}

async function trustedClickText(cdp, text, scopeText = '') {
  const scrollReady = await cdp.evaluate(`(() => {
    const wanted = ${JSON.stringify(text)};
    const scope = ${JSON.stringify(scopeText)};
    const roots = scope
      ? [...document.querySelectorAll('div,li,section,article')].filter((el) => (el.innerText || '').includes(scope) && el.querySelector('button,a'))
      : [document.body];
    const root = roots.sort((a,b) => (a.innerText || '').length - (b.innerText || '').length)[0] || document.body;
    const candidates = [...root.querySelectorAll('button,a')];
    const target = candidates.find((el) => (el.innerText || '').trim() === wanted)
      || candidates.find((el) => (el.innerText || '').includes(wanted));
    if (!target || target.disabled) return false;
    target.scrollIntoView({ block: 'center', inline: 'center' });
    return true;
  })()`)
  if (!scrollReady) throw new Error(`Trusted-Click-Ziel nicht gefunden: ${text}${scopeText ? ` in ${scopeText}` : ''}`)
  await sleep(120)

  const point = await cdp.evaluate(`(() => {
    const wanted = ${JSON.stringify(text)};
    const scope = ${JSON.stringify(scopeText)};
    const roots = scope
      ? [...document.querySelectorAll('div,li,section,article')].filter((el) => (el.innerText || '').includes(scope) && el.querySelector('button,a'))
      : [document.body];
    const root = roots.sort((a,b) => (a.innerText || '').length - (b.innerText || '').length)[0] || document.body;
    const candidates = [...root.querySelectorAll('button,a')];
    const target = candidates.find((el) => (el.innerText || '').trim() === wanted)
      || candidates.find((el) => (el.innerText || '').includes(wanted));
    if (!target || target.disabled) return null;
    const rect = target.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    const hitOk = hit === target || target.contains(hit);
    window.__symmedisTrustedClick = null;
    document.addEventListener('click', (event) => {
      window.__symmedisTrustedClick = {
        trusted: Boolean(event.isTrusted),
        targetText: (event.target?.innerText || event.target?.textContent || '').trim().slice(0, 120),
      };
    }, { capture: true, once: true });
    return { x, y, width: rect.width, height: rect.height, hitOk, hitText: (hit?.innerText || hit?.textContent || '').trim().slice(0, 120) };
  })()`)
  if (!point || point.width <= 0 || point.height <= 0 || !point.hitOk) {
    throw new Error(`Trusted-Click-Hit-Test fehlgeschlagen: ${text}; ${JSON.stringify(point)}`)
  }

  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y })
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', buttons: 1, clickCount: 1 })
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', buttons: 0, clickCount: 1 })
  const observed = await waitFor(() => cdp.evaluate('window.__symmedisTrustedClick'), 3000, 50)
  if (!observed?.trusted) throw new Error(`Browser-Click war nicht trusted: ${text}; ${JSON.stringify(observed)}`)
}

async function measurementEditorState(cdp, horizon = 30) {
  return cdp.evaluate(`(() => {
    const horizonText = ${JSON.stringify(`Tag ${30}`)}.replace('30', String(${horizon}));
    const metricValue = ${JSON.stringify(METRIC_LABEL)};
    const candidates = [...document.querySelectorAll('div,section,article')].filter((el) => {
      const text = el.innerText || '';
      return text.includes(horizonText) && (text.includes('Messpunkt +') || text.includes('Messpunkt speichern'));
    });
    const root = candidates.sort((a,b) => (a.innerText || '').length - (b.innerText || '').length)[0] || null;
    if (!root) return { foundCard: false, foundEditor: false, empty: false };
    const labels = [...root.querySelectorAll('label')];
    const metricLabel = labels.find((label) => (label.innerText || '').trim().startsWith('Kennzahl'));
    let input = metricLabel?.htmlFor ? document.getElementById(metricLabel.htmlFor) : metricLabel?.querySelector('input');
    if (!input && metricLabel?.parentElement) input = metricLabel.parentElement.querySelector('input');
    const text = root.innerText || '';
    return {
      foundCard: true,
      foundEditor: Boolean(input && input.value === metricValue && text.includes('Messpunkt speichern')),
      metricValue: input?.value || '',
      empty: text.includes('Noch kein Messpunkt definiert.'),
      text: text.slice(0, 1200),
    };
  })()`)
}

async function assertMeasurementEditor(cdp, horizon = 30) {
  await waitFor(async () => {
    const state = await measurementEditorState(cdp, horizon)
    if (state.foundEditor) return state
    const body = await cdp.evaluate('document.body.innerText')
    if (String(body).includes('Messpunkt konnte nicht angelegt werden') || String(body).includes('Outcome-Messungen konnten nicht geladen werden')) {
      throw new Error(`Messpunkt-UI meldet Fehler: ${String(body).slice(-1600)}`)
    }
    return null
  }, 12000, 200)
}

async function assertNoMeasurementEditor(cdp, horizon = 30) {
  await waitFor(async () => {
    const state = await measurementEditorState(cdp, horizon)
    return state.foundCard && !state.foundEditor && state.empty ? state : null
  }, 12000, 200)
}

async function setSelectByLabel(cdp, labelText, value) {
  const changed = await cdp.evaluate(`(() => {
    const wantedLabel = ${JSON.stringify(labelText)};
    const wantedValue = ${JSON.stringify(value)};
    const labels = [...document.querySelectorAll('label')];
    const label = labels.find((item) => (item.innerText || '').trim().includes(wantedLabel));
    let select = label?.htmlFor ? document.getElementById(label.htmlFor) : label?.querySelector('select');
    if (!select && label?.parentElement) select = label.parentElement.querySelector('select');
    if (!select) select = [...document.querySelectorAll('select')].find((item) => [...item.options].some((option) => option.value === wantedValue));
    if (!select) return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
    setter.call(select, wantedValue);
    select.dispatchEvent(new Event('input', { bubbles: true }));
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return select.value === wantedValue;
  })()`)
  if (!changed) throw new Error(`Select konnte nicht gesetzt werden: ${labelText}=${value}`)
}

async function setCheckboxByText(cdp, text, checked) {
  const changed = await cdp.evaluate(`(() => {
    const wanted = ${JSON.stringify(text)};
    const checked = ${checked ? 'true' : 'false'};
    const label = [...document.querySelectorAll('label')].find((item) => (item.innerText || '').includes(wanted));
    const input = label?.querySelector('input[type="checkbox"]') || (label?.htmlFor ? document.getElementById(label.htmlFor) : null);
    if (!input) return false;
    if (input.checked !== checked) input.click();
    return input.checked === checked;
  })()`)
  if (!changed) throw new Error(`Checkbox konnte nicht gesetzt werden: ${text}`)
}

async function qualitySectionText(cdp) {
  return cdp.evaluate(`(() => {
    const marker = 'Historische Diagnosequalität';
    const roots = [...document.querySelectorAll('section,article,div')].filter((el) => {
      const text = el.innerText || '';
      return text.includes(marker) && text.includes('Binäre Outcomes');
    });
    return (roots.sort((a,b) => (a.innerText || '').length - (b.innerText || '').length)[0]?.innerText || '');
  })()`)
}

async function assertBinaryOutcomes(cdp, expected) {
  await waitFor(async () => {
    const text = await qualitySectionText(cdp)
    if (!text.includes('Binäre Outcomes')) return null
    return new RegExp(`Binäre Outcomes\\s*${expected}(?:\\s|$)`).test(text) ? text : null
  }, 30000)
}

async function run() {
  if (!CHROME) throw new Error('CHROME_BIN fehlt.')
  if (!STAFF_EMAIL || !STAFF_PASSWORD || !CUSTOMER_EMAIL || !CUSTOMER_PASSWORD) throw new Error('Diagnosis-Outcome-E2E benötigt ephemere E2E-Identitäten vollständig.')

  const rootDir = await mkdtemp(join(tmpdir(), 'symmedis-diagnosis-outcome-'))
  const staffDir = join(rootDir, 'staff')
  const customerDir = join(rootDir, 'customer')
  let staff
  let customer

  try {
    staff = await startBrowser({ port: 9270, profileDir: staffDir, loginPath: '/login?rolle=intern' })
    await login(staff.cdp, { email: STAFF_EMAIL, password: STAFF_PASSWORD, expectedPath: '/intern/', label: 'Staff Outcome' })
    const reset = await fixture(staff.cdp, 'reset', { confirm: FIXTURE_CONFIRM })
    if (!reset.reset) throw new Error('Diagnosis-Outcome-E2E: Preflight-Reset wurde nicht bestätigt.')
    console.log('✓ Outcome-Fixture auf kanonische Baseline zurückgesetzt')

    await staff.cdp.evaluate(`location.assign(${JSON.stringify(`${BASE_URL}/intern/kunden/${CLIENT_ID}`)}); true`)
    await assertBody(staff.cdp, 'SYMMEDIS Staging Lab')
    await clickText(staff.cdp, 'Analyse')
    await assertBody(staff.cdp, FINDING_TEXT)
    await clickText(staff.cdp, FINDING_TEXT)
    await assertBody(staff.cdp, 'Für Kunden freigeben')
    await clickText(staff.cdp, 'Für Kunden freigeben')
    await waitFor(async () => {
      const state = await fixture(staff.cdp, 'inspect')
      const finding = state.fixture.analysis.find((item) => item.id === ANALYSIS_ITEM_ID)
      return finding?.approval_status === 'kunde' && finding?.customer_visible === true
    })
    console.log('✓ Finding für den Customer-Handover freigegeben')

    await staff.cdp.evaluate(`location.assign(${JSON.stringify(`${BASE_URL}/intern/kunden/${CLIENT_ID}`)}); true`)
    await assertBody(staff.cdp, 'SYMMEDIS Staging Lab')
    await clickText(staff.cdp, 'Plan')
    await assertBody(staff.cdp, 'Finding → Intervention → 30/60/90 → Outcome')
    await assertBody(staff.cdp, 'Tag 30')
    await trustedClickText(staff.cdp, 'Messpunkt +', 'Tag 30')
    await assertMeasurementEditor(staff.cdp, 30)
    await setSelectByLabel(staff.cdp, 'Bewertung', 'supports')
    await setCheckboxByText(staff.cdp, 'Für Kunden sichtbar', true)
    await trustedClickText(staff.cdp, 'Messpunkt speichern')
    await assertBody(staff.cdp, 'Diagnose bestätigt')
    await trustedClickText(staff.cdp, 'Outcome bewusst übernehmen')
    console.log('✓ Tag-30-Messpunkt bewertet und Outcome bewusst übernommen; Persistenz wird über Quality + Customer-Handover bewiesen')

    await staff.cdp.evaluate(`location.assign(${JSON.stringify(`${BASE_URL}/intern/analysen`)}); true`)
    await assertBody(staff.cdp, 'Historische Diagnosequalität')
    await assertBinaryOutcomes(staff.cdp, 1)
    await assertBody(staff.cdp, 'Datenbasis im Aufbau')
    console.log('✓ Staff-Qualitäts-RPC zählt exakt ein eingefrorenes binäres Outcome')

    customer = await startBrowser({ port: 9271, profileDir: customerDir, loginPath: '/login?rolle=kunde' })
    await login(customer.cdp, { email: CUSTOMER_EMAIL, password: CUSTOMER_PASSWORD, expectedPath: '/portal/', label: 'Customer Outcome' })
    await customer.cdp.evaluate(`location.assign(${JSON.stringify(`${BASE_URL}/portal/plan`)}); true`)
    await assertBody(customer.cdp, 'Finding → Intervention → 30/60/90 → Outcome')
    await assertBody(customer.cdp, METRIC_LABEL)
    await assertBody(customer.cdp, 'Stützt Diagnose')
    await assertBody(customer.cdp, 'Diagnose bestätigt')
    await assertBodyMissing(customer.cdp, 'Outcome bewusst übernehmen')
    console.log('✓ Separate Customer-Session beweist persistierten, freigegebenen Messbeweis ohne Staff-Review-Aktion')
  } finally {
    if (staff?.cdp) {
      try {
        const reset = await fixture(staff.cdp, 'reset', { confirm: FIXTURE_CONFIRM })
        if (!reset.reset) throw new Error('Finaler Outcome-Fixture-Reset wurde nicht bestätigt.')

        await staff.cdp.evaluate(`location.assign(${JSON.stringify(`${BASE_URL}/intern/analysen`)}); true`)
        await assertBody(staff.cdp, 'Historische Diagnosequalität')
        await assertBinaryOutcomes(staff.cdp, 0)

        await staff.cdp.evaluate(`location.assign(${JSON.stringify(`${BASE_URL}/intern/kunden/${CLIENT_ID}`)}); true`)
        await assertBody(staff.cdp, 'SYMMEDIS Staging Lab')
        await clickText(staff.cdp, 'Plan')
        await assertBody(staff.cdp, 'Finding → Intervention → 30/60/90 → Outcome')
        await assertBody(staff.cdp, 'Tag 30')
        await assertNoMeasurementEditor(staff.cdp, 30)
        console.log('✓ Reset entfernt Outcome, Qualitätszählung und Messpunkt vollständig')
      } catch (error) {
        console.error('KRITISCH: Diagnosis-Outcome-Fixture-Reset/Beweis fehlgeschlagen:', error instanceof Error ? error.message : error)
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
