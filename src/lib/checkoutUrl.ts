// Repassa os parâmetros da URL atual (utm_*, fbclid, etc.) para o link de checkout — mesma lógica
// do Agenda Lotada (vendas/index.html): anexa a query string inteira, sem filtrar por nome.
export function withForwardedParams(url: string): string {
  const qs = window.location.search.replace(/^\?/, '')
  if (!qs) return url
  return url + (url.includes('?') ? '&' : '?') + qs
}
