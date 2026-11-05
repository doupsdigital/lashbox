import type { Studio } from '../state/studio'

function insta(studio: Studio) {
  return studio.instagram.replace(/^@/, '')
}

/** Rodapé das artes de Story/Post: linha 1 (nome · bairro) e linha 2 (contato). */
export function studioFootStory(studio: Studio) {
  const foot1 = [studio.studioName, studio.neighborhood].filter(Boolean).join(' · ')
  const ig = insta(studio)
  const foot2 = [studio.whatsapp && `Agende: ${studio.whatsapp}`, ig && `@${ig}`].filter(Boolean).join(' · ')
  return { foot1, foot2 }
}

/** Rodapé do vale-presente: uma linha só. */
export function studioFootGift(studio: Studio) {
  const ig = insta(studio)
  const contact = studio.whatsapp ? `Agende pelo WhatsApp ${studio.whatsapp}` : ig ? `@${ig}` : ''
  return [studio.studioName, contact].filter(Boolean).join(' · ')
}
