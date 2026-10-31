import { footerNote, references, sections, type CheckItem } from './checklist'
import { ageWarnings } from './rules'
import './style.css'

const KEY = 'sgi-tisi-checklist'
const MARK = `<svg class="mark" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#1b4d3e"/><path d="M8 16.5l5 5 11-12" fill="none" stroke="#f4f0e6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`

type ItemState = {
  done: boolean
  received: string
  expiry: string
  choice: string
}

type CaseFile = {
  id: string
  customer: string
  notes: string
  items: Record<string, ItemState>
}

type Db = {
  version: 1
  activeId: string
  view: 'list' | 'case'
  cases: CaseFile[]
}

type Flash = { kind: 'ok' | 'err'; text: string }

const allItems = sections.flatMap((section) => section.items)

let db = load()
let view: 'list' | 'case' = db.view
let pendingDelete = false
let pendingImport: { cases: CaseFile[]; activeId: string } | null = null
let flash: Flash | null = null

const app = document.querySelector('#app')
if (!app) throw new Error('missing #app')

app.addEventListener('click', (event) => {
  const target = event.target
  if (!(target instanceof Element)) return
  const el = target.closest<HTMLElement>('[data-action]')
  if (!el) return
  const action = el.dataset.action
  if (action === 'noop') return
  if (action === 'create') return createCase()
  if (action === 'open') return openCase(el.dataset.id ?? '')
  if (action === 'back') return showList()
  if (action === 'delete') {
    pendingDelete = true
    render()
    return
  }
  if (action === 'cancel-delete' || action === 'cancel-import') {
    pendingDelete = false
    pendingImport = null
    render()
    return
  }
  if (action === 'confirm-delete') return removeCase()
  if (action === 'confirm-import') return applyImport()
  if (action === 'export') return exportJson()
})

app.addEventListener('input', (event) => {
  const el = event.target
  if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return
  const field = el.dataset.field
  const current = activeCase()
  if (!current || (field !== 'customer' && field !== 'notes')) return
  current[field] = el.value
  save()
})

app.addEventListener('change', (event) => {
  const el = event.target
  if (el instanceof HTMLInputElement && el.type === 'file') {
    void onFile(el)
    return
  }
  if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) return
  const itemId = el.dataset.item
  const current = activeCase()
  if (!itemId || !current) return
  const state = itemState(current, itemId)
  if (el instanceof HTMLInputElement && el.type === 'checkbox') state.done = el.checked
  if (el instanceof HTMLInputElement && el.dataset.field === 'received') state.received = el.value
  if (el instanceof HTMLInputElement && el.dataset.field === 'expiry') state.expiry = el.value
  if (el instanceof HTMLSelectElement) state.choice = el.value
  save()
  render()
})

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || (!pendingDelete && !pendingImport)) return
  pendingDelete = false
  pendingImport = null
  render()
})

render(false)
registerSw()

function emptyItem(): ItemState {
  return { done: false, received: '', expiry: '', choice: '' }
}

function emptyDb(): Db {
  return { version: 1, activeId: '', view: 'list', cases: [] }
}

function load(): Db {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyDb()
    const parsed: unknown = JSON.parse(raw)
    const cases = parseCases(parsed)
    if (!cases) return emptyDb()
    const activeId = readActiveId(parsed)
    const activeOk = cases.some((item) => item.id === activeId) ? activeId : ''
    const storedView = isRecord(parsed) && parsed.view === 'case' && activeOk ? 'case' : 'list'
    return { version: 1, activeId: activeOk, view: storedView, cases }
  } catch {
    return emptyDb()
  }
}

function save(): void {
  db.view = view
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    flash = { kind: 'err', text: 'บันทึกในเครื่องไม่สำเร็จ' }
  }
}

function activeCase(): CaseFile | undefined {
  return db.cases.find((item) => item.id === db.activeId)
}

function itemState(file: CaseFile, id: string): ItemState {
  const current = file.items[id]
  if (current) return current
  const fresh = emptyItem()
  file.items[id] = fresh
  return fresh
}

