import type { StandardDef } from './types'

/** Facts from the TISI expert note, checked 31 ต.ค. 2569. No extra rules. */
export const tis2066: StandardDef = {
  id: '2066',
  title: 'มอก. 2066',
  edition: '2552',
  mandatorySince: '19 ม.ค. 2554',
  hsCodes: [
    '3922.10.90.000',
    '3924.90.90.002',
    '7324.21.10.000',
    '7324.21.90.000',
    '7324.29.10.000',
    '7324.29.90.000',
    '7324.90.91.000',
    '7324.90.99.090',
    '7418.20.00.000',
    '7615.20.90.001',
  ],
  types: [
    {
      id: 'shower-hose',
      label: 'ฝักบัวอาบน้ำสายอ่อน',
      flow: { kind: 'range', min: 0.5, max: 8, unit: 'ลิตร/นาที' },
      hose: true,
      thread: true,
    },
    {
      id: 'rigid',
      label: 'ฝักบัวอาบน้ำก้านแข็ง',
      flow: { kind: 'range', min: 0.5, max: 9, unit: 'ลิตร/นาที' },
      hose: false,
      thread: true,
    },
    {
      id: 'bidet',
      label: 'สายฉีดชำระ / ไม่แน่ใจว่าอยู่ในขอบข่าย',
      flow: { kind: 'range', min: 0.5, max: 8, unit: 'ลิตร/นาที' },
      hose: false,
      thread: false,
      scopeUnclear: true,
    },
  ],
  checks: [
    {
      id: 't4111',
      clause: '4.1.1.1',
      requirement: 'เกลียวหัวฉีดเป็น G1/2A หรือ G1/2B (ISO 228-1) หรือ R1/2 (ISO 7-1)',
      types: ['shower-hose'],
      mode: 'manual',
    },
    {
      id: 't4112type',
      clause: '4.1.1.2',
      requirement: 'เกลียวข้อต่อสายเป็น G1/2, Rc1/2 หรือ Rp1/2',
      types: ['shower-hose'],
      mode: 'manual',
    },
    {
      id: 't4112len',
      clause: '4.1.1.2',
      requirement: 'ความยาวเกลียวข้อต่อสาย ไม่น้อยกว่า 10.0 มม. ถ้าเป็นพลาสติก หรือ 7.5 มม. ถ้าเป็นโลหะ',
      types: ['shower-hose'],
      mode: 'length-by-material',
      plasticMin: 10,
      metalMin: 7.5,
      unit: 'มม.',
    },
    {
      id: 't412type',
      clause: '4.1.2',
      requirement: 'เกลียวเป็น R1/2',
      types: ['rigid'],
      mode: 'manual',
    },
    {
      id: 't412len',
      clause: '4.1.2',
      requirement: 'ความยาวเกลียว R1/2 ไม่น้อยกว่า 10.0 มม.',
      types: ['rigid'],
      mode: 'min',
      min: 10,
      unit: 'มม.',
    },
    {
      id: 't42',
      clause: '4.2',
      requirement: 'ความยาวสายไม่น้อยกว่า 1,200 มม.',
      types: ['shower-hose'],
      mode: 'min',
      min: 1200,
      unit: 'มม.',
    },
    {
      id: 't52',
      clause: '5.2',
      requirement: 'ปริมาตรน้ำที่วัดได้ต่างกันไม่เกิน 0.50 ลิตร ทดสอบที่ความดัน 0.10 MPa',
      types: ['shower-hose', 'rigid'],
      mode: 'max',
      max: 0.5,
      unit: 'ลิตร',
    },
  ],
  isoNote: 'มอก. 2066 ไม่ยอมรับ ISO 9001 แทนการตรวจโรงงาน',
  qualityNeed:
    'ต้องมีรายงานตรวจโรงงานจาก สมอ. หรือผู้ตรวจสอบที่ได้รับแต่งตั้ง อายุไม่เกิน 3 ปี หรือ Letter of Conformance อายุไม่เกิน 1 ปี',
  sampleNote:
    'เก็บตัวอย่าง 1 ชุด (2 หน่วย) ต่อแบบและรุ่น (pr-161) ห้องปฏิบัติการที่ได้รับแต่งตั้งทั้งหมดอยู่ในประเทศไทย ไม่มีระยะเวลาทดสอบอย่างเป็นทางการ',
  sources: {
    hs: {
      label: 'บัญชีพิกัด มอก. 2066',
      href: 'https://www3.tisi.go.th/hscode/hscode_view.asp?id=42',
    },
    eScope: { label: 'เว็บบอร์ด สมอ. id=3644' },
    exempt: {
      label: 'ประกาศ สมอ. 7 มี.ค. 2566 ลำดับ 102/103',
      href: 'https://www.tisi.go.th/data/pdf/about/announce_18_100366.pdf',
    },
    notify: {
      label: 'ประกาศคณะกรรมการ 6 ส.ค. 2562',
      href: 'https://www.tisi.go.th/data/pdf/about/announce_13_260765.pdf',
    },
    criteria: {
      label: 'หลักเกณฑ์เฉพาะ pr-161',
      href: 'https://appdb.tisi.go.th/tis_devs/p12/file_pr/pr-161.pdf',
    },
    fulltext: {
      label: 'มอก. 2066-2552 ฉบับเต็ม',
      href: 'https://service.tisi.go.th/fulltext/2066_2552.pdf',
    },
    labs: {
      label: 'บัญชีห้องปฏิบัติการที่ สมอ. แต่งตั้ง',
      href: 'https://www.tisi.go.th/data/content/2569/20260206141540_6985951cc2a7a.pdf',
    },
  },
}
