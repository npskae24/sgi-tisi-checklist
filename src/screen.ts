import { ageWarnings } from './rules'
import { checkedOn, mo51Note, permissionNote, standardById, standards, supplierAdvice } from './standards'
import type { DimCheck, FlowRule, ProductTypeDef, SourceLink, StandardDef } from './standards/types'
import { hsListed, inFlow, judge, parseNum, saleKind } from './screen-rules'

export type Product = {
  id: string
  standardId: string
  typeId: string
  flow: string
  threadSize: string
  hoseMm: string
  hs: string
  forSale: string
  units: string
  country: string
  certificate: string
  registered: string
  inScope: string
  qualityKind: string
  qualityReceived: string
  qualityExpiry: string
  marks: Record<string, string>
}

export function emptyProduct(id: string): Product {
  return {
    id,
    standardId: '2066',
    typeId: 'hose',
    flow: '',
    threadSize: '',
    hoseMm: '',
    hs: '',
    forSale: '',
    units: '',
    country: '',
    certificate: '',
    registered: '',
    inScope: '',
    qualityKind: '',
    qualityReceived: '',
    qualityExpiry: '',
    marks: {},
  }
}

export function productTitle(product: Product): string {
  const standard = standardById(product.standardId)
  const type = standard?.types.find((item) => item.id === product.typeId)
  if (!standard || !type) return 'สินค้า'
  return `${standard.title} · ${type.label}`
}

export function productListHtml(products: Product[]): string {
  const cards = products
    .map(
      (product) => `<button type="button" class="case-card" data-action="open-product" data-id="${esc(product.id)}">
        <strong>${esc(productTitle(product))}</strong>
        <span class="muted">${esc(product.hs.trim() || 'ยังไม่กรอก HS')}</span>
      </button>`,
    )
    .join('')
  const empty = products.length ? '' : '<p class="empty">ยังไม่มีสินค้า เพิ่มทีละรายการเพื่อคัดกรอง</p>'
  return `<div class="shell">
    <header class="mast">
      <p class="brand">SGI GROUP CO., LTD.</p>
      <h1>คัดกรองสินค้า</h1>
      <p class="sub">${esc(checkedOn)}</p>
    </header>
    <div class="topbar">
      <button type="button" data-action="back-case">‹ กลับเคส</button>
    </div>
    <p class="hint">ใช้กับ มอก. ที่บังคับ สำหรับสินค้านำเข้า</p>
    <div class="stack">
      <button type="button" class="btn" data-action="add-product">เพิ่มสินค้า</button>
      ${empty}
      ${cards}
    </div>
  </div>`
}

export function productHtml(product: Product, siblings: Product[], today: string): string {
  const standard = standardById(product.standardId)
  const type = standard?.types.find((item) => item.id === product.typeId)
  return `<div class="shell">
    <header class="mast">
      <p class="brand">SGI GROUP CO., LTD.</p>
      <h1>คัดกรองสินค้า</h1>
      <p class="sub">${esc(checkedOn)}</p>
    </header>
    <div class="topbar">
      <button type="button" data-action="back-products">‹ สินค้าในเคส</button>
      <button type="button" class="danger-text" data-action="delete-product">ลบสินค้า</button>
    </div>
    <p class="meta">${esc(productTitle(product))}${standard ? ` · ฉบับ ${esc(standard.edition)} · บังคับตั้งแต่ ${esc(standard.mandatorySince)}` : ''}</p>
    <nav class="jump" aria-label="ขั้นตอนคัดกรอง">
      <a href="#step-1">1 ข้อมูล</a>
      <a href="#step-2">2 ผล</a>
      <a href="#step-3">3 คุณภาพ</a>
      <a href="#step-4">4 มิติ</a>
      <a href="#step-5">5 สรุป</a>
    </nav>
    ${step1(product, type)}
    ${step2(product, siblings, standard, type)}
    ${step3(product, standard, today)}
    ${step4(product, standard, type)}
    ${step5(product, siblings, standard, type, today)}
  </div>`
}

