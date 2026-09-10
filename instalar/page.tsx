import Image from "next/image";
import Link from "next/link";
import { PageHeader, Panel } from "@/components/ui";
import { BotaoInstalar, PartilharLink, NotificacoesToggle } from "@/components/pwa";
import { Copiar } from "@/components/copiar";
import { urlDaApp, qrSvg } from "@/lib/app-url";

import { exigirSessao } from "@/lib/auth";
export const dynamic = "force-dynamic";

export default async function InstalarPage() {
  await exigirSessao();
  const base = await urlDaApp();
  const urlTelemovel = `${base}/app`;
  const urlPc = `${base}/`;
  const [qrTel, qrPc] = await Promise.all([qrSvg(urlTelemovel, 200), qrSvg(urlPc, 200)]);

  return (
    <div>
      <PageHeader
        titulo="Instalar a app"
        subtitulo="Partilha estes links com os efectivos. A app instala-se a partir do browser, fica no ecrã inicial com o emblema PTR e recebe notificações."
        accoes={<Link href="/instalar/cartaz" className="btn btn-secondary">🖨 Cartaz para imprimir</Link>}
      />

      <div className="panel rounded-2xl p-6 mb-4 flex flex-col md:flex-row items-center gap-6">
        <Image src="/emblema.png" alt="PTR" width={110} height={110} className="rounded-full ring-4 ring-gold-500/30" />
        <div className="flex-1 text-center md:text-left">
          <div className="text-xs uppercase tracking-[0.3em] text-gold-500 font-semibold">Link principal da app</div>
          <div className="mt-1 font-mono text-gold-300 break-all text-sm bg-ptr-950/60 border border-gold-500/20 rounded-lg px-3 py-2">{base}</div>
          <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
            <BotaoInstalar />
            <PartilharLink url={base} titulo="PTR PERSCOM" />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="panel rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5">
          <div className="rounded-xl overflow-hidden border-4 border-gold-500/40 bg-[#f7f3e8] p-1 shrink-0" dangerouslySetInnerHTML={{ __html: qrTel }} />
          <div className="text-center sm:text-left">
            <div className="text-2xl">📱</div>
            <h2 className="text-lg font-bold text-gold-300">Telemóvel</h2>
            <p className="text-sm text-slate-300 mt-1">Aponta a câmara ao QR. Abre as instruções de instalação para Android e iPhone.</p>
            <div className="mt-2 font-mono text-[11px] text-slate-400 break-all">{urlTelemovel}</div>
            <div className="mt-2"><Copiar texto={urlTelemovel} etiqueta="Copiar link telemóvel" /></div>
          </div>
        </div>
        <div className="panel rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5">
          <div className="rounded-xl overflow-hidden border-4 border-gold-500/40 bg-[#f7f3e8] p-1 shrink-0" dangerouslySetInnerHTML={{ __html: qrPc }} />
          <div className="text-center sm:text-left">
            <div className="text-2xl">💻</div>
            <h2 className="text-lg font-bold text-gold-300">PC</h2>
            <p className="text-sm text-slate-300 mt-1">Abre no Chrome ou Edge e clica em <b>⊕ Instalar</b> na barra de endereço. Ou usa apenas no browser.</p>
            <div className="mt-2 font-mono text-[11px] text-slate-400 break-all">{urlPc}</div>
            <div className="mt-2"><Copiar texto={urlPc} etiqueta="Copiar link PC" /></div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid md:grid-cols-3 gap-4">
          <Panel titulo="📱 Android">
            <ol className="text-sm text-slate-200 space-y-2 list-decimal list-inside">
              <li>Abre o link no <b>Chrome</b>.</li>
              <li>Toca em <b>⋮</b> (canto superior direito).</li>
              <li>Escolhe <b>“Instalar app”</b> ou <b>“Adicionar ao ecrã principal”</b>.</li>
              <li>Abre a app pelo ícone e toca em <b>Activar notificações</b>.</li>
            </ol>
          </Panel>
          <Panel titulo=" iPhone / iPad">
            <ol className="text-sm text-slate-200 space-y-2 list-decimal list-inside">
              <li>Abre o link no <b>Safari</b>.</li>
              <li>Toca no botão <b>Partilhar</b> (quadrado com seta).</li>
              <li>Escolhe <b>“Adicionar ao ecrã principal”</b>.</li>
              <li>Abre pelo ícone e activa as notificações (iOS 16.4+).</li>
            </ol>
          </Panel>
          <Panel titulo="💻 PC / Mac">
            <ol className="text-sm text-slate-200 space-y-2 list-decimal list-inside">
              <li>Abre o link no <b>Chrome</b> ou <b>Edge</b>.</li>
              <li>Clica no ícone <b>⊕ Instalar</b> na barra de endereço.</li>
              <li>A app abre em janela própria, como um programa.</li>
              <li>Também funciona directamente no browser, sem instalar.</li>
            </ol>
          </Panel>
        </div>
        <div className="space-y-4">
          <Panel titulo="🔔 Notificações">
            <p className="text-sm text-slate-300 mb-3">Activa para receber avisos de treinos, missões e lembretes.</p>
            <NotificacoesToggle />
          </Panel>
          <Panel titulo="Publicar fora do Arena">
            <p className="text-sm text-slate-300">
              Para a app ter um endereço próprio e permanente (abre em qualquer Chrome sem depender deste ambiente), segue o guia
              <code className="text-gold-300"> PUBLICAR.md</code> incluído no projecto — Vercel + Neon (grátis) ou Docker num VPS.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
