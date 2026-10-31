import { tis2066 } from './tis2066'
import { tis2067 } from './tis2067'
import type { StandardDef } from './types'

export const standards: StandardDef[] = [tis2066, tis2067]

export const checkedOn = 'ตรวจข้อมูล 31 ต.ค. 2569'

export const supplierAdvice =
  'แนะนำให้เลือกโรงงานที่มีรายงานตรวจโรงงานหรือ Letter of Conformance ที่ยังไม่หมดอายุ ตั้งแต่แรก'

export const permissionNote = 'ขอเลข Permission No. ใน TISI-NSW'

export const mo51Note = 'มอ.5/1 ใช้ไม่ได้กับ มอก. 2066 และ มอก. 2067 (หลักเกณฑ์เฉพาะข้อ 5 ระบุว่าไม่มี)'

export function standardById(id: string): StandardDef | undefined {
  return standards.find((item) => item.id === id)
}