function todayIso(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function displayName(file: CaseFile): string {
  return file.customer.trim() || 'ยังไม่ระบุชื่อลูกค้า'
}

function countDone(file: CaseFile, items: CheckItem[]): number {
  return items.filter((item) => file.items[item.id]?.done).length
}

function maxAge(item: CheckItem, choice: string): number | null {
  if (item.ageChoices) {
    return item.ageChoices.find((option) => option.id === choice)?.maxAgeYears ?? null
  }
  return item.maxAgeYears ?? null
}

function ruleText(item: CheckItem, choice: string): string {
  if (item.ageChoices) return item.ageChoices.find((option) => option.id === choice)?.rule ?? ''
  return item.rule ?? ''
}

function knownChoice(item: CheckItem, choice: string): string {
  if (!item.ageChoices?.some((option) => option.id === choice)) return ''
  return choice
}

function createCase(): void {
  const file: CaseFile = { id: crypto.randomUUID(), customer: '', notes: '', items: {} }
  db.cases.unshift(file)
  db.activeId = file.id
  pendingDelete = false
  view = 'case'
  save()
  render(false)
  document.querySelector<HTMLInputElement>('#customer')?.focus()
}

function openCase(id: string): void {
  db.activeId = id
  pendingDelete = false
  view = 'case'
  save()
  render(false)
}

function showList(): void {
  view = 'list'
  pendingDelete = false
  save()
  render(false)
}

function removeCase(): void {
  db.cases = db.cases.filter((item) => item.id !== db.activeId)
  db.activeId = ''
  pendingDelete = false
  view = 'list'
  save()
  flash = { kind: 'ok', text: 'ลบเคสแล้ว' }
  render(false)
}

function exportJson(): void {
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `sgi-tisi-checklist-${todayIso()}.json`
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(link.href), 1500)
  flash = { kind: 'ok', text: 'ส่งออกไฟล์แล้ว' }
  render()
}

async function onFile(input: HTMLInputElement): Promise<void> {
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (file.size > 2_000_000) {
    flash = { kind: 'err', text: 'ไฟล์ใหญ่เกินกว่าข้อมูลเช็คลิสต์' }
    render()
    return
  }
  try {
    const parsed: unknown = JSON.parse(await file.text())
    const cases = parseCases(parsed)
    if (!cases) {
      flash = { kind: 'err', text: 'ไฟล์นี้ไม่ใช่ข้อมูลเช็คลิสต์' }
      render()
      return
    }
    pendingImport = { cases, activeId: readActiveId(parsed) }
    pendingDelete = false
    render()
  } catch {
    flash = { kind: 'err', text: 'อ่านไฟล์ไม่สำเร็จ' }
    render()
  }
}

function applyImport(): void {
  if (!pendingImport) return
  const activeId = pendingImport.activeId
  db.cases = pendingImport.cases
  db.activeId = db.cases.some((item) => item.id === activeId) ? activeId : ''
  pendingImport = null
  view = 'list'
  save()
  flash = { kind: 'ok', text: `นำเข้า ${db.cases.length} เคสแล้ว` }
  render(false)
}

function render(keepScroll = true): void {
  if (view === 'case' && !activeCase()) view = 'list'
  const y = keepScroll ? window.scrollY : 0
  app!.innerHTML = `${view === 'list' ? listHtml() : caseHtml()}${dialogHtml()}`
  window.scrollTo(0, y)
  if (pendingDelete || pendingImport) {
    document.querySelector<HTMLButtonElement>('.modal-card button')?.focus()
  }
}

function listHtml(): string {
  const cards = db.cases
    .map((file) => {
      const done = countDone(file, allItems)
      const notes = file.notes.trim().replace(/\s+/g, ' ')
      const snippet = notes ? `<span class="muted">${esc(notes.length > 80 ? `${notes.slice(0, 80)}…` : notes)}</span>` : ''
      return `<button type="button" class="case-card" data-action="open" data-id="${esc(file.id)}">
        <strong>${esc(displayName(file))}</strong>
        ${snippet}
        <p class="meta">ความคืบหน้า ${done} จาก ${allItems.length}</p>
        ${bar(done, allItems.length)}
      </button>`
    })
    .join('')
  const empty = db.cases.length ? '' : '<p class="empty">ยังไม่มีเคส สร้างเคสใหม่ตอนเริ่มคุยกับลูกค้า</p>'
  return `<div class="shell">
    <header class="mast">
      <div class="brand-row">${MARK}<p class="brand">SGI GROUP CO., LTD.</p></div>
      <h1>เช็คลิสต์ใบอนุญาตนำเข้า มอก.</h1>
      <p class="sub">มาตรา 21</p>
    </header>
    <div class="stack">
      ${flashHtml()}
      <button type="button" class="btn" data-action="create">สร้างเคสใหม่</button>
      <div class="tools">${toolsHtml()}</div>
      ${empty}
      ${cards}
    </div>
    ${footerHtml()}
  </div>`
}

