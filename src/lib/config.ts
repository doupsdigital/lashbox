// Links e endereços externos. Preencher quando a Kiwify e o domínio existirem.
export const SUPPORT_EMAIL = 'doupsdigital@gmail.com'
export const TERMS_URL = 'https://www.lashbox.app/termos'
export const PRIVACY_URL = 'https://www.lashbox.app/privacidade'

/**
 * Link de checkout da assinatura (mensal/anual), usado no botão "Renovar assinatura" de
 * /assinatura-vencida. Vazio até o produto existir na Kiwify.
 */
export const KIWIFY_SUBSCRIPTION_CHECKOUT_URLS: Record<'mensal' | 'anual', string> = {
  mensal: '',
  anual: '',
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

/** Link de checkout de cada kit sazonal pago (nenhum é bônus da assinatura). Vazio até existir na Kiwify. */
export const KIT_CHECKOUT_URLS: Record<string, string> = {
  'fim-de-ano': '',
}
