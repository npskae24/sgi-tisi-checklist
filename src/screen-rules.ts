/**
 * Screening decisions. Limits are passed in from the standard files.
 * ponytail: compare scaled integers (1e6) so 0.001 and 7.5 do not drift.
 * A real decimal library is only worth it if a boundary value disagrees.
 */

const SCALE = 1_000_000

export type HsHit = 'empty' | 'in' | 'out'
export type SaleKind = 'empty' | 'licence' | 'exempt' | 'notify'
export type Judge = 'empty' | 'pass' | 'fail'

export function digits(code: string): string {
  return code.replace(/\D/g, '')
}

export function hsListed(codes: string[], input: string): HsHit {
  const value = digits(input)
  if (!value) return 'empty'
  return codes.some((code) => digits(code) === value) ? 'in' : 'out'
}

export function parseNum(raw: string): number | null {
  const text = raw.trim().replace(',', '.')
  if (!text) return null
  const value = Number(text)
  return Number.isFinite(value) ? value : null
}

function scaled(value: number): number {
  return Math.round(value * SCALE)
}

export function meetsMin(value: number, min: number): boolean {
  return scaled(value) >= scaled(min)
}

export function meetsMax(value: number, max: number): boolean {
  return scaled(value) <= scaled(max)
}

/** True when the value sits inside the stated scope. Null min means no lower bound. */
export function inFlow(min: number | null, max: number, value: number): boolean {
  if (!meetsMax(value, max)) return false
  if (min != null && !meetsMin(value, min)) return false
  return true
}

export function saleKind(forSale: string, units: number | null, totalNotForSale: number | null): SaleKind {
  if (forSale === 'yes') return 'licence'
  if (forSale !== 'no' || units == null || totalNotForSale == null) return 'empty'
  return totalNotForSale <= 4 ? 'exempt' : 'notify'
}

type Rule = {
  id: string
  mode: 'tick' | 'manual' | 'min' | 'max' | 'length-by-material'
  min?: number
  max?: number
  plasticMin?: number
  metalMin?: number
}

export function judge(rule: Rule, marks: Record<string, string>, hoseMm: string): Judge {
  if (rule.mode === 'tick' || rule.mode === 'manual') {
    const mark = marks[rule.id]
    if (mark === 'pass' || mark === 'fail') return mark
    return 'empty'
  }
  if (rule.mode === 'length-by-material') {
    const material = marks[`${rule.id}:mat`]
    const length = parseNum(marks[rule.id] ?? '')
    if ((material !== 'plastic' && material !== 'metal') || length == null) return 'empty'
    const min = material === 'metal' ? rule.metalMin : rule.plasticMin
    if (min == null) return 'empty'
    return meetsMin(length, min) ? 'pass' : 'fail'
  }
  const raw = rule.id === 't42' ? hoseMm : (marks[rule.id] ?? '')
  const value = parseNum(raw)
  if (value == null) return 'empty'
  if (rule.mode === 'min') return rule.min != null && meetsMin(value, rule.min) ? 'pass' : 'fail'
  return rule.max != null && meetsMax(value, rule.max) ? 'pass' : 'fail'
}

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg)
}

function demo(): void {
  const hs2066 = ['3924.90.90.002']
  assert(hsListed(hs2066, '3924.90.90.002') === 'in', 'dotted HS matches')
  assert(hsListed(hs2066, '39249090002') === 'in', 'undotted HS matches')
  assert(hsListed(hs2066, '8481.80.51.000') === 'out', 'other standard HS is out')
  assert(hsListed(hs2066, '  ') === 'empty', 'blank HS')
  assert(inFlow(0.5, 8, 8), '8.0 is inside the hose range')
  assert(!inFlow(0.5, 8, 8.01), 'above the hose range')
  assert(!inFlow(0.5, 8, 0.49), 'below the hose range')
  assert(inFlow(null, 0.6, 0.6), '0.60 L/cycle is inside')
  assert(!inFlow(null, 0.6, 0.61), 'above 0.60 L/cycle')
  assert(saleKind('yes', 20, 20) === 'licence', 'for sale needs a licence')
  assert(saleKind('no', 4, 4) === 'exempt', '4 units not for sale is exempt')
  assert(saleKind('no', 2, 2) === 'exempt', '2 units not for sale is exempt')
  assert(saleKind('no', 3, 5) === 'notify', 'units summed per standard over 4 must notify')
  assert(saleKind('no', null, null) === 'empty', 'missing units')
  assert(meetsMin(1200, 1200) && !meetsMin(1100, 1200), 'hose 1100 fails 1200')
  assert(meetsMin(10, 10) && !meetsMin(9.99, 10), 'thread 9.99 fails 10.0')
  assert(meetsMin(7.5, 7.5) && !meetsMin(7.49, 7.5), 'metal thread 7.49 fails 7.5')
  assert(meetsMax(0.5, 0.5) && !meetsMax(0.51, 0.5), 'water difference')
  assert(meetsMax(0.001, 0.001) && !meetsMax(0.0011, 0.001), 'cadmium')
  assert(meetsMax(0.007, 0.007) && !meetsMax(0.008, 0.007), 'lead')
  assert(meetsMax(0.97, 0.97) && !meetsMax(0.98, 0.97), 'zinc')
  assert(judge({ id: 't42', mode: 'min', min: 1200 }, {}, '1100') === 'fail', 'shower hose fail')
  assert(judge({ id: 't42', mode: 'min', min: 1200 }, {}, '1200') === 'pass', 'shower hose pass')
  assert(
    judge({ id: 't4112len', mode: 'length-by-material', plasticMin: 10, metalMin: 7.5 }, { t4112len: '7.5', 't4112len:mat': 'metal' }, '') ===
      'pass',
    'metal length',
  )
  assert(judge({ id: 'b41', mode: 'tick' }, {}, '') === 'empty', 'unticked clause')
  console.log('screen rules ok')
}

const entry = (globalThis as { process?: { argv?: string[] } }).process?.argv?.[1] ?? ''
if (entry.endsWith('screen-rules.ts')) demo()
