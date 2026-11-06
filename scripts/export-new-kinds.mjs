// Exporta um PNG real de cada um dos 5 tipos novos de arte, pelo app rodando de verdade
// (mesmo motor de exportação da usuária), para conferir tamanho e legibilidade.
// Uso: iniciar o dev server sem Supabase numa porta separada, depois rodar este script.
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5191'
const OUT = path.resolve('referencia/prints/novos-tipos')
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

const ANTES = path.resolve('referencia/prints/_test-antes.png')
const DEPOIS = path.resolve('referencia/prints/_test-depois.png')

const CASES = [
  { kind: 'beforeAfter', id: 'antes-depois', photos: [ANTES, DEPOIS] },
  { kind: 'menu', id: 'tabela-valores', photos: [] },
  { kind: 'quote', id: 'elogio-cliente', photos: [] },
  { kind: 'bullets', id: 'estilos-cilios', photos: [] },
  { kind: 'photo', id: 'resultado-do-dia', photos: [ANTES] },
]

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true })
const page = await context.newPage()
page.on('dialog', (d) => d.accept())

await page.goto(BASE + '/boas-vindas')
await page.evaluate((studio) => {
  localStorage.setItem('lashbox:onboarding-seen', '1')
  localStorage.setItem('lashbox:studio:v1', JSON.stringify(studio))
}, STUDIO)

for (const c of CASES) {
  await page.goto(BASE + `/criar/${c.id}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)

  const fileInputs = page.locator('input[type="file"]')
  for (let i = 0; i < c.photos.length; i++) {
    await fileInputs.nth(i).setInputFiles(c.photos[i])
  }
  if (c.photos.length) await page.waitForTimeout(200)

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /Salvar no celular|Gerando/ }).click()
  const download = await downloadPromise
  const outPath = path.join(OUT, `${c.kind}-${c.id}.png`)
  await download.saveAs(outPath)
  console.log('ok', c.kind, '->', outPath)
}

await browser.close()
console.log('done')
