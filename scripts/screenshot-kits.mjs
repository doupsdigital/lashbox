import { chromium } from 'playwright-core'

const BASE = 'http://127.0.0.1:5191'
const OUT = 'referencia/prints'

const STUDIO = {
  ownerName: 'Juliana Andrade', studioName: 'Studio Juliana Lash', neighborhood: 'Setor Bueno', city: 'Goiânia',
  address: '', whatsapp: '(62) 98247-0555', instagram: 'studiojulianalash', pixKey: 'juliana@studio.com',
  bookingLink: 'studiojulianalash.com/agenda', servicePrice: '180', maintenancePrice: '120', palette: 'rosa',
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

await page.goto(BASE + '/boas-vindas')
await page.evaluate((studio) => {
  localStorage.setItem('lashbox:onboarding-seen', '1')
  localStorage.setItem('lashbox:studio:v1', JSON.stringify(studio))
}, STUDIO)

// Estado bloqueado (não comprou o kit ainda)
await page.goto(BASE + '/kits?lockKits=1', { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
await page.screenshot({ path: `${OUT}/18-kits-bloqueado.png` })
await page.goto(BASE + '/kits/fim-de-ano?lockKits=1', { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
await page.screenshot({ path: `${OUT}/19-kit-detalhe-bloqueado.png` })

// Estado comprado
await page.goto(BASE + '/kits', { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
await page.screenshot({ path: `${OUT}/20-kits-comprado.png` })

console.log('ok')
await browser.close()