function step1(product: Product, type: ProductTypeDef | undefined): string {
  const flowUnit = type?.flow.unit ?? 'ลิตร/นาที'
  const hose = type?.hose
    ? `<label class="field"><span>ความยาวสาย (มม.)</span><input inputmode="decimal" data-field="hoseMm" data-spot="info" value="${esc(product.hoseMm)}" /></label>`
    : ''
  const thread = type?.thread
    ? `<label class="field"><span>ขนาดเกลียว</span><input data-field="threadSize" value="${esc(product.threadSize)}" /></label>`
    : ''
  return `<section class="section" id="step-1">
    <h2>1. ข้อมูลสินค้า</h2>
    <div class="stack">
      <label class="field"><span>มาตรฐาน</span>
        <select data-field="standardId">${standards
          .map((item) => `<option value="${item.id}"${item.id === product.standardId ? ' selected' : ''}>${esc(item.title)} ฉบับ ${esc(item.edition)}</option>`)
          .join('')}</select>
      </label>
      <label class="field"><span>ชนิดสินค้า</span>
        <select data-field="typeId">${(standardById(product.standardId)?.types ?? [])
          .map((item) => `<option value="${item.id}"${item.id === product.typeId ? ' selected' : ''}>${esc(item.label)}</option>`)
          .join('')}</select>
      </label>
      <label class="field"><span>อัตราการไหลที่ 0.10 MPa (${esc(flowUnit)})</span>
        <input inputmode="decimal" data-field="flow" value="${esc(product.flow)}" />
      </label>
      ${thread}
      ${hose}
      <label class="field"><span>HS code</span><input data-field="hs" value="${esc(product.hs)}" /></label>
      <label class="field"><span>นำเข้าเพื่อขายหรือไม่</span>
        <select data-field="forSale">
          <option value=""${product.forSale === '' ? ' selected' : ''}>ยังไม่ระบุ</option>
          <option value="yes"${product.forSale === 'yes' ? ' selected' : ''}>ขาย</option>
          <option value="no"${product.forSale === 'no' ? ' selected' : ''}>ไม่ขาย</option>
        </select>
      </label>
      <label class="field"><span>จำนวน (หน่วย)</span><input inputmode="numeric" data-field="units" value="${esc(product.units)}" /></label>
      <label class="field"><span>ประเทศโรงงานผู้ผลิต</span><input data-field="country" value="${esc(product.country)}" /></label>
      <label class="field"><span>ใบรับรองระบบคุณภาพโรงงาน</span><input data-field="certificate" value="${esc(product.certificate)}" /></label>
      <label class="field"><span>เคยขึ้นทะเบียนกับ สมอ. หรือไม่</span>
        <select data-field="registered">
          <option value=""${product.registered === '' ? ' selected' : ''}>ยังไม่ระบุ</option>
          <option value="yes"${product.registered === 'yes' ? ' selected' : ''}>เคย</option>
          <option value="no"${product.registered === 'no' ? ' selected' : ''}>ไม่เคย</option>
        </select>
      </label>
    </div>
  </section>`
}

