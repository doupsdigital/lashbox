import { useEffect, useRef, useState, type ReactNode, type SVGProps } from 'react'
import { KIWIFY_SUBSCRIPTION_CHECKOUT_URLS } from '../lib/config'
import { withForwardedParams } from '../lib/checkoutUrl'
import { track, trackEventOnceVisible } from '../lib/analytics'
import { trackAddToCart, trackViewContentOnceVisible } from './pixel'

/** Mude para true quando public/lp/demo.mp4 existir de verdade. */
const SHOW_VIDEO_SECTION = false

const ICONS: Record<string, string> = {
  spark: 'M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6',
  share: 'M12 15V3M8 7l4-4 4 4M5 12v8h14v-8',
  tag: 'M3 12V4h8l10 10-8 8zM7.5 8.5h.01',
  msg: 'M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-5.4A8 8 0 1 1 21 12z',
  cal: 'M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM4 10h16M8 3v4M16 3v4',
  check: 'M5 12l5 5 9-10',
  x: 'M6 6l12 12M18 6L6 18',
  clock: 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  eyeOff: 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22',
}

function Icon({ d, ...rest }: { d: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...rest}>
      <path d={d} />
    </svg>
  )
}

const STEPS = [
  {
    n: 1,
    t: 'Escolha a arte',
    d: 'Horário livre, valores, antes e depois, cuidados, depoimento… são 20 modelos para o dia a dia.',
    ic: ICONS.spark,
  },
  {
    n: 2,
    t: 'Seus dados entram sozinhos',
    d: 'Você preenche o seu estúdio uma vez. Nome, bairro, WhatsApp, Instagram e preços aparecem em todas as artes.',
    ic: ICONS.user,
  },
  {
    n: 3,
    t: 'Poste',
    d: 'Direto no Story, no feed ou no Status do WhatsApp.',
    ic: ICONS.share,
  },
]

const APP_FEATURES = [
  {
    tag: 'Criar',
    title: 'Story pronto antes do café esfriar',
    desc: '20 modelos de arte em 3 paletas, para Story e feed, com a sua foto e os seus dados. E vale-presentes lindos para vender mais em datas especiais.',
    ic: ICONS.spark,
    bg: '#FBE8EE',
    c: '#E07A9B',
  },
  {
    tag: 'Vender',
    title: 'Ofertas que vendem sem queimar seu preço',
    desc: 'O app monta combos com os SEUS valores e escreve a mensagem pronta. Ainda calcula o preço justo do seu trabalho e quantas clientes você precisa no mês.',
    ic: ICONS.tag,
    bg: '#F6EBD3',
    c: '#8A6A24',
  },
  {
    tag: 'Conversar',
    title: "Nunca mais trave no 'quanto custa?'",
    desc: '70 mensagens prontas para responder, confirmar horário, cobrar o sinal, lembrar da manutenção e pedir indicação. É só copiar.',
    ic: ICONS.msg,
    bg: '#EDE1EA',
    c: '#5B2A4E',
  },
  {
    tag: 'Planejar',
    title: 'Você sempre sabe o que postar',
    desc: 'Um plano para cada dia da semana e as datas do ano que enchem a agenda.',
    ic: ICONS.cal,
    bg: '#FBE8EE',
    c: '#E07A9B',
  },
]

const VITRINE = [
  { src: '/lp/art-valores.webp', alt: 'Tabela de valores, paleta Rosa' },
  { src: '/lp/art-valores-nude.webp', alt: 'Tabela de valores, paleta Nude e dourado' },
  { src: '/lp/art-bullets-preto.webp', alt: 'Estilos de cílios, paleta Preto e dourado' },
  { src: '/lp/art-quote.webp', alt: 'Depoimento, paleta Rosa' },
  { src: '/lp/art-antes-depois.webp', alt: 'Antes e depois, paleta Rosa' },
  { src: '/lp/art-quote-nude.webp', alt: 'Depoimento, paleta Nude e dourado' },
  { src: '/lp/art-valores-preto.webp', alt: 'Tabela de valores, paleta Preto e dourado' },
  { src: '/lp/art-bullets.webp', alt: 'Estilos de cílios, paleta Rosa' },
]

