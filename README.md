# SGI TISI checklist

Mobile checklist for SGI GROUP CO., LTD. staff talking a customer through a TISI (มอก.) import licence under มาตรา 21. Static site. No account, no server, and no prices or service fees.

The built site is served at [https://npskae24.github.io/sgi-tisi-checklist/](https://npskae24.github.io/sgi-tisi-checklist/) with base path `/sgi-tisi-checklist/`.

## Use

Create one case per customer. Each case stores a customer name, notes, and the checklist. Edit the customer name to rename the case. Tick an item, enter the date the document was received, and enter its expiry date. Progress is the number of ticked items in that section and in the whole case.

Everything stays in this browser under the `localStorage` key `sgi-tisi-checklist`. A refresh reopens the case that was on screen. Export writes all cases to a JSON file. Import replaces every case on this device after a confirmation. Delete also asks first.

Add the site to the home screen after it has been opened online once. The service worker precaches the built files, so the next launch works offline.

## Document age

The check is calendar dates on the phone, not a count of 365-day periods. Empty dates are not warnings. Wording and the numbers live in `src/checklist.ts`.

- **Expiry.** If the expiry date is earlier than today, the item shows `เตือน: วันหมดอายุผ่านมาแล้ว`. The expiry day itself is still valid.
- **Max age.** A line that says `ไม่เกิน N ปี` sets `maxAgeYears` and a `rule` string. The rule is shown beside the item. If the received date is strictly earlier than the same month and day N years ago, the item shows `เตือน: วันที่ได้รับเก่ากว่าเกณฑ์` plus that rule. A document received exactly N years ago is still within `ไม่เกิน`.
- **One line, several documents.** `ระบบคุณภาพโรงงาน อย่างใดอย่างหนึ่ง` is a single item because only one document is required. The chips always show the limits from that line (`ไม่เกิน 3 ปี` for a factory report, `ไม่เกิน 1 ปี` for a Letter of Conformance). Staff pick which document they hold, and the age check uses that limit. ISO 9001 has no max age, so only its expiry date is checked, and selecting it shows the yellow caution from `checklist.ts`. Until a type is picked, a received date is not age-checked.
- **29 Feb.** The cutoff keeps the day number. On 29 Feb, 28 Feb of the cutoff year counts as older.

Checked boxes are what move the progress bars. Dates do not.

## Product screening

From a case, open คัดกรองสินค้า. A case holds several products. The page only covers mandatory standards for imported goods, currently มอก. 2066 and มอก. 2067. Facts for each standard live in `src/standards/`. The result cards, the 4-unit exemption, and the dimension pass/fail come from those files. A flow rate outside the stated range says to confirm with สมอ. and is not treated as an exemption. Products are stored on the case and travel with the JSON export.

## Edit the wording

Change labels, rules, and the footer in `src/checklist.ts` only. Keep the official sentences as written. Do not add fees or prices.

## Develop

```bash
npm install
npm run check
npm run typecheck
npm run build
npm run preview
```

Open `http://127.0.0.1:4173/sgi-tisi-checklist/`.

`npm run build` typechecks, runs the age-rule assertions in `src/rules.ts`, and builds the site. The production service worker is written into `dist/sw.js` with the hashed asset list.

## Deploy

A push to `main` runs `.github/workflows/pages.yml`. The workflow builds the site and deploys it with `actions/upload-pages-artifact` and `actions/deploy-pages`. GitHub Pages is already set to deploy from a GitHub Actions workflow.