function step2(
  product: Product,
  siblings: Product[],
  standard: StandardDef | undefined,
  type: ProductTypeDef | undefined,
): string {
  if (!standard || !type) return `<section class="section" id="step-2"><h2>2. ผลคัดกรอง</h2><p class="hint">เลือกมาตรฐานก่อน</p></section>`
  const cards: string[] = []
  const hs = hsListed(standard.hsCodes, product.hs)
  if (hs === 'empty') cards.push(result('na', 'พิกัดศุลกากร', '<p>ยังไม่กรอก HS code</p>', ''))
  if (hs === 'out') {
    cards.push(
      result(
        'na',
        'พิกัดศุลกากร',
        `<p>พิกัดนี้ไม่อยู่ในบัญชี ${esc(standard.title)} มาตรฐานนี้ไม่ใช้กับสินค้านี้</p>`,
        sourceLink(standard.sources.hs),
      ),
    )
    return `<section class="section" id="step-2"><h2>2. ผลคัดกรอง</h2><div class="stack">${cards.join('')}</div></section>`
  }
  if (hs === 'in') {
    cards.push(
      result('ok', 'พิกัดศุลกากร', `<p>พิกัดอยู่ในบัญชีของ ${esc(standard.title)}</p>`, sourceLink(standard.sources.hs)),
    )
    const ask = scopeSelect(product)
    if (product.inScope === 'no') {
      cards.push(
        result(
          'stop',
          'นอกขอบข่าย',
          `<p>พิกัดตรงแต่สินค้านอกขอบข่าย ยื่น e-Scope (ใช้ได้ 1 ปี) ใช้รหัส EXEMPT99</p>${ask}`,
          sourceLink(standard.sources.eScope),
        ),
      )
    } else if (product.inScope === 'yes') {
      cards.push(result('ok', 'ขอบข่าย', `<p>สินค้าอยู่ในขอบข่ายของมาตรฐานนี้</p>${ask}`, ''))
    } else {
      cards.push(
        result(
          'na',
          'ขอบข่าย',
          `<p>ระบุว่าสินค้าอยู่ในขอบข่ายหรือไม่ ถ้านอกขอบข่ายให้ยื่น e-Scope และใช้รหัส EXEMPT99</p>${ask}`,
          sourceLink(standard.sources.eScope),
        ),
      )
    }
  }
  const flow = parseNum(product.flow)
  const range = scopeText(type.flow)
  if (flow == null) {
    cards.push(result('na', 'อัตราการไหล', '<p>ยังไม่กรอกอัตราการไหล</p>', sourceLink(standard.sources.fulltext)))
  } else if (inFlow(type.flow.kind === 'range' ? type.flow.min : null, type.flow.max, flow)) {
    cards.push(
      result(
        'ok',
        'อัตราการไหล',
        `<p>ค่า ${esc(product.flow)} ${esc(type.flow.unit)} อยู่ในช่วง ${esc(range)} ที่ความดัน 0.10 MPa</p>`,
        sourceLink(standard.sources.fulltext),
      ),
    )
  } else {
    cards.push(
      result(
        'stop',
        'อัตราการไหล',
        `<p>ค่า ${esc(product.flow)} ${esc(type.flow.unit)} อยู่นอกช่วง ${esc(range)} ต้องยืนยันกับ สมอ.</p>`,
        sourceLink(standard.sources.fulltext),
      ),
    )
  }
  const units = parseNum(product.units)
  const total = notForSaleTotal(siblings, standard.id)
  const kind = saleKind(product.forSale, units, product.forSale === 'no' ? total : units)
  if (kind === 'licence') {
    cards.push(
      result('need', 'การจำหน่าย', '<p>นำเข้าเพื่อขาย ต้องมีใบอนุญาต ม.21 (ยื่น มอ.5)</p>', sourceLink(standard.sources.criteria)),
    )
  } else if (kind === 'exempt') {
    cards.push(
      result(
        'ok',
        'การจำหน่าย',
        '<p>ไม่ขาย และจำนวนรวมไม่เกิน 4 หน่วยต่อมาตรฐานนี้ ได้รับยกเว้น</p>',
        sourceLink(standard.sources.exempt),
      ),
    )
  } else if (kind === 'notify') {
    cards.push(
      result(
        'stop',
        'การจำหน่าย',
        '<p>ไม่ขาย และจำนวนรวมเกิน 4 หน่วยต่อมาตรฐานนี้ ต้องแจ้ง และรายงานภายใน 15 วันหลังการใช้งาน</p>',
        sourceLink(standard.sources.notify),
      ),
    )
  } else {
    cards.push(result('na', 'การจำหน่าย', '<p>ยังไม่ระบุว่าขายหรือไม่ และจำนวน</p>', ''))
  }
  cards.push(result('need', 'มอ.5/1', `<p>${esc(mo51Note)}</p>`, sourceLink(standard.sources.criteria)))
  cards.push(result('info', 'Permission No.', `<p>${esc(permissionNote)}</p>`, ''))
  return `<section class="section" id="step-2"><h2>2. ผลคัดกรอง</h2><div class="stack">${cards.join('')}</div></section>`
}

