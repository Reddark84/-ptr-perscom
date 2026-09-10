import Link from "next/link";
import { db } from "@/db";
import { NOME_ROLE, ROLES } from "@/db/schema";
import { exigirComando } from "@/lib/auth";
import { aprovarRegisto, bloquearConta, desbloquearConta } from "@/lib/auth-actions";
import { PageHeader, Panel, Tag, Vazio, StatusBadge } from "@/components/ui";
import { Insignia } from "@/components/insignia";
import { fmtDataHora, nomeCompleto } from "@/lib/format";
import { urlDaApp } from "@/lib/app-url";
import { Copiar } from "@/components/copiar";

export const dynamic = "force-dynamic";

export default async function AcessosPage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sessao = await exigirComando();
  const { ok, erro } = await searchParams;
  const base = await urlDaApp();
  const lista = await db.query.users.findMany({ with: { rank: true, unit: true } });
  lista.sort((a, b) => (a.role === b.role ? (b.rank?.ordem ?? 0) - (a.rank?.ordem ?? 0) : a.role.localeCompare(b.role)));
  const pendentes = lista.filter((u) => u.passwordHash && u.contaEstado === "pendente");
  const activas = lista.filter((u) => u.passwordHash && u.contaEstado === "aprovada");
  const bloqueadas = lista.filter((u) => u.passwordHash && u.contaEstado === "bloqueada");
  const semContas = lista.filter((u) => !u.passwordHash);
  const linkRegisto = `${base}/registo`;

  return (
    <div>
      <PageHeader titulo="Acessos e permissões" subtitulo="Quem pode entrar na app e quem pode alterar registos. Só o Comando gere esta página." />
      {ok && <div className="mb-4 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">Registo aprovado. O efectivo já pode entrar.</div>}
      {erro && <div className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">Não podes bloquear a tua própria conta.</div>}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Panel titulo={`Registos pendentes de aprovação (${pendentes.length})`} className={pendentes.length ? "!border-amber-500/40" : ""}>
            {pendentes.length === 0 ? (
              <Vazio texto="Sem registos pendentes." />
            ) : (
              <ul className="space-y-3">
                {pendentes.map((u) => (
                  <li key={u.id} className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold">{nomeCompleto(u)} <span className="font-mono text-xs text-slate-400">· login: {u.login}</span></div>
                        <div className="text-xs text-slate-400">{u.discord && `Discord: ${u.discord} · `}registado em {fmtDataHora(u.criadoEm)}{u.unit && ` · ${u.unit.nome}`}</div>
                        {u.registoNotas && <p className="text-sm text-slate-300 mt-1 italic">“{u.registoNotas}”</p>}
                      </div>
                      <Link href={`/pessoal/${u.id}`} className="text-xs text-gold-300 hover:underline">ver perfil</Link>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <form action={aprovarRegisto} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={u.id} />
                        <select name="role" defaultValue="operador" className="input !py-1 !w-auto text-xs">
                          {ROLES.map((r) => <option key={r} value={r}>{NOME_ROLE[r]}</option>)}
                        </select>
                        <button className="btn btn-primary !py-1.5 text-xs">✓ Aprovar</button>
                      </form>
                      <form action={bloquearConta}>
                        <input type="hidden" name="id" value={u.id} />
                        <button className="btn btn-danger !py-1.5 text-xs">✕ Rejeitar</button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel titulo={`Contas activas (${activas.length})`} className="!p-0">
            {activas.length === 0 ? <div className="p-5"><Vazio texto="Sem contas." /></div> : (
              <table className="table">
                <thead><tr><th>Militar</th><th>Login</th><th>Perfil</th><th className="hidden sm:table-cell">Último acesso</th><th></th></tr></thead>
                <tbody>
                  {activas.map((u) => (
                    <tr key={u.id}>
                      <td><span className="flex items-center gap-2"><Insignia rank={u.rank} size={22} /><span className="font-medium">{nomeCompleto(u)}</span>{u.id === sessao.id && <Tag tone="slate">tu</Tag>}</span></td>
                      <td className="font-mono text-xs text-slate-300">{u.login ?? u.numeroServico ?? "—"}</td>
                      <td><Tag tone={u.role === "comando" ? "gold" : u.role === "editor" ? "green" : "slate"}>{NOME_ROLE[u.role]}</Tag></td>
                      <td className="hidden sm:table-cell text-xs text-slate-400">{fmtDataHora(u.ultimoLogin)}</td>
                      <td className="text-right whitespace-nowrap">
                        <Link href={`/pessoal/${u.id}?tab=acesso`} className="btn btn-ghost !py-1 !px-2 text-xs">Gerir</Link>
                        {u.id !== sessao.id && u.login !== "comando" && (
                          <form action={bloquearConta} className="inline"><input type="hidden" name="id" value={u.id} /><button className="btn btn-danger !py-1 !px-2 text-xs">Bloquear</button></form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>

          {bloqueadas.length > 0 && (
            <Panel titulo={`Contas bloqueadas (${bloqueadas.length})`} className="!p-0">
              <table className="table">
                <tbody>
                  {bloqueadas.map((u) => (
                    <tr key={u.id}>
                      <td><span className="flex items-center gap-2"><Insignia rank={u.rank} size={22} /><span>{nomeCompleto(u)}</span></span></td>
                      <td className="font-mono text-xs text-slate-400">{u.login}</td>
                      <td><StatusBadge nome="Bloqueada" cor="#ef4444" /></td>
                      <td className="text-right"><form action={desbloquearConta}><input type="hidden" name="id" value={u.id} /><button className="btn btn-secondary !py-1 !px-2 text-xs">Reactivar</button></form></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          )}

          <Panel titulo={`Efectivos sem conta (${semContas.length})`} className="!p-0">
            <table className="table">
              <tbody>
                {semContas.map((u) => (
                  <tr key={u.id}>
                    <td><span className="flex items-center gap-2"><Insignia rank={u.rank} size={22} /><span>{nomeCompleto(u)}</span></span></td>
                    <td className="text-slate-400 text-xs">{u.unit?.nome ?? "—"}</td>
                    <td className="text-right"><Link href={`/pessoal/${u.id}?tab=acesso`} className="btn btn-secondary !py-1 !px-2 text-xs">Criar acesso</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel titulo="Link de registo">
            <p className="text-sm text-slate-300 mb-2">Envia este link aos efectivos para criarem a sua conta. Os registos aparecem aqui para aprovação.</p>
            <div className="flex items-center justify-between gap-2 rounded-lg bg-ptr-950/60 border border-gold-500/20 p-2">
              <code className="font-mono text-xs text-gold-300 break-all">{linkRegisto}</code>
              <Copiar texto={linkRegisto} etiqueta="" />
            </div>
            <div className="flex items-center justify-between gap-2 rounded-lg bg-ptr-950/60 border border-gold-500/20 p-2 mt-2">
              <code className="font-mono text-xs text-gold-300 break-all">{base}/login</code>
              <Copiar texto={`${base}/login`} etiqueta="" />
            </div>
          </Panel>
          <Panel titulo="Perfis">
            <ul className="text-sm space-y-3">
              <li><Tag tone="gold">Comando</Tag><p className="text-slate-300 mt-1">Acesso total. Gere permissões, altera qualquer registo, agenda eventos e envia avisos.</p></li>
              <li><Tag tone="green">Operador c/ permissão</Tag><p className="text-slate-300 mt-1">Autorizado pelo Comando a alterar registos de pessoal, eventos e catálogos. Não gere acessos.</p></li>
              <li><Tag tone="slate">Operador</Tag><p className="text-slate-300 mt-1">Apenas consulta: roster, perfis, eventos, servidor e actualizações. Marca a própria presença.</p></li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
