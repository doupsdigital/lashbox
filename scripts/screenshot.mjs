import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const BASE = 'http://127.0.0.1:5191'
const OUT = 'referencia/prints'
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
  ['01-boas-vindas', '/boas-vindas'],
  ['02-inicio', '/inicio'],
  ['03-criar', '/criar'],
  ['04-editor-arte', '/criar/horario-livre-hoje'],
  ['05-vale-presente', '/vale-presente'],
  ['06-vender', '/vender'],
  ['07-vender-ofertas', '/vender/ofertas'],
  ['08-vender-preco-justo', '/vender/preco-justo'],
  ['09-vender-meta', '/vender/meta'],
  ['10-mensagens', '/mensagens'],
  ['11-planejar', '/planejar'],
  ['12-planejar-datas', '/planejar?sub=year'],
  ['13-kits', '/kits'],
  ['14-kits-fim-de-ano', '/kits/fim-de-ano'],
  ['15-kits-locked', '/kits/verao-carnaval'],
  ['16-estudio', '/estudio'],
]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

// Prepara o localStorage (onboarding visto + Meu Estúdio preenchido) antes de qualquer tela do app
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

// Tela de login (reseta localStorage para simular deslogada, modo local ainda libera tudo,
// então screenshot isolado da tela de Login é feito separadamente abrindo o componente direto)
await browser.close()
console.log('done')
