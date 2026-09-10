import Link from "next/link";
import { exigirComando } from "@/lib/auth";
import { PageHeader, Panel, Tag } from "@/components/ui";
import { Copiar } from "@/components/copiar";
import { urlDaApp } from "@/lib/app-url";

export const dynamic = "force-dynamic";

const REPO = "ptr-perscom";

export default async function PublicarPage() {
  await exigirComando();
  const actual = await urlDaApp();
  const permanente = !!process.env.NEXT_PUBLIC_APP_URL;
  const vercelDeploy = `https://vercel.com/new/clone?repository-url=https://github.com/O-TEU-UTILIZADOR/${REPO}&project-name=${REPO}&env=DATABASE_URL,NEXT_PUBLIC_APP_URL,COMANDO_PASSWORD,AUTH_SECRET&envDescription=DATABASE_URL%20do%20Neon%3B%20NEXT_PUBLIC_APP_URL%20%3D%20endere%C3%A7o%20final%3B%20COMANDO_PASSWORD%20%3D%20REDPTR2026%3B%20AUTH_SECRET%20%3D%20segredo%20aleat%C3%B3rio`;

  return (
    <div>
      <PageHeader
        titulo="Publicar com endereço permanente"
        subtitulo="A pré-visualização do Arena muda de endereço a cada arranque. Para a app ter um link fixo (e o ícone no telemóvel nunca quebrar), publica-a numa das opções abaixo — todas têm plano gratuito."
      />

      <div className={`panel rounded-xl p-4 mb-4 flex flex-wrap items-center justify-between gap-3 ${permanente ? "!border-emerald-500/40" : "!border-amber-500/40"}`}>
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-400">Endereço actual</div>
          <div className="font-mono text-gold-300 text-sm break-all">{actual}</div>
        </div>
        {permanente ? <Tag tone="green">✓ Endereço permanente configurado</Tag> : <Tag tone="gold">Temporário (Arena)</Tag>}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Panel titulo="Passo 1 — Descarregar o projecto">
            <p className="text-sm text-slate-300 mb-3">Descarrega o código completo da app (sem dados pessoais nem passwords). Vais precisar dele para o colocar no GitHub.</p>
            <a href="/api/exportar-projecto" className="btn btn-primary">⬇ Descarregar projecto (.zip)</a>
          </Panel>

          <Panel titulo="Passo 2 — Colocar no GitHub (grátis)">
            <ol className="text-sm text-slate-200 space-y-2 list-decimal list-inside">
              <li>Cria conta em <a href="https://github.com/signup" target="_blank" rel="noreferrer" className="text-gold-300 underline">github.com</a> (se ainda não tiveres).</li>
              <li>Vai a <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-gold-300 underline">github.com/new</a> → nome <code className="text-gold-300">{REPO}</code> → <b>Private</b> → <i>Create repository</i>.</li>
              <li>Na página do repositório escolhe <b>“uploading an existing file”</b>, descompacta o ZIP no teu PC e arrasta <b>todo o conteúdo da pasta</b> para a janela do browser → <i>Commit changes</i>.</li>
            </ol>
          </Panel>

          <Panel titulo="Passo 3 — Base de dados grátis (Neon)">
            <ol className="text-sm text-slate-200 space-y-2 list-decimal list-inside">
              <li>Cria conta em <a href="https://console.neon.tech/signup" target="_blank" rel="noreferrer" className="text-gold-300 underline">neon.tech</a> → <i>New Project</i> → nome <code className="text-gold-300">ptr-perscom</code> → região <b>Europe (Frankfurt)</b>.</li>
              <li>Copia a <b>Connection string</b> (começa por <code className="text-gold-300">postgresql://</code> e termina em <code className="text-gold-300">?sslmode=require</code>). Guarda-a — é o <code className="text-gold-300">DATABASE_URL</code>.</li>
            </ol>
            <p className="text-xs text-slate-400 mt-3">Não precisas de criar tabelas: a app cria e actualiza a base de dados sozinha no primeiro arranque, incluindo a conta <code>comando</code>.</p>
          </Panel>

          <Panel titulo="Passo 4 — Publicar na Vercel (grátis)">
            <ol className="text-sm text-slate-200 space-y-2 list-decimal list-inside">
              <li>Cria conta em <a href="https://vercel.com/signup" target="_blank" rel="noreferrer" className="text-gold-300 underline">vercel.com</a> <b>com o GitHub</b>.</li>
              <li>Clica em <i>Add New → Project</i> → importa o repositório <code className="text-gold-300">{REPO}</code>.</li>
              <li>Em <b>Environment Variables</b> adiciona:</li>
            </ol>
            <div className="mt-3 rounded-lg border border-gold-500/20 overflow-hidden">
              <table className="table">
                <tbody>
                  <Var nome="DATABASE_URL" valor="(a connection string do Neon)" />
                  <Var nome="NEXT_PUBLIC_APP_URL" valor={`https://${REPO}.vercel.app`} />
                  <Var nome="COMANDO_PASSWORD" valor="REDPTR2026" />
                  <Var nome="AUTH_SECRET" valor="(um texto longo e aleatório, ex.: 40 letras e números)" />
                </tbody>
              </table>
            </div>
            <ol className="text-sm text-slate-200 space-y-2 list-decimal list-inside mt-3" start={4}>
              <li>Clica em <b>Deploy</b>. Em ~2 minutos a app fica em <code className="text-gold-300">https://{REPO}.vercel.app</code> — esse é o endereço permanente para partilhar e instalar.</li>
              <li><b>Domínio próprio (opcional):</b> em <i>Settings → Domains</i> adiciona por ex. <code className="text-gold-300">perscom.ptr-rangers.pt</code> e segue as instruções de DNS. Depois actualiza <code>NEXT_PUBLIC_APP_URL</code>.</li>
            </ol>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel titulo="Alternativas com 1 clique">
            <p className="text-xs text-slate-400 mb-3">Depois do código estar no GitHub, estas plataformas criam app + base de dados automaticamente com os ficheiros já incluídos no projecto.</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2"><span>🟣</span><div><b>Render</b> — <a href="https://dashboard.render.com/blueprints" target="_blank" rel="noreferrer" className="text-gold-300 underline">New Blueprint</a> → escolhe o repositório. Usa o <code>render.yaml</code> incluído (app + PostgreSQL grátis).</div></li>
              <li className="flex items-start gap-2"><span>🚂</span><div><b>Railway</b> — <a href="https://railway.app/new" target="_blank" rel="noreferrer" className="text-gold-300 underline">New Project</a> → <i>Deploy from GitHub</i> + <i>Add PostgreSQL</i>. Define <code>DATABASE_URL=${"{{Postgres.DATABASE_URL}}"}</code> e <code>NEXT_PUBLIC_APP_URL</code>.</div></li>
              <li className="flex items-start gap-2"><span>🐳</span><div><b>Servidor próprio (VPS)</b> — <code>docker compose up -d --build</code> com o <code>docker-compose.yml</code> incluído.</div></li>
            </ul>
          </Panel>
          <Panel titulo="Valores para copiar">
            <div className="space-y-2 text-xs">
              <Linha etiqueta="COMANDO_PASSWORD" valor="REDPTR2026" />
              <Linha etiqueta="VAPID_SUBJECT" valor="mailto:comando@ptr-rangers.pt" />
              <Linha etiqueta="Health check" valor="/api/health" />
            </div>
            <p className="text-[11px] text-slate-500 mt-3">Guia completo também em <code>PUBLICAR.md</code> dentro do ZIP.</p>
          </Panel>
          <Panel titulo="Depois de publicar">
            <ol className="text-sm text-slate-200 space-y-1.5 list-decimal list-inside">
              <li>Entra com <code className="text-gold-300">comando</code> / <code className="text-gold-300">REDPTR2026</code>.</li>
              <li>Vai a <Link href="/instalar" className="text-gold-300 underline">Instalar app</Link> — os QR e links já apontam para o endereço permanente.</li>
              <li>Envia o link de <Link href="/admin/acessos" className="text-gold-300 underline">registo</Link> aos efectivos e aprova as contas.</li>
            </ol>
          </Panel>
          <a href={vercelDeploy} target="_blank" rel="noreferrer" className="btn btn-secondary w-full">▲ Abrir assistente da Vercel</a>
        </div>
      </div>
    </div>
  );
}

function Var({ nome, valor }: { nome: string; valor: string }) {
  return (
    <tr>
      <td className="font-mono text-xs text-gold-300 whitespace-nowrap">{nome}</td>
      <td className="text-xs text-slate-300">{valor}</td>
      <td className="text-right"><Copiar texto={nome} etiqueta="" /></td>
    </tr>
  );
}

function Linha({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded bg-ptr-950/60 border border-gold-500/20 px-2 py-1.5">
      <div><div className="text-[10px] uppercase tracking-wider text-slate-500">{etiqueta}</div><code className="font-mono text-gold-300">{valor}</code></div>
      <Copiar texto={valor} etiqueta="" />
    </div>
  );
}
