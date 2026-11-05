// Exporta uma arte (DOM já renderizado em tamanho real) como PNG e compartilha ou baixa.
import { toBlob, toPng } from 'html-to-image'

export async function exportNodeToPng(node: HTMLElement, width: number, height: number): Promise<Blob> {
  await document.fonts.ready
  const opts = { width, height, pixelRatio: 1, skipFonts: false }
  try {
    const blob = await toBlob(node, opts)
    if (blob) return blob
  } catch (e) {
    console.warn('toBlob falhou, tentando toPng', e)
  }
  // Alguns navegadores de celular falham no toBlob; toPng (data URL) é mais compatível.
  const dataUrl = await toPng(node, opts)
  const res = await fetch(dataUrl)
  return await res.blob()
}

/** Compartilha o arquivo (Web Share API nível 2); se não der, baixa o PNG. */
export async function shareOrDownloadPng(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: 'image/png' })
  const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean }
  let canShareFiles = false
  try {
    canShareFiles = !!(nav.canShare?.({ files: [file] }) && navigator.share)
  } catch {
    canShareFiles = false
  }
  if (canShareFiles) {
    try {
      await navigator.share({ files: [file] })
      return 'shared' as const
    } catch {
      // cancelou ou falhou: cai no download
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  return 'downloaded' as const
}
