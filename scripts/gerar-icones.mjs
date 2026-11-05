// Gera os ícones a partir de public/icone-lashbox.png (quadrado, fundo cheio).
// Rode com: npm run icons
//
// O favicon (16/32/48px) usa uma silhueta simplificada, só a maleta, em
// public/favicon-maleta.svg (ameixa #5B2A4E sobre blush #FBE8EE) — o ícone completo (com os
// detalhes que somem em tamanho pequeno) fica só a partir de 64px (pwa-192, pwa-512, apple-touch).
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'

const SRC = 'public/icone-lashbox.png'
const FAVICON_SRC = 'public/favicon-maleta.svg'
const OUT = 'public'
const RADIUS = 0.22
const PNG = { palette: true, quality: 95, effort: 10, dither: 1 }

const square = (src, size) => sharp(src).resize(size, size, { kernel: 'lanczos3' })

async function rounded(src, size) {
  const r = Math.round(size * RADIUS)
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" ry="${r}"/></svg>`,
  )
  const img = await square(src, size).png().toBuffer()
  return sharp(img).ensureAlpha().composite([{ input: mask, blend: 'dest-in' }])
}

async function areaColor(src, left, top) {
  const n = 24
  const { data, info } = await sharp(src).extract({ left, top, width: n, height: n }).raw().toBuffer({ resolveWithObject: true })
  const sum = [0, 0, 0]
  for (let i = 0; i < data.length; i += info.channels) for (let c = 0; c < 3; c++) sum[c] += data[i + c]
  return sum.map((v) => v / (data.length / info.channels))
}

const hex = (rgb) => '#' + rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')

async function maskable(src, size) {
  const SCALE = 0.8
  const meta = await sharp(src).metadata()
  const top = await areaColor(src, 0, 0)
  const bottom = await areaColor(src, 0, meta.height - 24)
  const ext = (1 - SCALE) / 2 / SCALE
  const at = (t) => top.map((v, i) => v + (bottom[i] - v) * t)
  const bg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hex(at(-ext))}"/><stop offset="1" stop-color="${hex(at(1 + ext))}"/></linearGradient></defs>
      <rect width="${size}" height="${size}" fill="url(#g)"/></svg>`,
  )
  const inner = Math.round(size * SCALE)
  const off = Math.round((size - inner) / 2)
  const feather = Math.round(inner * 0.06)
  const mask = await sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${inner}" height="${inner}"><rect x="${feather}" y="${feather}" width="${inner - 2 * feather}" height="${inner - 2 * feather}" rx="${feather * 2}" fill="#fff"/></svg>`,
    ),
  )
    .blur(feather / 2)
    .png()
    .toBuffer()
  const art = await sharp(await square(src, inner).png().toBuffer())
    .ensureAlpha()
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer()
  return sharp(bg).composite([{ input: art, left: off, top: off }])
}

function buildIco(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)
  const entries = []
  let offset = 6 + 16 * images.length
  for (const { size, png } of images) {
    const e = Buffer.alloc(16)
    e.writeUInt8(size >= 256 ? 0 : size, 0)
    e.writeUInt8(size >= 256 ? 0 : size, 1)
    e.writeUInt8(0, 2)
    e.writeUInt8(0, 3)
    e.writeUInt16LE(1, 4)
    e.writeUInt16LE(32, 6)
    e.writeUInt32LE(png.length, 8)
    e.writeUInt32LE(offset, 12)
    offset += png.length
    entries.push(e)
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.png)])
}

// PWA
await (await rounded(SRC, 192)).png(PNG).toFile(`${OUT}/pwa-192.png`)
await (await rounded(SRC, 512)).png(PNG).toFile(`${OUT}/pwa-512.png`)
await (await maskable(SRC, 512)).png(PNG).toFile(`${OUT}/pwa-maskable-512.png`)

// iPhone
await square(SRC, 180).png(PNG).toFile(`${OUT}/apple-touch-icon.png`)

// Favicons (usando o ícone completo — ver pendência no topo do arquivo)
await (await rounded(FAVICON_SRC, 32)).png(PNG).toFile(`${OUT}/favicon-32.png`)
await (await rounded(FAVICON_SRC, 48)).png(PNG).toFile(`${OUT}/favicon-48.png`)
const ico = []
for (const size of [16, 32, 48]) ico.push({ size, png: await (await rounded(FAVICON_SRC, size)).png().toBuffer() })
writeFileSync(`${OUT}/favicon.ico`, buildIco(ico))

// Versões leves para usar dentro das telas
for (const size of [64, 128, 256]) await square(SRC, size).webp({ quality: 88 }).toFile(`${OUT}/icone-${size}.webp`)

console.log('Ícones gerados em /public')
