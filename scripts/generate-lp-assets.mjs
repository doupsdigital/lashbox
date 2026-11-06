// Gera as imagens de demonstração da /lp: 4 artes exportadas (tabela, depoimento, tópicos,
// antes/depois) + 4 prints do app (Início, galeria, editor, Montador), todas com um estúdio de
// demonstração completo e sem nenhum marcador [entre colchetes] visível.
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5191'
const OUT = path.resolve('referencia/prints/lp-raw')
mkdirSync(OUT, { recursive: true })

const PHOTOS_DIR = process.env.LP_PHOTOS_DIR
if (!PHOTOS_DIR) throw new Error('Defina LP_PHOTOS_DIR com a pasta das fotos (antes.jpg, depois.jpg, studio-photo.jpg)')

const STUDIO = {
  ownerName: 'Juliana Andrade',
  studioName: 'Studio Juliana Lash',
  neighborhood: 'Setor Bueno',
  city: 'Goiânia',
  address: '',
  whatsapp: '(62) 98247-0555',
  instagram: 'studiojulianalash',
  pixKey: 'juliana@studio.com',
  bookingLink: 'studiojulianalash.com/agenda',
  servicePrice: '180',
  maintenancePrice: '120',
  palette: 'rosa',
}

async function freezeDay(page, dayIndex) {
  const fixed = dayIndex * 86_400_000 + 12 * 3_600_000
  await page.addInitScript((ts) => {
    class FixedDate extends Date {
      constructor(...args) {
        if (args.length === 0) super(ts)
        else super(...args)
      }
      static now() {
        return ts
      }
    }
    // eslint-disable-next-line no-global-assign
    Date = FixedDate
  }, fixed)
}

async function setStudioPhoto(page, filePath) {
  const fs = await import('node:fs')
  const b64 = fs.readFileSync(filePath).toString('base64')
  await page.evaluate(async (b64) => {
    const bin = atob(b64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    const blob = new Blob([bytes], { type: 'image/jpeg' })
    const db = await new Promise((resolve, reject) => {
      const req = indexedDB.open('lashbox-studio', 1)
      req.onupgradeneeded = () => req.result.createObjectStore('photos')
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
    await new Promise((resolve, reject) => {
      const tx = db.transaction('photos', 'readwrite')
      tx.objectStore('photos').put(blob, 'main')
      tx.oncomplete = resolve
      tx.onerror = () => reject(tx.error)
    })
  }, b64)
}

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
const page = await context.newPage()
page.on('dialog', (d) => d.accept())

await page.goto(BASE + '/boas-vindas')
await page.evaluate((studio) => {
  localStorage.setItem('lashbox:onboarding-seen', '1')
  localStorage.setItem('lashbox:studio:v1', JSON.stringify(studio))
}, STUDIO)
await setStudioPhoto(page, path.join(PHOTOS_DIR, 'studio-photo.jpg'))

// ---------- 4 artes exportadas ----------
async function exportArt(id, { markers = {}, author, quote, photos = [] } = {}) {
  await page.goto(BASE + `/criar/${id}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(250)

  for (let i = 0; i < photos.length; i++) {
    await page.locator('input[type="file"]').nth(i).setInputFiles(photos[i])
  }
  if (photos.length) await page.waitForTimeout(150)

  if (quote) {
    await page.locator('label:has-text("Depoimento") textarea').fill(quote)
  }
  if (author) {
    await page.locator('label:has-text("Assinatura") input').fill(author)
  }
  for (const [marker, value] of Object.entries(markers)) {
    await page.locator(`input[placeholder="${marker}"]`).fill(value)
  }

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /Salvar no celular|Gerando/ }).click()
  const download = await downloadPromise
  const outPath = path.join(OUT, `art-${id}.png`)
  await download.saveAs(outPath)
  console.log('arte ok ->', outPath)
}

await exportArt('tabela-valores')
await exportArt('elogio-cliente', { author: 'Camila R.' })
await exportArt('estilos-cilios')
await exportArt('antes-depois', {
  photos: [path.join(PHOTOS_DIR, 'antes.jpg'), path.join(PHOTOS_DIR, 'depois.jpg')],
  markers: { '[estilo]': 'Volume brasileiro' },
})

// ---------- 4 prints do app ----------
await freezeDay(page, 3) // cai em "Me conheça" (photo, sem marcador fora do estúdio)
await page.goto(BASE + '/inicio', { waitUntil: 'networkidle' })
await page.waitForTimeout(300)
await page.screenshot({ path: path.join(OUT, 'screen-inicio.png') })
console.log('print ok -> inicio')

await page.goto(BASE + '/criar', { waitUntil: 'networkidle' })
await page.waitForTimeout(300)
await page.screenshot({ path: path.join(OUT, 'screen-galeria.png') })
console.log('print ok -> galeria')

await page.goto(BASE + '/criar/tabela-valores', { waitUntil: 'networkidle' })
await page.waitForTimeout(300)
await page.screenshot({ path: path.join(OUT, 'screen-editor.png') })
console.log('print ok -> editor')

await page.goto(BASE + '/vender/ofertas', { waitUntil: 'networkidle' })
await page.waitForTimeout(300)
const dateInputs = page.locator('div.grid input')
await dateInputs.nth(0).fill('30/11')
await dateInputs.nth(1).fill('05/12')
await page.waitForTimeout(150)
await page.screenshot({ path: path.join(OUT, 'screen-vender.png') })
console.log('print ok -> vender')

await browser.close()
console.log('done')