function step3(product: Product, standard: StandardDef | undefined, today: string): string {
  const maxAge = product.qualityKind === 'audit' ? 3 : product.qualityKind === 'loc' ? 1 : null
  const flags = ageWarnings(maxAge, product.qualityReceived, product.qualityExpiry, today)
  const rule = product.qualityKind === 'audit' ? 'ไม่เกิน 3 ปี' : product.qualityKind === 'loc' ? 'ไม่เกิน 1 ปี' : ''
  const warns = [
    flags.includes('expiry') ? '<p class="warn" role="alert">เตือน: วันหมดอายุผ่านมาแล้ว</p>' : '',
    flags.includes('age') ? `<p class="warn" role="alert">เตือน: วันที่ได้รับเก่ากว่าเกณฑ์ ${esc(rule)}</p>` : '',
  ].join('')
  return `<section class="section" id="step-3">
    <h2>3. ระบบคุณภาพโรงงาน</h2>
    <p>${esc(standard?.isoNote ?? '')}</p>
    <p>${esc(standard?.qualityNeed ?? '')}</p>
    <p class="advice">${esc(supplierAdvice)}</p>
    <div class="stack">
      <label class="field"><span>เอกสารที่ใช้</span>
        <select data-field="qualityKind">
          <option value=""${product.qualityKind === '' ? ' selected' : ''}>ยังไม่เลือก</option>
          <option value="audit"${product.qualityKind === 'audit' ? ' selected' : ''}>รายงานตรวจโรงงาน</option>
          <option value="loc"${product.qualityKind === 'loc' ? ' selected' : ''}>Letter of Conformance</option>
        </select>
      </label>
      <label class="field"><span>วันที่ได้รับเอกสาร</span><input type="date" data-field="qualityReceived" value="${esc(product.qualityReceived)}" /></label>
      <label class="field"><span>วันหมดอายุ</span><input type="date" data-field="qualityExpiry" value="${esc(product.qualityExpiry)}" /></label>
    </div>
    ${warns}
  </section>`
}

function step4(product: Product, standard: StandardDef | undefined, type: ProductTypeDef | undefined): string {
  const checks = (standard?.checks ?? []).filter((check) => type && check.types.includes(type.id))
  const rows = checks.map((check) => dimRow(product, check)).join('')
  const empty = checks.length ? '' : '<p class="hint">เลือกชนิดสินค้าก่อน</p>'
  return `<section class="section" id="step-4"><h2>4. เช็กมิติก่อนสั่งตัวอย่าง</h2><div class="stack">${empty}${rows}</div></section>`
}

function step5(
  product: Product,
  siblings: Product[],
  standard: StandardDef | undefined,
  type: ProductTypeDef | undefined,
  today: string,
): string {
  const checks = (standard?.checks ?? []).filter((check) => type && check.types.includes(type.id))
  const judged = checks.map((check) => judge(check, product.marks, product.hoseMm))
  const dim = !checks.length
    ? 'ยังไม่ครบ'
    : judged.some((item) => item === 'fail')
      ? 'มีข้อที่ไม่ผ่าน'
      : judged.some((item) => item === 'empty')
        ? 'ยังตรวจไม่ครบ'
        : 'ผ่าน'
  const quality = qualityLabel(product, today)
  const links = standard
    ? [standard.sources.fulltext, standard.sources.criteria, standard.sources.labs]
        .map((link) => `<li>${sourceLink(link)}</li>`)
        .join('')
    : ''
  const registered = product.registered === 'yes' ? 'เคย' : product.registered === 'no' ? 'ไม่เคย' : 'ยังไม่ระบุ'
  return `<section class="section" id="step-5">
    <h2>5. สรุป</h2>
    <ul class="summary">
      <li>ข้อมูลสินค้า: ${step1Done(product, type) ? 'ครบ' : 'ยังไม่ครบ'}</li>
      <li>ผลคัดกรอง: ${esc(screenHeadline(product, siblings, standard, type))}</li>
      <li>ระบบคุณภาพโรงงาน: ${quality}</li>
      <li>เช็กมิติ: ${dim}</li>
    </ul>
    <p>ประเทศโรงงาน: ${esc(product.country.trim() || '—')}</p>
    <p>ใบรับรองที่แจ้งมา: ${esc(product.certificate.trim() || '—')}</p>
    <p>เคยขึ้นทะเบียนกับ สมอ.: ${registered}</p>
    <p>${esc(standard?.sampleNote ?? '')}</p>
    <ul>${links}</ul>
  </section>`
}

