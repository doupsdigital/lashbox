import { useEffect } from 'react'
import { SUPPORT_EMAIL } from '../lib/config'
import { LegalLayout } from './LegalLayout'

export function Privacy() {
  useEffect(() => {
    document.title = 'Política de Privacidade · LashBox'
  }, [])

  return (
    <LegalLayout>
      <h1 className="text-[32px] font-extrabold tracking-tight">Política de Privacidade</h1>
      <p className="text-[14px] text-[#6B5C66]">Última atualização: 6 de novembro de 2026</p>

      <p>
        Esta política explica quais dados o <b>LashBox</b> coleta, para que usa e quais são os seus direitos, de acordo com a
        Lei Geral de Proteção de Dados (Lei nº 13.709/2018, LGPD). Ela vale para a página de vendas e para o app, em
        lashbox.app.
      </p>

      <h2>1. Quem cuida dos seus dados</h2>
      <p>
        O controlador dos dados descritos aqui é <b>LashBox - Um produto Doup - Soluções Digitais</b>. Para qualquer assunto
        sobre privacidade, fale com a gente pelo e-mail <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>

      <h2>2. Quais dados coletamos</h2>
      <h3 className="mt-1 text-[16px] font-bold">Na assinatura</h3>
      <p>
        O pagamento é feito pela Kiwify. Depois da compra, a Kiwify nos envia os dados do pedido: nome, e-mail, telefone e
        documento (quando informados), número do pedido, plano e situação da assinatura (ativa, atrasada, cancelada).{' '}
        <b>Não recebemos nem guardamos dados do seu cartão</b>: eles ficam apenas com a Kiwify.
      </p>
      <h3 className="mt-1 text-[16px] font-bold">No app</h3>
      <ul>
        <li>O e-mail que você usa para entrar.</li>
        <li>O nome, os dados e os preços do seu estúdio, que você preenche em "Meu Estúdio".</li>
      </ul>
      <h3 className="mt-1 text-[16px] font-bold">Só no seu aparelho</h3>
      <p>
        A <b>foto do seu estúdio</b> e a sua lista de <b>"Minhas clientes"</b> ficam guardadas só no seu celular (no
        navegador), e <b>nunca são enviadas para o nosso servidor</b>. Se você trocar de aparelho ou limpar os dados do
        navegador, elas se perdem e precisam ser preenchidas de novo.
      </p>
      <h3 className="mt-1 text-[16px] font-bold">Na página de vendas</h3>
      <p>
        A página de vendas (lashbox.app/lp) e as páginas legais usam o <b>Pixel da Meta</b> (empresa dona do Facebook e do
        Instagram). Ele registra visitas a essas páginas e, no checkout da Kiwify, o início e a conclusão da compra. Com isso,
        medimos quais anúncios funcionam e mostramos anúncios para pessoas com interesse parecido. O pixel usa cookies e
        identificadores do seu navegador. Você pode limitar o uso desses dados nas configurações de anúncios da sua conta do
        Facebook ou do Instagram, e bloquear cookies de terceiros no seu navegador. <b>O app propriamente dito (depois do
        login) não usa o pixel.</b> Como qualquer site, o servidor de hospedagem registra dados técnicos de acesso (como
        endereço IP e navegador) para segurança e funcionamento.
      </p>

      <h2>3. Para que usamos os dados</h2>
      <ul>
        <li>Liberar o seu acesso depois do pagamento e suspendê-lo em caso de cancelamento, atraso, reembolso ou estorno.</li>
        <li>Enviar o link e o código de acesso para o seu e-mail.</li>
        <li>Preencher as artes, mensagens e ofertas com os dados do seu estúdio.</li>
        <li>Responder aos seus pedidos de suporte.</li>
        <li>Medir e melhorar os nossos anúncios (Pixel da Meta na página de vendas).</li>
        <li>Cumprir obrigações legais e prevenir fraudes.</li>
      </ul>
      <p>Não vendemos nem alugamos os seus dados para ninguém, e não enviamos mensagens de propaganda de terceiros.</p>

      <h2>4. Bases legais</h2>
      <p>
        Tratamos os seus dados para <b>executar o contrato</b> de assinatura e de uso do app, para <b>cumprir obrigações
        legais</b> e pelo nosso <b>legítimo interesse</b> em manter o serviço seguro e em divulgar o produto.
      </p>

      <h2>5. Com quem compartilhamos</h2>
      <p>Usamos empresas que nos ajudam a operar o produto e que tratam os dados apenas para isso:</p>
      <ul>
        <li><b>Kiwify</b>: pagamento, assinatura e emissão de documentos da compra.</li>
        <li><b>Supabase</b>: banco de dados e sistema de login do app.</li>
        <li><b>Vercel</b>: hospedagem da página de vendas e do app.</li>
        <li><b>Resend</b>: envio dos e-mails de acesso.</li>
        <li><b>Meta</b>: medição e otimização dos anúncios no Facebook e no Instagram (Pixel da Meta, só na página de vendas).</li>
        <li><b>Google Fonts</b>: entrega das fontes usadas no app, quando aplicável.</li>
      </ul>
      <p>
        Alguns desses serviços guardam dados em servidores fora do Brasil. Nesses casos, a transferência acontece para
        executar o contrato com você e com empresas que adotam medidas de segurança adequadas, como prevê a LGPD. Também
        podemos compartilhar dados quando a lei ou uma ordem judicial exigir.
      </p>

      <h2>6. Por quanto tempo guardamos</h2>
      <p>
        Guardamos os dados enquanto a sua conta existir. Se você pedir a exclusão, apagamos os seus dados do app em até 15
        dias, exceto o que precisarmos manter por obrigação legal, como os registros da compra.
      </p>

      <h2>7. Seus direitos</h2>
      <p>Pela LGPD, você pode pedir a qualquer momento:</p>
      <ul>
        <li>a confirmação de que tratamos seus dados e uma cópia deles;</li>
        <li>a correção de dados incompletos ou errados;</li>
        <li>a exclusão dos seus dados;</li>
        <li>a portabilidade dos dados;</li>
        <li>informações sobre com quem compartilhamos.</li>
      </ul>
      <p>
        Para isso, escreva para <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> a partir do e-mail da sua conta.
        Respondemos em até 15 dias. Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).
      </p>

      <h2>8. Segurança</h2>
      <p>
        O acesso ao app é feito sem senha, por link ou código enviado ao seu e-mail. Cada conta só consegue ver os próprios
        dados, e toda a comunicação é criptografada. Nenhum sistema é 100% seguro, mas adotamos medidas para proteger as suas
        informações e avisaremos você caso aconteça algum incidente relevante.
      </p>

      <h2>9. Idade</h2>
      <p>O LashBox é destinado a pessoas maiores de 18 anos.</p>

      <h2>10. Mudanças nesta política</h2>
      <p>
        Podemos atualizar esta política. Quando a mudança for importante, avisaremos pelo e-mail da conta ou dentro do app. A
        data no topo mostra a última atualização.
      </p>

      <p className="pt-2">
        Dúvidas? <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </LegalLayout>
  )
}
