/**
 * Document age checks.
 *
 * ponytail: compare calendar Y-M-D, not elapsed days. On 29 Feb, day 28 of
 * the cutoff year counts as older. Switch to a real calendar add only if a
 * 29 Feb case is disputed.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** True when `iso` is a real calendar date strictly before `today`. */
export function isPast(iso: string, today: string): boolean {
  return ISO_DATE.test(iso) && ISO_DATE.test(today) && iso < today
}

/**
 * True when `received` is strictly older than `years` before `today`.
 * The same month and day N years ago is still within "ไม่เกิน N ปี".
 */
export function isOlderThanYears(received: string, years: number, today: string): boolean {
  if (!ISO_DATE.test(received) || !ISO_DATE.test(today)) return false
  if (!Number.isInteger(years) || years < 0) return false
  const [ry, rm, rd] = received.split('-').map(Number)
  const [ty, tm, td] = today.split('-').map(Number)
  const cy = ty - years
  if (ry !== cy) return ry < cy
  if (rm !== tm) return rm < tm
  return rd < td
}

export function ageWarnings(
  maxAgeYears: number | null,
  received: string,
  expiry: string,
  today: string,
): Array<'expiry' | 'age'> {
  const out: Array<'expiry' | 'age'> = []
  if (expiry && isPast(expiry, today)) out.push('expiry')
  if (maxAgeYears != null && received && isOlderThanYears(received, maxAgeYears, today)) {
    out.push('age')
  }
  return out
}

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg)
}

function demo(): void {
  const today = '2026-10-31'
  assert(!isPast('2026-10-31', today), 'expiry today is still valid')
  assert(isPast('2026-10-30', today), 'yesterday has passed')
  assert(!isPast('2026-11-01', today), 'future expiry is valid')
  assert(!isPast('nope', today), 'garbage expiry is not a warning')
  assert(!isOlderThanYears('2025-10-31', 1, today), 'exactly 1 year is within ไม่เกิน')
  assert(isOlderThanYears('2025-10-30', 1, today), 'one day over 1 year warns')
  assert(!isOlderThanYears('2023-10-31', 3, today), 'exactly 3 years is within ไม่เกิน')
  assert(isOlderThanYears('2023-10-30', 3, today), 'one day over 3 years warns')
  assert(!isOlderThanYears('', 1, today), 'empty received is not a warning')
  assert(isOlderThanYears('2023-02-28', 1, '2024-02-29'), '28 Feb is older than a 29 Feb cutoff')
  assert(!isOlderThanYears('2023-03-01', 1, '2024-02-29'), '1 Mar is not older than leap day minus 1 year')
  assert(
    JSON.stringify(ageWarnings(1, '2025-10-30', '2020-01-01', today)) === '["expiry","age"]',
    'both warnings',
  )
  assert(JSON.stringify(ageWarnings(null, '2020-01-01', '', today)) === '[]', 'no max age, no expiry')
  console.log('rules ok')
}

const entry = (globalThis as { process?: { argv?: string[] } }).process?.argv?.[1] ?? ''
if (entry.endsWith('rules.ts')) demo()