function caseHtml(): string {
  const file = activeCase()
  if (!file) return ''
  const done = countDone(file, allItems)
  const blocks = sections
    .map((section) => {
      const sectionDone = countDone(file, section.items)
      const items = section.items.map((item) => itemHtml(file, item)).join('')
      return `<section class="section" id="${esc(section.id)}">
        <div class="sec-top">
          <h2>${esc(section.title)}</h2>
          <p class="count">${sectionDone} จาก ${section.items.length}</p>
        </div>
        ${bar(sectionDone, section.items.length)}
        <div class="items">${items}</div>
      </section>`
    })
    .join('')
  return `<div class="shell">
    <header class="mast">
      <div class="brand-row">${MARK}<p class="brand">SGI GROUP CO., LTD.</p></div>
      <h1>เช็คลิสต์ มอก. มาตรา 21</h1>
    </header>
    <div class="topbar">
      <button type="button" data-action="back">‹ เคสทั้งหมด</button>
      <button type="button" class="danger-text" data-action="delete">ลบเคส</button>
    </div>
    ${flashHtml()}
    <div class="stack">
      <label class="field"><span>ชื่อลูกค้า</span>
        <input id="customer" name="customer" autocomplete="organization" data-field="customer" value="${esc(file.customer)}" />
      </label>
      <label class="field"><span>บันทึก</span>
        <textarea name="notes" rows="2" data-field="notes" placeholder="บันทึกระหว่างคุย">${esc(file.notes)}</textarea>
      </label>
    </div>
    <p class="meta">ความคืบหน้า ${done} จาก ${allItems.length}</p>
    ${bar(done, allItems.length)}
    <nav class="jump" aria-label="ไปยังชุด">
      ${sections.map((section) => `<a href="#${esc(section.id)}">${esc(section.title.split(':')[0])}</a>`).join('')}
    </nav>
    ${blocks}
    <div class="tools case-tools">${toolsHtml()}</div>
    ${footerHtml()}
  </div>`
}

function itemHtml(file: CaseFile, item: CheckItem): string {
  const state = file.items[item.id] ?? emptyItem()
  const choice = knownChoice(item, state.choice)
  const flags = ageWarnings(maxAge(item, choice), state.received, state.expiry, todayIso())
  const chips = chipHtml(item, choice)
  const warns = [
    flags.includes('expiry') ? '<p class="warn" role="alert">เตือน: วันหมดอายุผ่านมาแล้ว</p>' : '',
    flags.includes('age')
      ? `<p class="warn" role="alert">เตือน: วันที่ได้รับเก่ากว่าเกณฑ์ ${esc(ruleText(item, choice))}</p>`
      : '',
  ].join('')
  const hint =
    item.ageChoices && !choice && state.received
      ? '<p class="hint">เลือกประเภทเอกสาร เพื่อเทียบอายุตามเกณฑ์</p>'
      : ''
  const cautionText = item.ageChoices?.find((option) => option.id === choice)?.caution ?? ''
  const caution = cautionText ? `<p class="caution" role="status">${esc(cautionText)}</p>` : ''
  const picker = item.ageChoices
    ? `<label class="field"><span>ประเภทเอกสารที่ใช้</span><select data-item="${esc(item.id)}" data-field="choice">${choiceOptions(item, choice)}</select></label>`
    : ''
  const warnClass = warns ? ' is-warn' : ''
  const cautionClass = caution ? ' is-caution' : ''
  const doneClass = state.done ? ' is-done' : ''
  return `<article class="item${doneClass}${warnClass}${cautionClass}">
    <label class="check">
      <input type="checkbox" data-item="${esc(item.id)}" data-field="done"${state.done ? ' checked' : ''} />
      <span class="check-text">${esc(item.label)}${chips}</span>
    </label>
    ${picker}
    <div class="dates">
      <label class="field"><span>วันที่ได้รับเอกสาร</span>
        <input type="date" data-item="${esc(item.id)}" data-field="received" value="${esc(state.received)}" />
      </label>
      <label class="field"><span>วันหมดอายุ</span>
        <input type="date" data-item="${esc(item.id)}" data-field="expiry" value="${esc(state.expiry)}" />
      </label>
    </div>
    ${hint}${caution}${warns}
  </article>`
}

function chipHtml(item: CheckItem, choice: string): string {
  const chips = item.ageChoices
    ? item.ageChoices.filter((option) => option.rule).map((option) => ({ text: `${option.label} · ${option.rule}`, on: option.id === choice }))
    : item.rule
      ? [{ text: item.rule, on: true }]
      : []
  if (!chips.length) return ''
  return `<span class="chips">${chips
    .map((chip) => `<span class="chip${chip.on ? ' on' : ''}">${esc(chip.text)}</span>`)
    .join('')}</span>`
}

function choiceOptions(item: CheckItem, choice: string): string {
  const head = '<option value="">ยังไม่เลือก</option>'
  const rest = (item.ageChoices ?? [])
    .map((option) => `<option value="${esc(option.id)}"${option.id === choice ? ' selected' : ''}>${esc(option.label)}</option>`)
    .join('')
  return head + rest
}

function toolsHtml(): string {
  return `<button type="button" class="btn secondary" data-action="export">ส่งออก JSON</button>
    <label class="btn secondary file">นำเข้า JSON
      <input type="file" accept="application/json,.json" />
    </label>`
}

