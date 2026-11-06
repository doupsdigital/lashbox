// Confere o comportamento de "Para postar hoje" com fotos: pula antes/depois, mostra aviso
// quando falta foto obrigatória, e usa a foto do estúdio quando ela existe.
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5191'
const OUT = 'referencia/prints/novos-tipos'
mkdirSync(OUT, { recursive: true })

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
  const fixed = dayIndex * 86_400_000 + 12 * 3_600_000 // meio-dia daquele dia, em ms
  await page.addInitScript((ts) => {
    const RealDate = Date
    class FixedDate extends RealDate {
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

async function setStudioPhoto(page) {
  await page.evaluate(async () => {
    const db = await new Promise((resolve, reject) => {
      const req = indexedDB.open('lashbox-studio', 1)
      req.onupgradeneeded = () => req.result.createObjectStore('photos')
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
    const canvas = document.createElement('canvas')
    canvas.width = 300
    canvas.height = 300
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#B08840'
    ctx.fillRect(0, 0, 300, 300)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
    await new Promise((resolve, reject) => {
      const tx = db.transaction('photos', 'readwrite')
      tx.objectStore('photos').put(blob, 'main')
      tx.oncomplete = resolve
      tx.onerror = () => reject(tx.error)
    })
  })
}

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
const page = await context.newPage()

await page.goto(BASE + '/boas-vindas')
await page.evaluate((studio) => {
  localStorage.setItem('lashbox:onboarding-seen', '1')
  localStorage.setItem('lashbox:studio:v1', JSON.stringify(studio))
}, STUDIO)

// Dia cuja sugestão (índice 1 do array) é "antes-depois" — deve pular para outra.
await freezeDay(page, 1)
await page.goto(BASE + '/inicio', { waitUntil: 'networkidle' })
await page.waitForTimeout(300)
const titleSkip = await page.locator('text=PARA POSTAR HOJE').locator('..').locator('.text-\\[21px\\]').first().textContent()
console.log('dia índice 1 (antes-depois) -> mostrou:', titleSkip)
await page.screenshot({ path: `${OUT}/inicio-pula-antes-depois.png` })

// Dia cuja sugestão (índice 3) é "me-conheca" (photo, obrigatória), SEM foto do estúdio.
await freezeDay(page, 3)
await page.goto(BASE + '/inicio', { waitUntil: 'networkidle' })
await page.waitForTimeout(300)
const titleNoPhoto = await page.locator('text=PARA POSTAR HOJE').locator('..').locator('.text-\\[21px\\]').first().textContent()
const hasWarning = await page.locator('text=Adicione sua foto no Meu Estúdio').count()
console.log('dia índice 3 (me-conheca), sem foto -> mostrou:', titleNoPhoto, '| aviso visível:', hasWarning > 0)
await page.screenshot({ path: `${OUT}/inicio-sem-foto-aviso.png` })

// Mesmo dia, agora COM foto do estúdio.
await setStudioPhoto(page)
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(300)
const hasWarningAfter = await page.locator('text=Adicione sua foto no Meu Estúdio').count()
console.log('dia índice 3 (me-conheca), com foto -> aviso visível:', hasWarningAfter > 0)
await page.screenshot({ path: `${OUT}/inicio-com-foto.png` })

await browser.close()
console.log('done')
