import type { StandardDef } from './types'

/** Facts from the TISI expert note, checked 31 ต.ค. 2569. No extra rules. */
export const tis2067: StandardDef = {
  id: '2067',
  title: 'มอก. 2067',
  edition: '2552',
  mandatorySince: '19 ม.ค. 2554',
  hsCodes: ['8481.80.51.000', '8481.80.59.000', '8481.80.99.001'],
  types: [
    {
      id: 'sink',
      label: 'ก๊อกน้ำอ่างล้างชาม',
      flow: { kind: 'range', min: 0.5, max: 6, unit: 'ลิตร/นาที' },
      hose: false,
      thread: false,
    },
    {
      id: 'basin',
      label: 'ก๊อกน้ำอ่างล้างหน้า-ล้างมือ',
      flow: { kind: 'range', min: 0.5, max: 6, unit: 'ลิตร/นาที' },
      hose: false,
      thread: false,
    },
    {
      id: 'self',
      label: 'ก๊อกน้ำปิดอัตโนมัติอ่างล้างหน้า-ล้างมือ',
      flow: { kind: 'max', max: 0.6, unit: 'ลิตร/ครั้ง' },
      hose: false,
      thread: false,
      note: 'เฉลี่ยไม่เกิน 0.40 ลิตร และเวลาไหลเฉลี่ยไม่น้อยกว่า 2 วินาที',
    },
  ],
  checks: [
    {
      id: 'b411',
      clause: '4.1.1',
      requirement: 'มิติตาม มอก.1277 ค่าตัวเลขดูในมาตรฐานนั้น (ยังไม่ได้ใส่ในแอป)',
      types: ['sink'],
      mode: 'tick',
    },
    {
      id: 'b412',
      clause: '4.1.2',
      requirement: 'มิติตาม มอก.1278 ค่าตัวเลขดูในมาตรฐานนั้น (ยังไม่ได้ใส่ในแอป)',
      types: ['basin'],
      mode: 'tick',
    },
    {
      id: 'b413',
      clause: '4.1.3',
      requirement: 'มิติตาม มอก.1377 ค่าตัวเลขดูในมาตรฐานนั้น (ยังไม่ได้ใส่ในแอป)',
      types: ['self'],
      mode: 'tick',
    },
    {
      id: 'b93',
      clause: '9.3',
      requirement: 'ทนความดัน 1.75 MPa ไม่น้อยกว่า 1 นาที',
      types: ['sink', 'basin', 'self'],
      mode: 'manual',
    },
    {
      id: 'b55',
      clause: '5.5',
      requirement: 'ความทนทาน 100,000 รอบ',
      types: ['sink', 'basin', 'self'],
      mode: 'manual',
    },
    {
      id: 'bcd',
      clause: '5.4.2',
      requirement: 'แคดเมียมในน้ำไม่เกิน 0.001 มก./ลิตร',
      types: ['sink', 'basin', 'self'],
      mode: 'max',
      max: 0.001,
      unit: 'มก./ลิตร',
    },
    {
      id: 'bpb',
      clause: '5.4.2',
      requirement: 'ตะกั่วในน้ำไม่เกิน 0.007 มก./ลิตร',
      types: ['sink', 'basin', 'self'],
      mode: 'max',
      max: 0.007,
      unit: 'มก./ลิตร',
    },
    {
      id: 'bzn',
      clause: '5.4.2',
      requirement: 'สังกะสีในน้ำไม่เกิน 0.97 มก./ลิตร',
      types: ['sink', 'basin', 'self'],
      mode: 'max',
      max: 0.97,
      unit: 'มก./ลิตร',
    },
  ],
  isoNote: 'มอก. 2067 ไม่ยอมรับ ISO 9001 แทนการตรวจโรงงาน',
  qualityNeed:
    'ต้องมีรายงานตรวจโรงงานจาก สมอ. หรือผู้ตรวจสอบที่ได้รับแต่งตั้ง อายุไม่เกิน 3 ปี หรือ Letter of Conformance อายุไม่เกิน 1 ปี',
  sampleNote:
    'เก็บตัวอย่าง 1 ชุด (2 หน่วย) ต่อชื่อและรุ่น ส่วนรายการผลต่อน้ำใช้ 2 ชุดต่อชื่อและวัสดุ อย่างน้อย 100 มล. (pr-162) ห้องปฏิบัติการที่ได้รับแต่งตั้งทั้งหมดอยู่ในประเทศไทย ไม่มีระยะเวลาทดสอบอย่างเป็นทางการ',
  sources: {
    hs: {
      label: 'บัญชีพิกัด มอก. 2067',
      href: 'https://www3.tisi.go.th/hscode/hscode_view.asp?id=43',
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
      label: 'หลักเกณฑ์เฉพาะ pr-162',
      href: 'https://appdb.tisi.go.th/tis_devs/p12/file_pr/pr-162.pdf',
    },
    fulltext: {
      label: 'มอก. 2067-2552 ฉบับเต็ม',
      href: 'https://service.tisi.go.th/fulltext/2067_2552.pdf',
    },
    labs: {
      label: 'บัญชีห้องปฏิบัติการที่ สมอ. แต่งตั้ง',
      href: 'https://www.tisi.go.th/data/content/2569/20260206141540_6985951cc2a7a.pdf',
    },
  },
}
