import { useEffect, useRef, useState, type ReactNode, type SVGProps } from 'react'
import { KIWIFY_SUBSCRIPTION_CHECKOUT_URLS } from '../lib/config'
import { withForwardedParams } from '../lib/checkoutUrl'
import { trackAddToCart, trackViewContentOnceVisible } from './pixel'

const ICONS: Record<string, string> = {
  spark: 'M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6',
  share: 'M12 15V3M8 7l4-4 4 4M5 12v8h14v-8',
  tag: 'M3 12V4h8l10 10-8 8zM7.5 8.5h.01',
  msg: 'M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-5.4A8 8 0 1 1 21 12z',
  cal: 'M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM4 10h16M8 3v4M16 3v4',
  check: 'M5 12l5 5 9-10',
  x: 'M6 6l12 12M18 6L6 18',
}

function Icon({ d, ...rest }: { d: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...rest}>
      <path d={d} />
    </svg>
  )
}

const SEALS = ['Direto no celular', 'Sem precisar de Canva', 'Cancele quando quiser']

const STEPS = [
  { n: 1, t: 'Escolha um modelo', d: 'Agenda, valores, antes e depois, cuidados, depoimentos…', ic: ICONS.spark },
  { n: 2, t: 'Ele já vem com seus dados', d: 'Nome do estúdio, bairro, WhatsApp, Instagram e preços entram sozinhos.', ic: ICONS.user },
  { n: 3, t: 'Compartilhe', d: 'Direto no Story, no feed ou no Status do WhatsApp.', ic: ICONS.share },
]

const AREAS = [
  { t: 'Criar', d: '20 modelos de arte para o dia a dia, em 3 paletas, para Story e feed. E vale-presentes lindos para vender mais.', ic: ICONS.spark, bg: '#FBE8EE', c: '#E07A9B' },
  { t: 'Vender', d: 'Montador de ofertas com os seus preços, calculadora de preço justo e meta do mês.', ic: ICONS.tag, bg: '#F6EBD3', c: '#8A6A24' },
  { t: 'Conversar', d: '70 mensagens prontas para responder, cobrar o sinal, lembrar da manutenção e pedir indicação.', ic: ICONS.msg, bg: '#EDE1EA', c: '#5B2A4E' },
  { t: 'Planejar', d: 'O que postar em cada dia da semana e as datas do ano que enchem a agenda.', ic: ICONS.cal, bg: '#FBE8EE', c: '#E07A9B' },
]

const VITRINE = [
  { src: '/lp/art-valores.webp', alt: 'Tabela de valores' },
  { src: '/lp/art-quote.webp', alt: 'Depoimento' },
  { src: '/lp/art-bullets.webp', alt: 'Estilos de cílios' },
  { src: '/lp/art-antes-depois.webp', alt: 'Antes e depois' },
]

const SEM = ['Uma hora no Canva para fazer um story', 'Responder "quanto custa?" do zero toda vez', 'Ficar sem saber o que postar']
const COM = ['1 minuto e está pronto', 'Mensagem pronta, é só copiar', 'Sugestão do dia esperando por você']

const INC = ['20 modelos de arte', 'Vale-presente', 'Montador de ofertas e calculadoras', '70 mensagens prontas', 'Minhas clientes', 'Plano da semana e datas do ano', 'Para postar hoje']

const FAQ: [string, string][] = [
  ['Preciso baixar alguma coisa?', 'Não. A LashBox abre no navegador do celular, e você pode adicionar à tela inicial para usar como aplicativo.'],
  ['Funciona no iPhone e no Android?', 'Sim, nos dois. Também abre no computador.'],
  ['Preciso saber mexer com design?', 'Não. Você escolhe o modelo, e seus dados e sua foto entram sozinhos. É só compartilhar.'],
  ['Minha foto fica salva onde?', 'Só no seu celular. Ela não é enviada para nenhum servidor.'],
  ['Como recebo o acesso?', 'Logo depois do pagamento, entre em lashbox.app/entrar com o mesmo e-mail da compra e digite o código que chega no seu e-mail.'],
  ['Posso cancelar quando quiser?', 'Sim. O cancelamento é feito pela Kiwify, e você continua usando até o fim do período que já pagou.'],
  ['O que são os kits sazonais?', 'Coleções extras para datas especiais, como Black Friday, Natal e Dia das Mães, com artes, mensagens e um plano da data. São opcionais e vendidos dentro do app.'],
  ['Posso pagar com Pix?', 'Pode. No Pix Automático, você autoriza uma vez no app do banco e as renovações acontecem sozinhas.'],
]