const INC = [
  '20 modelos de arte',
  'Vale-presente',
  'Montador de ofertas e calculadoras',
  '70 mensagens prontas',
  'Minhas clientes',
  'Plano da semana e datas do ano',
  'Para postar hoje',
]

const FAQ: [string, string][] = [
  [
    'O LashBox é um aplicativo mesmo?',
    'É sim. Ele abre no navegador do seu celular e você pode adicioná-lo à tela inicial, com o ícone do LashBox, para usar como qualquer app. Não precisa baixar nada da App Store ou da Play Store.',
  ],
  [
    'Qual a diferença para um pacote de artes do Canva?',
    'No pacote, você recebe arquivos e precisa editar um por um: trocar nome, telefone e preços. No LashBox, você preenche seus dados uma vez e todas as artes já saem prontas. E ainda tem vale-presente, ofertas, mensagens e um plano do que postar.',
  ],
  [
    'Preciso saber mexer com design?',
    'Não. Você escolhe o modelo e toca em compartilhar. Seus dados e sua foto entram sozinhos.',
  ],
  [
    'Funciona no iPhone e no Android?',
    'Sim, nos dois. Também abre no computador.',
  ],
  [
    'Como recebo o acesso?',
    'Logo depois do pagamento, entre em lashbox.app/entrar com o mesmo e-mail da compra e digite o código que chega no seu e-mail. Leva menos de 1 minuto.',
  ],
  [
    'Minha foto fica salva onde?',
    'Só no seu celular. Ela não é enviada para nenhum servidor.',
  ],
  [
    'Posso cancelar quando quiser?',
    'Sim. O cancelamento é feito pela Kiwify, e você continua usando até o fim do período que já pagou.',
  ],
  [
    'O que são os kits sazonais?',
    'Coleções extras para datas especiais, como Black Friday, Natal e Dia das Mães, com artes, mensagens e um plano da data. São opcionais e vendidos dentro do app.',
  ],
  [
    'Posso pagar com Pix?',
    'Pode. No Pix Automático, você autoriza uma vez no app do banco e as renovações acontecem sozinhas.',
  ],
]

function PlanButton({ plan, price, className, children }: { plan: 'mensal' | 'anual'; price: number; className: string; children: ReactNode }) {
  const url = withForwardedParams(KIWIFY_SUBSCRIPTION_CHECKOUT_URLS[plan])
  return (
    <a
      href={url}
      onClick={(e) => {
        e.preventDefault()
        track('lp_clique_plano', { plano: plan })
        trackAddToCart(price, () => {
          window.location.href = url
        })
      }}
      className={className}
    >
      {children}
    </a>
  )
}