function screenHeadline(
  product: Product,
  siblings: Product[],
  standard: StandardDef | undefined,
  type: ProductTypeDef | undefined,
): string {
  if (!standard || !type) return 'ยังไม่ครบ'
  const hs = hsListed(standard.hsCodes, product.hs)
  if (hs === 'empty') return 'ยังไม่ครบ'
  if (hs === 'out') return 'มาตรฐานนี้ไม่ใช้'
  const bits = ['พิกัดตรง']
  if (product.inScope === 'no') bits.push('e-Scope EXEMPT99')
  const flow = parseNum(product.flow)
  if (flow == null) bits.push('ยังไม่กรอกอัตราการไหล')
  else if (!inFlow(type.flow.kind === 'range' ? type.flow.min : null, type.flow.max, flow)) bits.push('ต้องยืนยันกับ สมอ.')
  else bits.push('อัตราการไหลอยู่ในช่วง')
  const kind = saleKind(
    product.forSale,
    parseNum(product.units),
    product.forSale === 'no' ? notForSaleTotal(siblings, standard.id) : parseNum(product.units),
  )
  if (kind === 'licence') bits.push('ต้องยื่น มอ.5')
  else if (kind === 'exempt') bits.push('ได้รับยกเว้น')
  else if (kind === 'notify') bits.push('ต้องแจ้ง')
  bits.push('มอ.5/1 ใช้ไม่ได้')
  return bits.join(' · ')
}

function qualityLabel(product: Product, today: string): string {
  const maxAge = product.qualityKind === 'audit' ? 3 : product.qualityKind === 'loc' ? 1 : null
  if (!maxAge || !product.qualityReceived) return 'ยังไม่ครบ'
  const flags = ageWarnings(maxAge, product.qualityReceived, product.qualityExpiry, today)
  if (flags.length) return 'เอกสารหมดอายุหรือเก่าเกินเกณฑ์'
  return 'ใช้ได้ตามเกณฑ์อายุ'
}

function step1Done(product: Product, type: ProductTypeDef | undefined): boolean {
  if (!product.standardId || !product.typeId || !product.flow.trim() || !product.hs.trim()) return false
  if (product.forSale !== 'yes' && product.forSale !== 'no') return false
  if (!product.units.trim() || !product.country.trim() || !product.certificate.trim()) return false
  if (product.registered !== 'yes' && product.registered !== 'no') return false
  if (type?.thread && !product.threadSize.trim()) return false
  if (type?.hose && !product.hoseMm.trim()) return false
  return true
}

function notForSaleTotal(products: Product[], standardId: string): number | null {
  let sum = 0
  let seen = false
  for (const product of products) {
    if (product.standardId !== standardId || product.forSale !== 'no') continue
    const units = parseNum(product.units)
    if (units == null) return null
    sum += units
    seen = true
  }
  return seen ? sum : 0
}