function PlanButton({ plan, price, className, children }: { plan: 'mensal' | 'anual'; price: number; className: string; children: ReactNode }) {
  const url = withForwardedParams(KIWIFY_SUBSCRIPTION_CHECKOUT_URLS[plan])
  return (
    <a
      href={url}
      onClick={(e) => {
        e.preventDefault()
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

  useEffect(() => trackViewContentOnceVisible(plansRef.current), [])

  useEffect(() => {
    let alive = true
    fetch('/lp/demo.mp4', { method: 'HEAD' })
      .then((r) => alive && setVideoAvailable(r.ok))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const toPlans = () => plansRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="relative overflow-x-clip bg-white font-sans text-[#2A1E27]">
      {/* Header */}
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-3 px-5 py-[18px]">
        <div className="flex items-center gap-2">
          <img src="/icone-64.webp" alt="LashBox" width={38} height={38} className="rounded-[22%]" />
          <span className="text-[19px] font-bold">LashBox</span>
        </div>
        <a href="/entrar" className="text-[15px] font-semibold text-[#5B2A4E] no-underline">
          Já sou assinante
        </a>
      </div>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg,#fff 0%,#F6F2F4 100%)' }}>
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-x-6 gap-y-10 px-5 pt-7 pb-[72px]">
          <div className="flex min-w-0 flex-[1_1_400px] flex-col items-start gap-5">
            <div className="rounded-[20px] bg-[#FBE8EE] px-3.5 py-[7px] text-[13px] font-bold tracking-[.08em] text-[#5B2A4E] uppercase">
              Para lash designers
            </div>
            <h1 className="text-pretty text-[clamp(34px,6.2vw,58px)] leading-[1.04] font-extrabold tracking-[-.035em]">
              Seus posts, ofertas e mensagens prontos em 1 minuto. <span className="text-[#E07A9B]">Com o seu nome.</span>
            </h1>
            <p className="max-w-[520px] text-pretty text-[18px] leading-[1.5] text-[#6B5C66]">
              A LashBox é a caixa de ferramentas da lash designer: artes para Instagram e WhatsApp, vale-presentes, ofertas e
              mensagens prontas, já com o nome, a foto e os preços do seu estúdio. Tudo no celular.
            </p>
            <button
              type="button"
              ref={heroBtnRef}
              onClick={toPlans}
              className="press flex h-[58px] cursor-pointer items-center rounded-[29px] bg-[#5B2A4E] px-[34px] text-[18px] font-semibold text-white shadow-[0_12px_28px_rgba(91,42,78,.3)]"
            >
              Quero minha LashBox
            </button>
            <div className="flex flex-wrap gap-x-[18px] gap-y-2 text-[14px] font-medium text-[#6B5C66]">
              {SEALS.map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <Icon d={ICONS.check} width={16} height={16} stroke="#C9A15B" strokeWidth={2.6} />
                  {s}
                </div>
              ))}
            </div>
          </div>
          <div className="flex min-w-0 flex-[1_1_340px] justify-center">
            <div className="relative aspect-[1/1.18] w-full max-w-[440px]">
              <div className="absolute inset-x-[8%] inset-y-[6%] rounded-full bg-[#FBE8EE]" />
              <div className="absolute top-[4%] left-[3%] z-[1] w-[36%] -rotate-[9deg] overflow-hidden rounded-[10px] shadow-[0_14px_34px_rgba(91,42,78,.25)]">
                <img src="/lp/art-valores.webp" className="block aspect-[9/16] w-full object-cover" alt="Arte de tabela de valores" loading="eager" />
              </div>
              <div className="absolute top-0 right-0 z-[1] w-[34%] rotate-[8deg] overflow-hidden rounded-[10px] shadow-[0_14px_34px_rgba(91,42,78,.25)]">
                <img src="/lp/art-quote.webp" className="block aspect-[9/16] w-full object-cover" alt="Arte de depoimento" loading="eager" />
              </div>
              <div className="absolute right-[3%] bottom-[2%] z-[3] w-[32%] -rotate-[5deg] overflow-hidden rounded-[10px] shadow-[0_14px_34px_rgba(91,42,78,.25)]">
                <img src="/lp/art-bullets.webp" className="block aspect-[9/16] w-full object-cover" alt="Arte de estilos de cílios" loading="eager" />
              </div>
              <div className="absolute top-1/2 left-1/2 z-[2] w-[52%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[30px] border-[6px] border-[#1d1519] bg-[#F6F2F4] shadow-[0_30px_60px_rgba(42,30,39,.3)]" style={{ aspectRatio: '390/844' }}>
                <img src="/lp/screen-inicio.webp" className="block h-full w-full object-cover object-top" alt="Tela inicial da LashBox" loading="eager" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 toques */}
      <div className="mx-auto flex max-w-[1120px] flex-col gap-10 px-5 py-20">
        <h2 className="text-center text-[clamp(28px,4.4vw,42px)] font-extrabold tracking-[-.03em]">Em 3 toques, pronto para postar</h2>
        <div className="flex flex-wrap items-center justify-center gap-9">
          <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-3.5">
            {STEPS.map((s) => (
              <div key={s.n} className="flex items-center gap-4 rounded-[26px] bg-[#F6F2F4] p-5">
                <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[18px] bg-[#5B2A4E]">
                  <Icon d={s.ic} width={26} height={26} stroke="#fff" />
                </div>
                <div>
                  <div className="text-[19px] font-bold">
                    <span className="mr-1.5 text-[#8A6A24]">{s.n}.</span>
                    {s.t}
                  </div>
                  <div className="mt-[3px] text-[15.5px] leading-[1.4] text-[#6B5C66]">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
          <div
            className="relative aspect-[9/16] w-[280px] max-w-full flex-[0_1_280px] cursor-pointer overflow-hidden rounded-[28px] bg-[#5B2A4E] shadow-[0_24px_50px_rgba(91,42,78,.28)]"
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
        </div>
      </div>

      {/* Tudo o que você precisa */}
      <div className="bg-[#F6F2F4]">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-9 px-5 py-20">
          <h2 className="mx-auto max-w-[820px] text-pretty text-center text-[clamp(28px,4.4vw,42px)] font-extrabold tracking-[-.03em]">
            Tudo o que você precisa para divulgar, vender e valorizar seu trabalho
          </h2>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,250px),1fr))' }}>
            {AREAS.map((a) => (
              <div key={a.t} className="flex flex-col gap-3.5 rounded-[28px] bg-white p-6 shadow-[0_1px_2px_rgba(42,30,39,.04),0_10px_30px_rgba(91,42,78,.07)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-[16px]" style={{ background: a.bg }}>
                  <Icon d={a.ic} width={26} height={26} stroke={a.c} />
                </div>
                <div className="text-[22px] font-bold">{a.t}</div>
                <div className="text-[15.5px] leading-[1.5] text-[#6B5C66]">{a.d}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 rounded-[28px] px-7 py-6 text-white" style={{ background: 'linear-gradient(135deg,#5B2A4E,#8A3F6F)' }}>
            <Icon d={ICONS.spark} width={30} height={30} stroke="#E5C17E" strokeWidth={1.6} style={{ flex: 'none' }} />
            <div className="text-[19px] leading-[1.35] font-semibold">E todo dia, uma sugestão de "Para postar hoje", com a arte e a legenda prontas.</div>
          </div>
          <div className="flex justify-center gap-[clamp(14px,4vw,40px)] pt-2.5">
            <div className="w-[min(44%,240px)] overflow-hidden rounded-[30px] border-[6px] border-[#1d1519] bg-[#F6F2F4] shadow-[0_24px_50px_rgba(42,30,39,.25)]" style={{ aspectRatio: '390/844' }}>
              <img src="/lp/screen-galeria.webp" className="block h-full w-full object-cover object-top" alt="Galeria de modelos" loading="lazy" />
            </div>
            <div className="mt-10 w-[min(44%,240px)] overflow-hidden rounded-[30px] border-[6px] border-[#1d1519] bg-[#F6F2F4] shadow-[0_24px_50px_rgba(42,30,39,.25)]" style={{ aspectRatio: '390/844' }}>
              <img src="/lp/screen-vender.webp" className="block h-full w-full object-cover object-top" alt="Montador de ofertas" loading="lazy" />
            </div>
          </div>
        </div>
      </div>

      {/* Vitrine */}
      <div className="mx-auto flex max-w-[1120px] flex-col gap-8 px-5 py-20">
        <h2 className="text-pretty text-center text-[clamp(28px,4.4vw,42px)] font-extrabold tracking-[-.03em]">Feitas para o seu estúdio, não para qualquer um</h2>
        <div className="flex gap-4.5 overflow-x-auto px-1 pt-1.5 pb-5" style={{ scrollSnapType: 'x mandatory' }}>
          {VITRINE.map((v) => (
            <div key={v.alt} className="aspect-[9/16] flex-[0_0_min(62%,250px)] overflow-hidden rounded-2xl shadow-[0_14px_34px_rgba(91,42,78,.2)]" style={{ scrollSnapAlign: 'center' }}>
              <img src={v.src} className="block h-full w-full object-cover" alt={v.alt} loading="lazy" />
            </div>
          ))}
        </div>
        <div className="text-center text-[16px] leading-[1.5] text-[#6B5C66]">
          3 paletas (Rosa, Nude e dourado, Preto e dourado). Sua foto e seus dados entram sozinhos.
        </div>
      </div>

      {/* Sem/Com */}
      <div className="bg-[#FBE8EE]">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-8 px-5 py-20">
          <h2 className="text-center text-[clamp(28px,4.4vw,42px)] font-extrabold tracking-[-.03em]">Chega de perder tempo com post</h2>
          <div className="mx-auto grid w-full max-w-[860px] gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))' }}>
            <div className="flex flex-col gap-4 rounded-[28px] bg-white p-6">
              <div className="text-[14px] font-bold tracking-[.08em] text-[#8E808A] uppercase">Sem a LashBox</div>
              {SEM.map((t) => (
                <div key={t} className="flex items-start gap-3 text-[17px] leading-[1.4] text-[#6B5C66]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EFE8EC]">
                    <Icon d={ICONS.x} width={12} height={12} stroke="#8E808A" strokeWidth={3} />
                  </span>
                  {t}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-4 rounded-[28px] bg-[#5B2A4E] p-6 text-white shadow-[0_18px_40px_rgba(91,42,78,.3)]">
              <div className="text-[14px] font-bold tracking-[.08em] text-[#E5C17E] uppercase">Com a LashBox</div>
              {COM.map((t) => (
                <div key={t} className="flex items-start gap-3 text-[17px] leading-[1.4] font-medium">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E5C17E]">
                    <Icon d={ICONS.check} width={13} height={13} stroke="#3a2a00" strokeWidth={3.2} />
                  </span>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Planos */}
      <div ref={plansRef} id="planos" className="mx-auto flex max-w-[1120px] flex-col gap-8 px-5 py-20">
        <h2 className="text-center text-[clamp(28px,4.4vw,42px)] font-extrabold tracking-[-.03em]">Escolha seu plano</h2>
        <div className="mx-auto grid w-full max-w-[840px] items-stretch gap-[18px]" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))' }}>
          {/* Anual: 1º no celular (order-1), à direita no desktop (md:order-2) */}
          <div className="order-1 flex flex-col gap-[18px] rounded-[32px] bg-[#5B2A4E] p-[30px] text-white shadow-[0_24px_50px_rgba(91,42,78,.35)] md:order-2 md:relative">
            <div className="absolute top-[-14px] right-[22px] rounded-[14px] bg-[#E5C17E] px-3.5 py-1.5 text-[13px] font-bold text-[#3a2a00]">
              Melhor custo
            </div>
            <div className="text-[14px] font-bold tracking-[.08em] text-[#E5C17E] uppercase">Anual</div>
            <div>
              <div className="text-[44px] leading-none font-extrabold tracking-[-.04em]">
                R$ 149<span className="text-[18px] font-semibold tracking-normal opacity-80">/ano</span>
              </div>
              <div className="mt-2 text-[15px] leading-[1.5]">
                Equivale a <b>R$ 12,42 por mês</b>
                <br />
                Você economiza R$ 125 no ano
                <br />
                Ou em até 12x no cartão
              </div>
            </div>
            <PlanButton plan="anual" price={149} className="flex h-[54px] cursor-pointer items-center justify-center rounded-[27px] bg-[#E07A9B] text-[17px] font-bold text-[#2A1E27] no-underline">
              Assinar anual
            </PlanButton>
            <div className="flex flex-col gap-2.5 pt-1.5">
              {INC.map((t) => (
                <div key={t} className="flex gap-2.5 text-[15px] leading-[1.35]">
                  <Icon d={ICONS.check} width={18} height={18} stroke="#E5C17E" strokeWidth={2.8} style={{ flex: 'none', marginTop: 1 }} />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Mensal: 2º no celular (order-2), à esquerda no desktop (md:order-1) */}
          <div className="order-2 flex flex-col gap-[18px] rounded-[32px] bg-[#F6F2F4] p-[30px] md:order-1">
            <div className="text-[14px] font-bold tracking-[.08em] text-[#6B5C66] uppercase">Mensal</div>
            <div>
              <div className="text-[44px] leading-none font-extrabold tracking-[-.04em] text-[#5B2A4E]">
                R$ 22,90<span className="text-[18px] font-semibold tracking-normal text-[#6B5C66]">/mês</span>
              </div>
              <div className="mt-2 text-[15px] text-[#6B5C66]">Cancele quando quiser</div>
            </div>
            <PlanButton plan="mensal" price={22.9} className="flex h-[54px] cursor-pointer items-center justify-center rounded-[27px] border-2 border-[#5B2A4E] bg-white text-[17px] font-bold text-[#5B2A4E] no-underline">
              Assinar mensal
            </PlanButton>
            <div className="flex flex-col gap-2.5 pt-1.5">
              {INC.map((t) => (
                <div key={t} className="flex gap-2.5 text-[15px] leading-[1.35]">
                  <Icon d={ICONS.check} width={18} height={18} stroke="#C9A15B" strokeWidth={2.8} style={{ flex: 'none', marginTop: 1 }} />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-[700px] text-pretty text-center text-[14px] leading-[1.55] text-[#6B5C66]">
          Todas as ferramentas e modelos enquanto você for assinante, com melhorias constantes. Kits sazonais (como o de Fim de
          Ano) são opcionais e vendidos dentro do app, a partir de R$ 14,90.
        </div>
        <div className="text-center text-[15px] font-semibold">Pix, cartão ou boleto · Pagamento seguro pela Kiwify</div>
      </div>

      {/* Garantia */}
      <div className="mx-auto max-w-[820px] px-5 pb-20">
        <div className="flex flex-wrap items-center justify-center gap-5 rounded-[32px] bg-[#F6EBD3] p-[30px] text-left">
          <div
            className="flex h-[104px] w-[104px] shrink-0 flex-col items-center justify-center rounded-full border-[3px] border-[#C9A15B] bg-white"
            style={{ boxShadow: '0 0 0 6px #F6EBD3, 0 0 0 8px #C9A15B' }}
          >
            <div className="text-[40px] leading-none font-extrabold text-[#5B2A4E]">7</div>
            <div className="text-[15px] font-bold text-[#5B2A4E]">dias</div>
          </div>
          <div className="min-w-0 flex-[1_1_280px]">
            <div className="text-[26px] font-extrabold tracking-[-.02em]">Teste sem risco</div>
            <div className="mt-1.5 text-pretty text-[16.5px] leading-[1.5] text-[#4A3426]">
              Assine, monte seu estúdio e crie suas primeiras artes. Se em até 7 dias achar que não é para você, devolvemos 100%
              do valor.
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-[#F6F2F4]">
        <div className="mx-auto flex max-w-[760px] flex-col gap-7 px-5 py-20">
          <h2 className="text-center text-[clamp(28px,4.4vw,42px)] font-extrabold tracking-[-.03em]">Perguntas frequentes</h2>
          <div className="flex flex-col gap-2.5">
            {FAQ.map(([q, a], i) => (
              <div
                key={q}
                onClick={() => setOpen((v) => (v === i ? -1 : i))}
                className="cursor-pointer rounded-[22px] bg-white px-5 py-[18px] shadow-[0_2px_10px_rgba(91,42,78,.05)]"
              >
                <div className="flex items-center justify-between gap-3 text-[17px] font-semibold">
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
                {open === i && <div className="mt-2.5 text-pretty text-[15.5px] leading-[1.55] text-[#6B5C66]">{a}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA final */}
      <div className="text-center text-white" style={{ background: 'linear-gradient(135deg,#5B2A4E,#8A3F6F)' }}>
        <div className="mx-auto flex max-w-[760px] flex-col items-center gap-[22px] px-5 py-[84px]">
          <h2 className="text-balance text-[clamp(28px,5vw,46px)] font-extrabold tracking-[-.03em]">
            Sua próxima arte pode estar pronta em 1 minuto
          </h2>
          <button
            type="button"
            onClick={toPlans}
            className="press flex h-[58px] cursor-pointer items-center rounded-[29px] bg-white px-[34px] text-[18px] font-bold text-[#5B2A4E]"
          >
            Quero minha LashBox
          </button>
          <div className="text-[15px] opacity-90">A partir de R$ 12,42 por mês no plano anual · Garantia de 7 dias</div>
        </div>
      </div>

      {/* Rodapé */}
      <div className="mx-auto flex max-w-[1120px] flex-col items-center gap-3.5 px-5 pt-9 pb-10 text-center text-[14px] text-[#6B5C66]">
        <img src="/icone-64.webp" alt="" width={44} height={44} className="rounded-[11px]" />
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 font-medium">
          <a href="/entrar" className="no-underline">
            Já sou assinante · Entrar
          </a>
          <a href="/termos" className="no-underline">
            Termos de uso
          </a>
          <a href="/privacidade" className="no-underline">
            Política de privacidade
          </a>
        </div>
        <div>
          Suporte: <a href="mailto:doupsdigital@gmail.com">doupsdigital@gmail.com</a>
        </div>
        <div className="text-[13px]">LashBox · Um produto Doup - Soluções Digitais</div>
      </div>

      {/* Barra fixa (celular) */}
      {past && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-[rgba(42,30,39,.14)] bg-white/82 px-3.5 pt-2.5 pb-3.5 backdrop-blur-xl md:hidden">
          <div className="min-w-0">
            <div className="text-[15px] font-bold">LashBox</div>
            <div className="text-[13px] text-[#6B5C66]">a partir de R$ 12,42/mês</div>
          </div>
          <button
            type="button"
            onClick={toPlans}
            className="flex h-[46px] shrink-0 cursor-pointer items-center rounded-[23px] bg-[#5B2A4E] px-6 text-[16px] font-semibold text-white"
          >
            Ver planos
          </button>
        </div>
      )}
    </div>
  )
}
