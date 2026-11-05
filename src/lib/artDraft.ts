// Rascunho temporário para o botão "Usar na arte" do Montador de ofertas: preenche a arte
// bf-oferta com o combo escolhido. Fica só em memória (não precisa sobreviver a um recarregamento).
let draft: { artId: string; comboTitulo: string; preco: string } | null = null

export function setArtDraft(d: { artId: string; comboTitulo: string; preco: string }) {
  draft = d
}

/** Lê e limpa o rascunho, se for da arte pedida. */
export function takeArtDraft(artId: string) {
  if (draft?.artId !== artId) return null
  const d = draft
  draft = null
  return d
}
