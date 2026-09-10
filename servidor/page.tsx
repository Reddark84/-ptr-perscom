import Link from "next/link";
import { db } from "@/db";
import { appSettings, servers } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { PageHeader, Panel, StatusBadge, Tag, Vazio, Campo, SoEditores } from "@/components/ui";
import { Copiar, MostrarPassword } from "@/components/copiar";
import { guardarInfoServidor, guardarCatalogo, apagarCatalogo } from "@/lib/actions";
import { CATALOGOS } from "@/lib/catalogos";
import { CatalogoForm } from "@/components/catalogo-form";
import { ConfirmarApagar } from "@/components/ui";

import { exigirSessao } from "@/lib/auth";
export const dynamic = "force-dynamic";

const COR_ESTADO: Record<string, string> = { Online: "#22c55e", Offline: "#ef4444", "Manutenção": "#eab308" };
const ICONE: Record<string, string> = { "Arma 3": "🎮", TeamSpeak: "🎧", Discord: "💬", Website: "🌐", Outro: "🖥" };

function linkLigacao(s: { tipo: string; endereco: string; porta: string | null; password: string | null }) {
  const hostPorta = s.porta ? `${s.endereco}:${s.porta}` : s.endereco;
  if (s.tipo === "Arma 3") return `steam://connect/${hostPorta}${s.password ? `/${encodeURIComponent(s.password)}` : ""}`;
  if (s.tipo === "TeamSpeak") return `ts3server://${s.endereco}?port=${s.porta ?? "9987"}${s.password ? `&password=${encodeURIComponent(s.password)}` : ""}`;
  if (/^https?:\/\//.test(s.endereco)) return s.endereco;
  return null;
}

export default async function ServidorPage({ searchParams }: { searchParams: Promise<{ editar?: string; gerir?: string; editarId?: string }> }) {
  await exigirSessao();
  const sp = await searchParams;
  const { podeEditar, utilizadorActual } = await import("@/lib/auth");
  const editor = podeEditar(await utilizadorActual());
  const editar = sp.editar && editor ? sp.editar : undefined;
  const gerir = !!sp.gerir && editor;
  const cfg = CATALOGOS.servidores;
  const editarId = gerir && sp.editarId ? Number(sp.editarId) : null;
  const [lista, info] = await Promise.all([
    db.select().from(servers).orderBy(asc(servers.ordem), asc(servers.nome)),
    db.query.appSettings.findFirst({ where: eq(appSettings.chave, "info_servidor") }),
  ]);
  const arma = lista.filter((s) => s.tipo === "Arma 3");
  const outros = lista.filter((s) => s.tipo !== "Arma 3");

  return (
    <div>
      <PageHeader
        titulo="Servidor"
        subtitulo="Informação de ligação aos servidores da Phoenix Taskforce Rangers."
        accoes={<SoEditores><Link href={gerir ? "/servidor" : "/servidor?gerir=1"} className="btn btn-secondary">{gerir ? "Concluir gestão" : "⚙ Gerir servidores"}</Link></SoEditores>}
      />

      {lista.length === 0 && !gerir && <Vazio texto={editor ? "Sem servidores configurados. Clica em «Gerir servidores» para adicionar." : "Sem servidores configurados."} />}

      {gerir && (
        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          <Panel titulo="Servidores configurados" className="lg:col-span-2 !p-0">
            {lista.length === 0 ? <div className="p-5"><Vazio texto="Ainda não há servidores." /></div> : (
              <table className="table">
                <thead><tr><th>#</th><th>Nome</th><th>Tipo</th><th>Endereço</th><th>Estado</th><th></th></tr></thead>
                <tbody>
                  {lista.map((s) => (
                    <tr key={s.id}>
                      <td className="text-slate-500">{s.ordem}</td>
                      <td className="font-medium">{s.nome}</td>
                      <td className="text-slate-300">{s.tipo}</td>
                      <td className="font-mono text-xs text-slate-300">{s.endereco}{s.porta ? `:${s.porta}` : ""}</td>
                      <td><StatusBadge nome={s.estado} cor={COR_ESTADO[s.estado] ?? "#94a3b8"} /></td>
                      <td className="text-right whitespace-nowrap">
                        <Link href={`/servidor?gerir=1&editarId=${s.id}`} className="btn btn-ghost !py-1 !px-2 text-xs">Editar</Link>
                        <ConfirmarApagar accao={apagarCatalogo} id={s.id} extra={{ slug: "servidores" }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>
          <CatalogoForm cfg={cfg} registo={editarId ? (lista.find((s) => s.id === editarId) as unknown as Record<string, unknown>) : undefined} voltarPara="/servidor?gerir=1" />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {arma.map((s) => {
            const hostPorta = s.porta ? `${s.endereco}:${s.porta}` : s.endereco;
            const link = linkLigacao(s);
            return (
              <div key={s.id} className="panel rounded-2xl p-5" style={{ borderLeft: `4px solid ${COR_ESTADO[s.estado] ?? "#94a3b8"}` }}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-gold-500 font-semibold">{ICONE[s.tipo]} {s.tipo}</div>
                    <h2 className="text-xl font-bold text-gold-300">{s.nome}</h2>
                    {s.descricao && <p className="text-sm text-slate-300 mt-1">{s.descricao}</p>}
                  </div>
                  <StatusBadge nome={s.estado} cor={COR_ESTADO[s.estado] ?? "#94a3b8"} />
                </div>
                <div className="grid sm:grid-cols-3 gap-3 mt-4">
                  <div className="rounded-lg bg-ptr-950/60 border border-gold-500/20 p-3">
                    <div className="label !mb-1">Endereço</div>
                    <div className="flex items-center justify-between gap-2"><code className="font-mono text-sm text-gold-300 break-all">{s.endereco}</code><Copiar texto={s.endereco} etiqueta="" /></div>
                  </div>
                  <div className="rounded-lg bg-ptr-950/60 border border-gold-500/20 p-3">
                    <div className="label !mb-1">Porta</div>
                    <div className="flex items-center justify-between gap-2"><code className="font-mono text-sm text-gold-300">{s.porta ?? "—"}</code>{s.porta && <Copiar texto={s.porta} etiqueta="" />}</div>
                  </div>
                  <div className="rounded-lg bg-ptr-950/60 border border-gold-500/20 p-3">
                    <div className="label !mb-1">Password</div>
                    {s.password ? <MostrarPassword password={s.password} /> : <span className="text-sm text-slate-400">Sem password</span>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {link && <a href={link} className="btn btn-primary">🎮 Ligar via Steam</a>}
                  <Copiar texto={hostPorta} etiqueta={`Copiar ${hostPorta}`} className="!btn-secondary" />
                  {s.modpack && <a href={s.modpack} target="_blank" rel="noreferrer" className="btn btn-secondary">📦 Modpack / Colecção Steam</a>}
                </div>
                {s.instrucoes && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-xs font-bold uppercase tracking-[0.15em] text-gold-400">Instruções de ligação</summary>
                    <pre className="text-sm text-slate-200 whitespace-pre-wrap mt-2 font-sans leading-relaxed">{s.instrucoes}</pre>
                  </details>
                )}
              </div>
            );
          })}

          {outros.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {outros.map((s) => {
                const link = linkLigacao(s);
                return (
                  <Panel key={s.id} titulo={`${ICONE[s.tipo] ?? "🖥"} ${s.nome}`} accoes={<StatusBadge nome={s.estado} cor={COR_ESTADO[s.estado] ?? "#94a3b8"} />}>
                    {s.descricao && <p className="text-sm text-slate-300 mb-3">{s.descricao}</p>}
                    <div className="flex items-center justify-between gap-2 rounded-lg bg-ptr-950/60 border border-gold-500/20 p-2.5">
                      <code className="font-mono text-xs text-gold-300 break-all">{s.endereco}{s.porta ? `:${s.porta}` : ""}</code>
                      <Copiar texto={s.porta ? `${s.endereco}:${s.porta}` : s.endereco} etiqueta="" />
                    </div>
                    {s.password && <div className="mt-2 text-xs text-slate-400">Password: <MostrarPassword password={s.password} /></div>}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {link && <a href={link} target={link.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="btn btn-secondary !py-1.5 text-xs">Abrir / Ligar</a>}
                      <Tag tone="slate">{s.tipo}</Tag>
                    </div>
                    {s.instrucoes && <p className="text-xs text-slate-400 mt-3 whitespace-pre-wrap">{s.instrucoes}</p>}
                  </Panel>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Panel titulo="Informação geral" accoes={!editar && <SoEditores><Link href="/servidor?editar=1" className="text-xs text-gold-300 hover:underline">Editar</Link></SoEditores>}>
            {editar ? (
              <form action={guardarInfoServidor} className="space-y-3">
                <Campo etiqueta="Horários, regras, notas">
                  <textarea name="valor" rows={14} defaultValue={info?.valor ?? ""} className="input text-sm" />
                </Campo>
                <div className="flex gap-2 justify-end">
                  <Link href="/servidor" className="btn btn-ghost">Cancelar</Link>
                  <button className="btn btn-primary">Guardar</button>
                </div>
              </form>
            ) : info?.valor ? (
              <pre className="text-sm text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">{info.valor}</pre>
            ) : (
              <p className="text-sm text-slate-500">Sem informação.</p>
            )}
          </Panel>
          <Panel titulo="Dica">
            <p className="text-xs text-slate-400">
              O botão <b>Ligar via Steam</b> usa o protocolo <code>steam://connect</code> e abre o Arma 3 directamente no servidor (o modpack deve estar carregado no launcher).
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
