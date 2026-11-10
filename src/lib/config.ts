// Links e endereços externos.
export const SUPPORT_EMAIL = 'doupsdigital@gmail.com'
export const TERMS_URL = 'https://lashbox.app/termos'
export const PRIVACY_URL = 'https://lashbox.app/privacidade'

/** Pixel da Meta, só na /lp e nas páginas legais (nunca no app logado) — ver src/marketing/. */
export const META_PIXEL_ID = '1514627327214218'

/**
 * Link de checkout da assinatura (mensal/anual), usado no botão "Renovar assinatura" de
 * /assinatura-vencida. Mensal R$ 22,90, Anual R$ 149,00 (produto "LashBox" na Kiwify).
 */
export const KIWIFY_SUBSCRIPTION_CHECKOUT_URLS: Record<'mensal' | 'anual', string> = {
  mensal: 'https://pay.kiwify.com.br/OYcIZPz',
  anual: 'https://pay.kiwify.com.br/0oNpCfm',
}

/**
 * Área da Kiwify para a compradora entrar com o e-mail da compra. A Kiwify NÃO tem um link fixo
 * de "gerenciar assinatura": depois da compra e em cada renovação, ela manda um e-mail com um
 * botão próprio para cancelar a assinatura ou trocar o cartão (confirmado na documentação oficial,
 * ajuda.kiwify.com.br/pt-br/article/como-cancelar-uma-assinatura-como-produtor-1wnont9/, seção
 * "Cancelando uma assinatura como comprador"). Por isso, em /estudio, o botão "Gerenciar assinatura"
 * só abre esta área de login e explica o e-mail — não existe link direto por assinatura.
 */
export const KIWIFY_BUYER_AREA_URL = 'https://dashboard.kiwify.com.br'

/** Link de checkout de cada kit sazonal pago (nenhum é bônus da assinatura). */
export const KIT_CHECKOUT_URLS: Record<string, string> = {
  'fim-de-ano': 'https://pay.kiwify.com.br/sdTkj2H',
}
