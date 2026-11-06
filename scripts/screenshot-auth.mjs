import { chromium } from 'playwright-core'

const BASE = 'http://127.0.0.1:5191'
const OUT = 'referencia/prints'

const PAGES = [
  ['00-lp', '/lp'],
  ['00-entrar', '/?preview=entrar'],
  ['17-assinatura-vencida', '/?preview=expired'],
]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
for (const [name, path] of PAGES) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' })
  await page.waitForTimeout(350)
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log('ok', name)
}
await browser.close()
