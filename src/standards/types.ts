export type FlowRule =
  | { kind: 'range'; min: number; max: number; unit: string }
  | { kind: 'max'; max: number; unit: string }

export type ProductTypeDef = {
  id: string
  label: string
  flow: FlowRule
  /** Step 1 asks for a hose length on this type. */
  hose: boolean
  /** Step 1 asks for a thread size on this type. */
  thread: boolean
  /** Shown under the flow field. Not a pass/fail rule. */
  note?: string
  /** Scope is not settled, so dimension pass/fail is withheld. */
  scopeUnclear?: boolean
}

export type DimCheck = {
  id: string
  clause: string
  requirement: string
  types: string[]
  mode: 'tick' | 'manual' | 'min' | 'max' | 'length-by-material'
  min?: number
  max?: number
  unit?: string
  plasticMin?: number
  metalMin?: number
}

export type SourceLink = { label: string; href?: string }

export type StandardDef = {
  id: '2066' | '2067'
  title: string
  edition: string
  mandatorySince: string
  hsCodes: string[]
  types: ProductTypeDef[]
  checks: DimCheck[]
  isoNote: string
  qualityNeed: string
  sampleNote: string
  sources: {
    hs: SourceLink
    eScope: SourceLink
    exempt: SourceLink
    notify: SourceLink
    criteria: SourceLink
    fulltext: SourceLink
    labs: SourceLink
  }
}
