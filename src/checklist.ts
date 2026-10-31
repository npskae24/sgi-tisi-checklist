/** Official wording lives here. Edit labels without touching app logic. */

export type AgeChoice = {
  id: string
  label: string
  /** Empty when the source line states no max age. */
  rule: string
  maxAgeYears: number | null
  /** Shown in yellow when this document type is selected. Not an age rule. */
  caution?: string
}

export type CheckItem = {
  id: string
  label: string
  /** Set when the line states one max age. */
  maxAgeYears?: number
  rule?: string
  /** One line that allows several documents. Staff pick one. */
  ageChoices?: AgeChoice[]
}

export type CheckSection = {
  id: string
  title: string
  items: CheckItem[]
}

export const footerNote =
  'ข้อมูลอ้างอิงเอกสาร สมอ. ตรวจ 31 ต.ค. 2569 — ยืนยันกับ สมอ. ก่อนใช้กรณีสำคัญ'

export const references: { label: string; href: string }[] = [
  {
    label: 'คู่มือประชาชน ฉบับ 2',
    href: 'https://opendata.tisi.go.th/dataset/1d06205c-daad-4953-8b03-b68f5300a45b/resource/2db9d629-58ca-4d15-aa17-70622e032f86/download/untitled.pdf',
  },
  {
    label: 'หลักเกณฑ์การตรวจสอบเพื่อการอนุญาต (ฉบับ 2564) ข้อ 4.1–4.2',
    href: 'https://www.tisi.go.th/data/stories/license/pdf/act_2559/product_cert_2564.pdf',
  },
  {
    label: 'ประกาศ สมอ. 7 มี.ค. 2566 (บัญชีสินค้าที่ได้รับยกเว้น)',
    href: 'https://www.tisi.go.th/data/pdf/about/announce_18_100366.pdf',
  },
  {
    label: 'ประกาศคณะกรรมการ 6 ส.ค. 2562 (การแจ้งนำเข้า)',
    href: 'https://www.tisi.go.th/data/pdf/about/announce_13_260765.pdf',
  },
]

export const sections: CheckSection[] = [
  {
    id: 's1',
    title: 'ชุด 1: คัดกรองก่อนเสนอราคา',
    items: [
      {
        id: 's1-company',
        label: 'บริษัทผู้นำเข้า + เลขนิติบุคคล (ใบ ม.21 ออกให้ผู้นำเข้าเท่านั้น)',
      },
      {
        id: 's1-product',
        label: 'ชื่อสินค้า / รุ่น / สเปก / HS code / รูปหรือแคตตาล็อก',
      },
      {
        id: 's1-sale',
        label:
          'นำเข้าเพื่อขายหรือไม่ (ขาย = มอ.5 / ไม่ขาย = แจ้ง สมอ. ขอเลข Permission ผ่าน TISI-NSW (จำนวนที่ได้ยกเว้นดูบัญชีแนบท้ายประกาศ สมอ. 7 มี.ค. 2566 เกินกว่านั้นต้องแจ้งตามประกาศคณะกรรมการ 6 ส.ค. 2562))',
      },
      {
        id: 's1-standard',
        label:
          'เลข มอก. + ฉบับปี + หลักเกณฑ์เฉพาะ (เช็กพิกัดที่ nsw.tisi.go.th/public/tisi00q020 / ติดพิกัดแต่นอกขอบข่าย = e-Scope)',
      },
      {
        id: 's1-frequency',
        label:
          'นำเข้าครั้งเดียวหรือต่อเนื่อง (มอ.5/1 ใช้ได้เฉพาะสินค้าที่หลักเกณฑ์เฉพาะอนุญาต และครอบคลุม 1 Invoice)',
      },
      {
        id: 's1-factory',
        label: 'โรงงานผู้ผลิต + ประเทศ',
      },
      {
        id: 's1-first',
        label: 'วันนำเข้าครั้งแรก + จำนวน',
      },
    ],
  },
  {
    id: 's2',
    title: 'ชุด 2: เอกสารยื่น มอ.5',
    items: [
      {
        id: 's2-account',
        label: 'เอกสารบริษัท + บัญชี e-License (i.tisi.go.th)',
      },
      {
        id: 's2-test',
        label:
          'รายงานผลทดสอบจาก lab ที่ สมอ. แต่งตั้ง/ยอมรับ อายุไม่เกิน 1 ปี และรุ่นตรงกับคำขอ',
        maxAgeYears: 1,
        rule: 'ไม่เกิน 1 ปี',
      },
      {
        id: 's2-sample',
        label:
          'ถ้ายังไม่มีผล: วางแผนแจ้งนำเข้าตัวอย่างและส่ง lab ในไทย (ผล CB ใช้ได้เฉพาะเครื่องซักผ้าและตู้เย็น / ASEAN EE MRA ใช้ได้เฉพาะเครื่องใช้ไฟฟ้า และ lab ที่ขึ้นทะเบียน / lab ISO 17025 อื่นต้องได้รับการยอมรับจาก สมอ. ก่อน)',
      },
      {
        id: 's2-quality',
        label:
          'ระบบคุณภาพโรงงาน อย่างใดอย่างหนึ่ง: รายงานตรวจโรงงานอายุไม่เกิน 3 ปี / Letter of Conformance อายุไม่เกิน 1 ปี / ISO 9001 หรือ มอก.9001 ที่ครอบคลุมกระบวนการผลิต จากหน่วยงานที่ สมอ. ยอมรับ (ใช้ได้เฉพาะเมื่อหลักเกณฑ์เฉพาะอนุญาต)',
        ageChoices: [
          {
            id: 'factory-report',
            label: 'รายงานตรวจโรงงาน',
            rule: 'ไม่เกิน 3 ปี',
            maxAgeYears: 3,
          },
          {
            id: 'loc',
            label: 'Letter of Conformance',
            rule: 'ไม่เกิน 1 ปี',
            maxAgeYears: 1,
          },
          {
            id: 'iso9001',
            label: 'ISO 9001',
            rule: '',
            maxAgeYears: null,
            caution: 'เช็กหลักเกณฑ์เฉพาะก่อนว่ารับ ISO 9001 หรือไม่',
          },
        ],
      },
      {
        id: 's2-specific',
        label: 'รายการตามหลักเกณฑ์เฉพาะ (เครื่องมือทดสอบ, QC)',
      },
      {
        id: 's2-visit',
        label: 'ถ้าต้องตรวจโรงงาน: ประสานโรงงานและนัด สมอ.',
      },
    ],
  },
  {
    id: 's3',
    title: 'ชุด 3: หลังได้ใบอนุญาต',
    items: [
      {
        id: 's3-qr',
        label: 'สร้าง QR Code ผ่าน sso.tisi.go.th',
      },
      {
        id: 's3-nsw',
        label: 'แจ้ง TISI-NSW ทุก Invoice เพื่อขอ Permission No. ก่อนทำใบขน',
      },
      {
        id: 's3-mark',
        label: 'ตรวจเครื่องหมาย มอก. และฉลาก',
      },
      {
        id: 's3-duty',
        label: 'ทำตามเงื่อนไขที่ระบุในใบอนุญาตและหลักเกณฑ์เฉพาะ (เช่น การตรวจติดตาม)',
      },
    ],
  },
]
