// Prints 390×844 das telas que usam o conteúdo definitivo e os tipos novos de arte.
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

const PAGES = [
  ['criar-galeria', '/criar'],
  ['criar-editor-menu', '/criar/tabela-valores'],
  ['vender-ofertas', '/vender/ofertas'],
  ['planejar-semana', '/planejar'],
  ['planejar-datas', '/planejar?sub=year'],
  ['inicio', '/inicio'],
  ['mensagens', '/mensagens'],
]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

await page.goto(BASE + '/boas-vindas')
await page.evaluate((studio) => {
  localStorage.setItem('lashbox:onboarding-seen', '1')
  localStorage.setItem('lashbox:studio:v1', JSON.stringify(studio))
}, STUDIO)

for (const [name, path] of PAGES) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' })
  await page.waitForTimeout(350)
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log('ok', name)
}

await browser.close()
console.log('done')