function bar(done: number, total: number): string {
  const pct = total ? Math.round((done / total) * 100) : 0
  return `<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}" aria-label="ความคืบหน้า ${done} จาก ${total}"><span style="width:${pct}%"></span></div>`
}

function flashHtml(): string {
  if (!flash) return ''
  const html = `<p class="flash ${flash.kind === 'err' ? 'err' : ''}" role="status">${esc(flash.text)}</p>`
  flash = null
  return html
}

function dialogHtml(): string {
  if (pendingDelete) {
    const name = activeCase() ? displayName(activeCase()!) : ''
    return `<div class="modal" data-action="cancel-delete">
      <div class="modal-card" data-action="noop" role="alertdialog" aria-modal="true" aria-labelledby="dlg-title">
        <h2 id="dlg-title">ลบเคสนี้?</h2>
        <p>ลบ «${esc(name)}» ออกจากเครื่องนี้ ถ้าไม่ได้ส่งออกไฟล์ไว้ก่อน จะกู้คืนไม่ได้</p>
        <div class="stack">
          <button type="button" class="btn" data-action="cancel-delete">ยกเลิก</button>
          <button type="button" class="btn danger" data-action="confirm-delete">ลบเคส</button>
        </div>
      </div>
    </div>`
  }
  if (pendingImport) {
    const names = pendingImport.cases
      .slice(0, 5)
      .map((file) => displayName(file))
      .join(', ')
    const more = pendingImport.cases.length > 5 ? ` และอีก ${pendingImport.cases.length - 5} เคส` : ''
    const detail = names ? ` (${esc(names)}${esc(more)})` : ''
    return `<div class="modal" data-action="cancel-import">
      <div class="modal-card" data-action="noop" role="alertdialog" aria-modal="true" aria-labelledby="dlg-title">
        <h2 id="dlg-title">นำเข้าไฟล์นี้?</h2>
        <p>พบ ${pendingImport.cases.length} เคส${detail} จะแทนที่เคสทั้งหมดในเครื่องนี้</p>
        <div class="stack">
          <button type="button" class="btn" data-action="cancel-import">ยกเลิก</button>
          <button type="button" class="btn danger" data-action="confirm-import">นำเข้าและแทนที่</button>
        </div>
      </div>
    </div>`
  }
  return ''
}

function footerHtml(): string {
  const links = references
    .map((link) => `<li><a href="${esc(link.href)}" target="_blank" rel="noopener noreferrer">${esc(link.label)}</a></li>`)
    .join('')
  return `<footer class="site-foot"><p>${esc(footerNote)}</p><ul>${links}</ul></footer>`
}

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => {
    if (ch === '&') return '&amp;'
    if (ch === '<') return '&lt;'
    if (ch === '>') return '&gt;'
    if (ch === '"') return '&quot;'
    return '&#39;'
  })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function dateOrEmpty(value: unknown): string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : ''
}

function readActiveId(value: unknown): string {
  return isRecord(value) && typeof value.activeId === 'string' ? value.activeId : ''
}

function parseCases(value: unknown): CaseFile[] | null {
  if (!isRecord(value) || !Array.isArray(value.cases)) return null
  const out: CaseFile[] = []
  for (const item of value.cases) {
    const parsed = parseCase(item)
    if (!parsed) return null
    out.push(parsed)
  }
  return out
}

function parseCase(value: unknown): CaseFile | null {
  if (!isRecord(value) || typeof value.id !== 'string' || !value.id) return null
  if (value.customer != null && typeof value.customer !== 'string') return null
  if (value.notes != null && typeof value.notes !== 'string') return null
  const items: Record<string, ItemState> = {}
  if (value.items != null) {
    if (!isRecord(value.items)) return null
    for (const [id, raw] of Object.entries(value.items)) {
      const parsed = parseItem(raw)
      if (!parsed) return null
      items[id] = parsed
    }
  }
  return {
    id: value.id,
    customer: typeof value.customer === 'string' ? value.customer : '',
    notes: typeof value.notes === 'string' ? value.notes : '',
    items,
  }
}

function parseItem(value: unknown): ItemState | null {
  if (!isRecord(value)) return null
  if (value.done != null && typeof value.done !== 'boolean') return null
  if (value.received != null && typeof value.received !== 'string') return null
  if (value.expiry != null && typeof value.expiry !== 'string') return null
  if (value.choice != null && typeof value.choice !== 'string') return null
  return {
    done: value.done === true,
    received: dateOrEmpty(value.received),
    expiry: dateOrEmpty(value.expiry),
    choice: typeof value.choice === 'string' ? value.choice : '',
  }
}

function registerSw(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((err: unknown) => {
    console.error('service worker', err)
  })
}