export function LandingPage() {
  const [past, setPast] = useState(false)
  const [open, setOpen] = useState(-1)
  const [videoAvailable, setVideoAvailable] = useState(false)
  const [playing, setPlaying] = useState(false)
  const heroBtnRef = useRef<HTMLButtonElement>(null)
  const plansRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const check = () => {
      const b = heroBtnRef.current
      if (!b) return
      setPast(b.getBoundingClientRect().bottom < 0)
    }
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    check()
    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    track('lp_visualizada', {
      utm_source: params.get('utm_source') ?? undefined,
      utm_campaign: params.get('utm_campaign') ?? undefined,
      utm_content: params.get('utm_content') ?? undefined,
    })
  }, [])

  useEffect(() => trackViewContentOnceVisible(plansRef.current), [])
  useEffect(() => trackEventOnceVisible(plansRef.current, 'lp_planos_vistos'), [])

  // Capa: imagens críticas para o LCP, sem lazy loading — preload explícito, já que é o que
  // carrega primeiro vindo do anúncio.
  useEffect(() => {
    const hrefs = ['/lp/art-antes-depois.webp', '/lp/screen-inicio.webp']
    const links = hrefs.map((href) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = href
      document.head.appendChild(link)
      return link
    })
    return () => {
      links.forEach((link) => document.head.removeChild(link))
    }
  }, [])

  useEffect(() => {
    if (!SHOW_VIDEO_SECTION) return
    let alive = true
    fetch('/lp/demo.mp4', { method: 'HEAD' })
      .then((r) => alive && setVideoAvailable(r.ok && (r.headers.get('content-type') ?? '').startsWith('video/')))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const toPlans = () => plansRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="relative overflow-x-clip bg-[#5B2A4E] font-sans text-white">
      {/* Header */}
      <div className="relative z-10 mx-auto flex max-w-[1120px] items-center justify-between gap-3 px-5 py-[18px]">
        <div className="flex items-center gap-2">
          <img src="/icone-64.webp" alt="LashBox" width={38} height={38} className="rounded-[22%]" />
          <span className="text-[19px] font-bold text-white">LashBox</span>
        </div>
        <a href="/entrar" className="press rounded-full border border-white/30 px-4 py-2 text-[14.5px] font-semibold text-white no-underline">
          Já sou assinante
        </a>
      </div>

      {/* 1. HERO */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/lp/art-antes-depois.webp"
            alt=""
            aria-hidden="true"
            loading="eager"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full scale-125 object-cover blur-[22px] saturate-[1.05]"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg,rgba(91,42,78,.86),rgba(122,58,102,.8))' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,rgba(91,42,78,.35),rgba(91,42,78,0) 35%,rgba(91,42,78,.45))' }} />
        </div>
        <div className="relative mx-auto flex max-w-[1120px] flex-wrap items-center gap-x-10 gap-y-9 px-5 pt-5 pb-10 md:pt-10 md:pb-24">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col items-start gap-3.5 md:gap-6">
            <div className="self-center rounded-full border border-white/30 bg-white/10 px-5 py-2 text-[18px] font-bold tracking-[-.01em] text-white backdrop-blur-sm md:self-start md:px-7 md:py-2.5 md:text-[28px]">
              Ei, Lash Designer 👋
            </div>
            <h1 className="text-center leading-[1.03] font-extrabold tracking-[-.03em] text-white md:text-left">
              <span className="block text-balance text-[clamp(42px,11vw,66px)]">Esqueça os templates do Canva.</span>
              <span className="mt-1.5 block text-[clamp(22px,4.2vw,34px)] font-bold text-[#E07A9B] md:mt-3">O LashBox faz tudo por você.</span>
            </h1>
            <p className="max-w-[460px] self-center text-pretty text-center text-[15px] leading-[1.42] text-[#F6E9F0] md:max-w-[560px] md:self-start md:text-left md:text-[21px] md:leading-[1.4]">
              Seus posts prontos em 1 minuto, num app feito para lash designers.
            </p>
            <button
              type="button"
              ref={heroBtnRef}
              onClick={toPlans}
              className="press flex h-[52px] cursor-pointer items-center self-center rounded-full bg-[#E07A9B] px-8 text-[17px] font-bold text-white shadow-[0_12px_30px_rgba(224,122,155,.45)] [text-shadow:0_1px_0_rgba(91,42,78,.35)] md:h-[68px] md:self-start md:px-10 md:text-[23px]"
            >
              Quero o app LashBox
            </button>
            <div className="self-center text-center text-[12.5px] whitespace-nowrap text-[#F0DDE8] md:self-start md:text-left md:text-[17px]">
              A partir de R$ 12,42/mês · 7 dias de garantia
            </div>
          </div>
          <div className="flex min-w-0 flex-[1_1_300px] justify-center">
            <div className="relative w-full max-w-[300px] md:max-w-[440px]" style={{ aspectRatio: '358/466' }}>
              <div
                className="absolute top-[6%] left-0 z-[1] w-[58%] overflow-hidden rounded-[22px] border-[6px] border-[#1d1519] bg-[#F6F2F4] shadow-[0_24px_50px_rgba(0,0,0,.45)]"
                style={{ height: '94%', transform: 'rotate(-4deg)' }}
              >
                <img src="/lp/screen-inicio.webp" className="block h-full w-full object-cover object-top" alt="Tela inicial do app LashBox" loading="eager" fetchPriority="high" />
              </div>
              <div
                className="absolute top-0 left-[44%] z-[2] w-[56%] overflow-hidden rounded-[12px] shadow-[0_26px_50px_rgba(0,0,0,.5)]"
                style={{ height: '76%', transform: 'rotate(4deg)' }}
              >
                <img src="/lp/art-antes-depois.webp" className="block h-full w-full object-cover" alt="Arte de antes e depois com o nome do estúdio" loading="eager" fetchPriority="high" />
                <div className="absolute top-[86%] left-[12%] h-[10%] w-[76%] rounded-full border-[3px] border-[#E07A9B]" />
              </div>
              <svg className="pointer-events-none absolute top-[72%] left-[44%] z-[3] w-[15%]" viewBox="0 0 50 40" fill="none" stroke="#E07A9B" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
                <path d="M44 30C30 36 14 24 10 6" />
                <path d="M2 14L10 4 20 12" />
              </svg>
              <div className="absolute top-[78%] left-[53%] z-[3] text-[26px] leading-none font-bold text-white md:text-[34px]" style={{ fontFamily: 'Caveat, cursive' }}>
                seu nome aqui ✨
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. COMO FUNCIONA */}
      <div style={{ background: '#4A2140' }}>
        <div className="mx-auto flex max-w-[1120px] flex-col items-center gap-10 px-5 py-20">
          <h2 className="text-center text-[clamp(28px,4.4vw,42px)] font-extrabold tracking-[-.03em] text-white">
            Do zero ao post em 3 toques
          </h2>
          <div className="flex w-full flex-wrap items-center justify-center gap-9">
            <div className="flex min-w-0 max-w-[620px] flex-1 flex-col gap-3.5">
              {STEPS.map((s) => (
                <div key={s.n} className="flex items-center gap-4 rounded-[26px] border border-white/[0.12] bg-white/[0.07] p-5">
                  <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[18px] bg-[#E07A9B]">
                    <Icon d={s.ic} width={26} height={26} stroke="#fff" />
                  </div>
                  <div>
                    <div className="text-[19px] font-bold text-white">
                      <span className="mr-1.5 text-[#C9A15B]">{s.n}.</span>
                      {s.t}
                    </div>
                    <div className="mt-[3px] text-[15.5px] leading-[1.4] text-white/75">{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
            {SHOW_VIDEO_SECTION && (
              <div
                className="relative aspect-[9/16] w-[280px] max-w-full flex-[0_1_280px] cursor-pointer overflow-hidden rounded-[28px] bg-[#3B1932] shadow-[0_24px_50px_rgba(0,0,0,.4)]"
                onClick={() => videoAvailable && setPlaying(true)}
              >
                {playing && videoAvailable ? (
                  <video src="/lp/demo.mp4" className="block h-full w-full object-cover" autoPlay muted playsInline controls>
                    <track kind="captions" src="/lp/demo.vtt" srcLang="pt" label="Português" />
                  </video>
                ) : (
                  <>
                    <img src="/lp/screen-editor.webp" className="block h-full w-full object-cover object-top" style={{ filter: 'brightness(.82)' }} alt="Capa do vídeo" />
                    {videoAvailable && (
                      <div className="absolute top-1/2 left-1/2 flex h-[76px] w-[76px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 shadow-[0_8px_24px_rgba(0,0,0,.25)]">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="#5B2A4E" style={{ marginLeft: 4 }}>
                          <path d="M7 4l13 8-13 8z" />
                        </svg>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          <div className="rounded-full border border-white/[0.14] bg-white/[0.07] px-6 py-3 text-center text-[16px] md:text-[17px] font-semibold text-[#E07A9B]">
            ✨ Tudo isso no celular, entre uma cliente e outra.
          </div>
        </div>
      </div>

      {/* 3. O QUE TEM DENTRO DO APP */}
      <div>
        <div className="mx-auto flex max-w-[1120px] flex-col gap-9 px-5 py-20">
          <h2 className="mx-auto max-w-[820px] text-pretty text-center text-[clamp(28px,4.4vw,42px)] font-extrabold tracking-[-.03em] text-white">
            Uma caixa de ferramentas inteira no seu bolso
          </h2>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,250px),1fr))' }}>
            {APP_FEATURES.map((a) => (
              <div key={a.tag} className="flex flex-col gap-3.5 rounded-[28px] border border-white/[0.12] bg-white/[0.07] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[16px]" style={{ background: a.bg }}>
                    <Icon d={a.ic} width={26} height={26} stroke={a.c} />
                  </div>
                  <span className="text-[12px] font-bold tracking-[.08em] text-[#C9A15B] uppercase">{a.tag}</span>
                </div>
                <div className="text-[20px] font-bold leading-[1.25] text-white">{a.title}</div>
                <div className="text-[15px] leading-[1.5] text-white/80">{a.desc}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 rounded-[28px] border border-white/[0.14] bg-[#E07A9B]/18 px-7 py-6 text-white">
            <Icon d={ICONS.spark} width={30} height={30} stroke="#C9A15B" strokeWidth={1.6} style={{ flex: 'none' }} />
            <div className="text-[18px] md:text-[19px] leading-[1.35] font-semibold">
              E todo dia, ao abrir o app, uma sugestão de "Para postar hoje" com a arte e a legenda prontas.
            </div>
          </div>
          <div className="flex items-start justify-center gap-[clamp(14px,4vw,40px)] pt-2.5">
            <div className="w-[min(44%,240px)] overflow-hidden rounded-[30px] border-[6px] border-[#1d1519] bg-[#F6F2F4] shadow-[0_24px_50px_rgba(0,0,0,.4)]" style={{ aspectRatio: '390/844' }}>
              <img src="/lp/screen-galeria.webp" className="block h-full w-full object-cover object-top" alt="Galeria de modelos" loading="eager" />
            </div>
            <div className="mt-10 w-[min(44%,240px)] overflow-hidden rounded-[30px] border-[6px] border-[#1d1519] bg-[#F6F2F4] shadow-[0_24px_50px_rgba(0,0,0,.4)]" style={{ aspectRatio: '390/844' }}>
              <img src="/lp/screen-vender.webp" className="block h-full w-full object-cover object-top" alt="Montador de ofertas" loading="eager" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. VITRINE DE ARTES */}
      <div style={{ background: '#4A2140' }}>
        <div className="mx-auto flex max-w-[1120px] flex-col gap-8 px-5 py-20">
          <h2 className="text-pretty text-center text-[clamp(28px,4.4vw,42px)] font-extrabold tracking-[-.03em] text-white">
            Artes de estúdio profissional. Com o seu nome.
          </h2>
          <div className="flex gap-4.5 overflow-x-auto px-1 pt-1.5 pb-5" style={{ scrollSnapType: 'x mandatory' }}>
            {VITRINE.map((v) => (
              <div key={v.alt} className="aspect-[9/16] flex-[0_0_min(62%,250px)] overflow-hidden rounded-2xl shadow-[0_14px_34px_rgba(0,0,0,.4)]" style={{ scrollSnapAlign: 'center' }}>
                <img src={v.src} className="block h-full w-full object-cover" alt={v.alt} loading="lazy" />
              </div>
            ))}
          </div>
          <div className="text-center text-[16px] leading-[1.5] text-white/80">
            3 paletas: Rosa, Nude e dourado, Preto e dourado. Sua foto e seus dados entram sozinhos.
          </div>
        </div>
      </div>

      {/* 5. PLANOS */}
      <div ref={plansRef} id="planos" className="relative mx-auto flex max-w-[1120px] flex-col gap-8 px-5 py-20">
        <div className="pointer-events-none absolute top-10 right-[6%] h-[280px] w-[280px] rounded-full bg-[#E07A9B]/22 blur-3xl" />
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="relative text-[clamp(28px,4.4vw,42px)] font-extrabold tracking-[-.03em] text-white">
            Comece hoje
          </h2>
          <p className="max-w-[640px] text-pretty text-[17px] md:text-[18px] leading-[1.5] text-white/80">
            No plano anual, sai por menos de R$ 3 por semana. Basta uma cliente nova no ano para o LashBox se pagar.
          </p>
        </div>
        <div className="relative mx-auto grid w-full max-w-[840px] items-stretch gap-[18px]" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))' }}>
          {/* Anual: destaque claro da página — 1º no celular (order-1), à direita no desktop (md:order-2) */}
          <div className="relative order-1 flex flex-col gap-[18px] rounded-[32px] bg-[#FBE8EE] p-[30px] text-[#2A1E27] shadow-[0_24px_50px_rgba(0,0,0,.35)] md:order-2">
            <div className="absolute top-[-14px] right-[22px] rounded-[14px] bg-[#C9A15B] px-3.5 py-1.5 text-[13px] font-bold text-[#5B2A4E]">Melhor custo</div>
            <div className="text-[14px] font-bold tracking-[.08em] text-[#8A6A24] uppercase">Anual</div>
            <div>
              <div className="text-[44px] leading-none font-extrabold tracking-[-.04em] text-[#5B2A4E]">
                R$ 149<span className="text-[18px] font-semibold tracking-normal opacity-70">/ano</span>
              </div>
              <div className="mt-2 text-[15px] leading-[1.5] text-[#6B5C66]">
                Equivale a <b className="text-[#2A1E27]">R$ 12,42 por mês</b>
                <br />
                Você economiza R$ 125 no ano
                <br />
                Ou em até 12x no cartão
              </div>
            </div>
            <PlanButton plan="anual" price={149} className="flex h-[54px] cursor-pointer items-center justify-center rounded-[27px] bg-[#E07A9B] text-[17px] font-bold text-white no-underline">
              Assinar anual
            </PlanButton>
            <div className="flex flex-col gap-2.5 pt-1.5">
              {INC.map((t) => (
                <div key={t} className="flex gap-2.5 text-[15px] leading-[1.35] text-[#4A3A42]">
                  <Icon d={ICONS.check} width={18} height={18} stroke="#5B2A4E" strokeWidth={2.8} style={{ flex: 'none', marginTop: 1 }} />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Mensal: card translúcido — 2º no celular (order-2), à esquerda no desktop (md:order-1) */}
          <div className="order-2 flex flex-col gap-[18px] rounded-[32px] border border-white/[0.14] bg-white/[0.07] p-[30px] md:order-1">
            <div className="text-[14px] font-bold tracking-[.08em] text-white/70 uppercase">Mensal</div>
            <div>
              <div className="text-[44px] leading-none font-extrabold tracking-[-.04em] text-white">
                R$ 22,90<span className="text-[18px] font-semibold tracking-normal text-white/70">/mês</span>
              </div>
              <div className="mt-2 text-[15px] text-white/75">Cancele quando quiser</div>
            </div>
            <PlanButton plan="mensal" price={22.9} className="flex h-[54px] cursor-pointer items-center justify-center rounded-[27px] border-2 border-white text-[17px] font-bold text-white no-underline">
              Assinar mensal
            </PlanButton>
            <div className="flex flex-col gap-2.5 pt-1.5">
              {INC.map((t) => (
                <div key={t} className="flex gap-2.5 text-[15px] leading-[1.35] text-white/85">
                  <Icon d={ICONS.check} width={18} height={18} stroke="#C9A15B" strokeWidth={2.8} style={{ flex: 'none', marginTop: 1 }} />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="relative text-center text-[15px] font-semibold text-white">
          Pix ou cartão · Pagamento seguro pela Kiwify · Acesso na hora
        </div>
      </div>

      {/* 6. GARANTIA */}
      <div className="mx-auto max-w-[820px] px-5 pb-20">
        <div className="flex flex-wrap items-center justify-center gap-5 rounded-[32px] border border-white/[0.14] bg-white/[0.07] p-[30px] text-left">
          <div
            className="flex h-[112px] w-[112px] shrink-0 flex-col items-center justify-center rounded-full border-[3px] border-[#C9A15B] bg-[#4A2140]"
            style={{ boxShadow: '0 0 0 6px rgba(201,161,91,.18), 0 0 0 8px #C9A15B' }}
          >
            <div className="text-[42px] leading-none font-extrabold text-[#C9A15B]">7</div>
            <div className="text-[15px] font-bold text-[#C9A15B]">dias</div>
          </div>
          <div className="min-w-0 flex-[1_1_280px]">
            <div className="text-[26px] font-extrabold tracking-[-.02em] text-white">Teste por 7 dias, sem risco</div>
            <div className="mt-1.5 text-pretty text-[16.5px] leading-[1.5] text-white/80">
              Assine, monte seu estúdio e crie seus primeiros posts. Se em até 7 dias achar que não é para você, devolvemos 100% do seu dinheiro. Sem perguntas.
            </div>
          </div>
        </div>
      </div>

      {/* 7. PERGUNTAS FREQUENTES */}
      <div style={{ background: '#4A2140' }}>
        <div className="mx-auto flex max-w-[760px] flex-col gap-7 px-5 pt-20 pb-10">
          <h2 className="text-center text-[clamp(28px,4.4vw,42px)] font-extrabold tracking-[-.03em] text-white">Perguntas frequentes</h2>
          <div className="flex flex-col gap-2.5">
            {FAQ.map(([q, a], i) => (
              <div
                key={q}
                onClick={() => setOpen((v) => (v === i ? -1 : i))}
                className="cursor-pointer rounded-[22px] border border-white/[0.12] bg-white/[0.06] px-5 py-[18px]"
              >
                <div className="flex items-center justify-between gap-3 text-[17px] font-semibold text-white">
                  <span>{q}</span>
                  <Icon
                    d="M6 9l6 6 6-6"
                    width={20}
                    height={20}
                    stroke="#E07A9B"
                    strokeWidth={2.4}
                    style={{ flex: 'none', transform: `rotate(${open === i ? 180 : 0}deg)`, transition: 'transform .2s' }}
                  />
                </div>
                {open === i && <div className="mt-2.5 text-pretty text-[15.5px] leading-[1.55] text-white/75">{a}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div style={{ background: '#4A2140' }}>
        <div className="mx-auto flex max-w-[1120px] flex-col items-center gap-3.5 px-5 pb-10 text-center text-[14px] text-white/70">
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 font-semibold [&_a]:text-white [&_a]:no-underline [&_a]:hover:underline">
            <a href="/termos">Termos de uso</a>
            <a href="/privacidade">Política de privacidade</a>
          </div>
          <div>
            Suporte:{' '}
            <a href="mailto:doupsdigital@gmail.com" className="font-semibold text-white no-underline hover:underline">
              doupsdigital@gmail.com
            </a>
          </div>
          <div className="text-[13px] text-white/55">LashBox · Um produto Doup - Soluções Digitais</div>
        </div>
      </div>

      {/* Barra fixa (celular) */}
      {past && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-white/10 bg-[#4A2140]/92 px-3.5 pt-2.5 pb-3.5 backdrop-blur-xl md:hidden">
          <div className="min-w-0">
            <div className="text-[15px] font-bold text-white">App LashBox</div>
            <div className="text-[13px] text-white/70">a partir de R$ 12,42/mês</div>
          </div>
          <button
            type="button"
            onClick={toPlans}
            className="flex h-[46px] shrink-0 cursor-pointer items-center rounded-[23px] bg-[#E07A9B] px-5 text-[15px] font-semibold text-white whitespace-nowrap"
          >
            Ver planos
          </button>
        </div>
      )}
    </div>
  )
}
