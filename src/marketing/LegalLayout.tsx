import { useEffect, type ReactNode } from 'react'

/** Visual compartilhado de /termos e /privacidade: header com logo, tipografia do texto corrido e rodapé. */
export function LegalLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    return () => {
      document.head.removeChild(meta)
    }
  }, [])

  return (
    <div className="min-h-dvh bg-white font-sans text-[#2A1E27]">
      <header className="mx-auto flex max-w-[760px] items-center justify-between px-5 py-4">
        <a href="/lp" className="flex items-center gap-2 no-underline">
          <img src="/icone-64.webp" alt="LashBox" width={28} height={28} className="rounded-[22%]" />
          <span className="text-[16px] font-bold">LashBox</span>
        </a>
        <a href="/lp" className="text-[14px] font-semibold text-[#5B2A4E] no-underline">
          ← Voltar
        </a>
      </header>
      <main className="mx-auto flex max-w-[760px] flex-col gap-4 px-5 pt-4 pb-16 text-[15.5px] leading-[1.6] text-[#4A3A42] [&_a]:text-[#5B2A4E] [&_a]:font-semibold [&_h2]:mt-3 [&_h2]:text-[20px] [&_h2]:font-bold [&_h2]:text-[#2A1E27] [&_li]:ml-5 [&_li]:list-disc [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
        {children}
      </main>
      <footer className="border-t border-[#EFE6EA] py-8 text-center text-[13px] text-[#6B5C66]">
        <p>
          <a href="/termos" className="font-semibold text-[#5B2A4E] no-underline">
            Termos de Uso
          </a>{' '}
          ·{' '}
          <a href="/privacidade" className="font-semibold text-[#5B2A4E] no-underline">
            Privacidade
          </a>
        </p>
        <p className="mt-1.5">LashBox · Um produto Doup - Soluções Digitais</p>
      </footer>
    </div>
  )
}
