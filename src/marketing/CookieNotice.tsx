import { useEffect, useState } from 'react'

const KEY = 'lashbox:cookie-notice:v1'

function readChoice(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

function saveChoice() {
  try {
    localStorage.setItem(KEY, '1')
  } catch {
    // localStorage indisponível (modo privado etc.) — só não mostra de novo nesta sessão.
  }
}

/** Aviso discreto de cookies (Meta Pixel), fixo embaixo, que não bloqueia a página. */
export function CookieNotice() {
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    setDismissed(readChoice())
  }, [])

  if (dismissed) return null

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-0 z-50 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 bg-[#2A1E27] px-4 py-3 text-center text-[13px] text-white/90"
    >
      <span>Usamos cookies para medir nossos anúncios e melhorar o app.</span>
      <a href="/privacidade" className="font-semibold text-white underline underline-offset-2">
        Saiba mais
      </a>
      <button
        type="button"
        onClick={() => {
          saveChoice()
          setDismissed(true)
        }}
        className="ml-1 cursor-pointer rounded-full bg-white px-4 py-1 font-semibold text-[#2A1E27]"
      >
        Ok
      </button>
    </div>
  )
}