function dimRow(product: Product, check: DimCheck): string {
  const status = judge(check, product.marks, product.hoseMm)
  const verdict =
    status === 'empty' ? '<p class="hint">ยังไม่มีผล</p>' : `<p class="verdict ${status}">${status === 'pass' ? 'ผ่าน' : 'ไม่ผ่าน'}</p>`
  return `<article class="dim">
    <p class="meta">ข้อ ${esc(check.clause)}</p>
    <p>${esc(check.requirement)}</p>
    ${dimInputs(product, check)}
    ${verdict}
  </article>`
}

function dimInputs(product: Product, check: DimCheck): string {
  if (check.mode === 'tick') return passButtons(check.id, product.marks[check.id] ?? '')
  if (check.mode === 'manual') {
    return `<label class="field"><span>ค่าจากโรงงาน</span><input data-note="${esc(check.id)}" value="${esc(product.marks[`${check.id}:text`] ?? '')}" /></label>
      ${passButtons(check.id, product.marks[check.id] ?? '')}`
  }
  if (check.mode === 'length-by-material') {
    const material = product.marks[`${check.id}:mat`] ?? ''
    const length = product.marks[check.id] ?? ''
    return `<label class="field"><span>วัสดุ</span>
        <select data-mat="${esc(check.id)}">
          <option value=""${material === '' ? ' selected' : ''}>เลือกวัสดุ</option>
          <option value="plastic"${material === 'plastic' ? ' selected' : ''}>พลาสติก เกณฑ์ 10.0 มม.</option>
          <option value="metal"${material === 'metal' ? ' selected' : ''}>โลหะ เกณฑ์ 7.5 มม.</option>
        </select>
      </label>
      <label class="field"><span>ความยาวเกลียว (มม.)</span><input inputmode="decimal" data-mark="${esc(check.id)}" value="${esc(length)}" /></label>`
  }
  if (check.id === 't42') {
    return `<label class="field"><span>ความยาวสาย (มม.)</span><input inputmode="decimal" data-field="hoseMm" data-spot="check" value="${esc(product.hoseMm)}" /></label>`
  }
  const unit = check.unit ? ` (${esc(check.unit)})` : ''
  return `<label class="field"><span>ค่าจากโรงงาน${unit}</span><input inputmode="decimal" data-mark="${esc(check.id)}" value="${esc(product.marks[check.id] ?? '')}" /></label>`
}

function passButtons(id: string, value: string): string {
  return `<div class="pair">
    <button type="button" class="btn secondary${value === 'pass' ? ' is-pass' : ''}" data-action="mark" data-check="${esc(id)}" data-value="pass">ผ่าน</button>
    <button type="button" class="btn secondary${value === 'fail' ? ' is-fail' : ''}" data-action="mark" data-check="${esc(id)}" data-value="fail">ไม่ผ่าน</button>
  </div>`
}

function scopeSelect(product: Product): string {
  return `<label class="field"><span>สินค้าอยู่ในขอบข่ายของมาตรฐานนี้หรือไม่</span>
    <select data-field="inScope">
      <option value=""${product.inScope === '' ? ' selected' : ''}>ยังไม่ระบุ</option>
      <option value="yes"${product.inScope === 'yes' ? ' selected' : ''}>อยู่ในขอบข่าย</option>
      <option value="no"${product.inScope === 'no' ? ' selected' : ''}>นอกขอบข่าย</option>
    </select>
  </label>`
}

function scopeText(rule: FlowRule): string {
  if (rule.kind === 'max') return `ไม่เกิน ${rule.max.toFixed(2)} ${rule.unit}`
  return `${rule.min.toFixed(2)}–${rule.max.toFixed(1)} ${rule.unit}`
}

function result(kind: string, title: string, body: string, source: string): string {
  return `<article class="result ${kind}"><h3>${esc(title)}</h3>${body}${source}</article>`
}

function sourceLink(link: SourceLink): string {
  if (!link.href) return `<p class="src">${esc(link.label)}</p>`
  return `<p class="src"><a href="${esc(link.href)}" target="_blank" rel="noopener noreferrer">${esc(link.label)}</a></p>`
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
