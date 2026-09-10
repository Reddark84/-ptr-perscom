import Image from "next/image";
import Link from "next/link";
import { db } from "@/db";
import { users, units, enlistmentApplications, promotions, userAwards, events, auditLog } from "@/db/schema";
import { sql, desc, eq, gte, asc } from "drizzle-orm";
import { agoraLocalStr, fmtDataHoraStr } from "@/lib/format";
import { corTipo, iconeTipo } from "@/lib/eventos";
import { Insignia, Medalha } from "@/components/insignia";
import { servers } from "@/db/schema";
import { urlDaApp, qrSvg } from "@/lib/app-url";
import { Copiar } from "@/components/copiar";
import { Panel, Stat, StatusBadge, Vazio, EstadoCandidatura, SoEditores, SoComando, Tag } from "@/components/ui";
import { fmtData, fmtDataHora, nomeCompleto } from "@/lib/format";

import { exigirSessao } from "@/lib/auth";
export const dynamic = "force-dynamic";

export default async function Painel() {
  await exigirSessao();
  const [[{ totalUsers }], [{ totalUnits }], [{ pendentes }], porEstado, ultimasPromocoes, ultimasCondecoracoes, ultimasCandidaturas, recentes, proximosEventos, actualizacoes] =
    await Promise.all([
      db.select({ totalUsers: sql<number>`count(*)::int` }).from(users),
      db.select({ totalUnits: sql<number>`count(*)::int` }).from(units),
      db
        .select({ pendentes: sql<number>`count(*)::int` })
        .from(enlistmentApplications)
        .where(eq(enlistmentApplications.status, "Pendente")),
      db.query.statuses.findMany({ orderBy: (s, { asc }) => asc(s.ordem) }).then(async (sts) => {
        const counts = await db
          .select({ statusId: users.statusId, n: sql<number>`count(*)::int` })
          .from(users)
          .groupBy(users.statusId);
        return sts.map((s) => ({ ...s, n: counts.find((c) => c.statusId === s.id)?.n ?? 0 }));
      }),
      db.query.promotions.findMany({
        orderBy: [desc(promotions.data), desc(promotions.id)],
        limit: 6,
        with: { user: true, rank: true },
      }),
      db.query.userAwards.findMany({
        orderBy: [desc(userAwards.data), desc(userAwards.id)],
        limit: 6,
        with: { user: true, award: true },
      }),
      db.query.enlistmentApplications.findMany({
        orderBy: [desc(enlistmentApplications.data)],
        limit: 5,
      }),
      db.query.users.findMany({
        orderBy: [desc(users.criadoEm)],
        limit: 5,
        with: { rank: true, unit: true, status: true },
      }),
      db.query.events.findMany({
        where: gte(events.dataInicio, agoraLocalStr()),
        orderBy: [asc(events.dataInicio)],
        limit: 5,
        with: { unit: true },
      }),
      db.query.auditLog.findMany({ orderBy: [desc(auditLog.criadoEm)], limit: 8 }),
    ]);

  const activos = porEstado.find((s) => s.nome === "Activo")?.n ?? 0;
  const servidorPrincipal = await db.query.servers.findFirst({ where: eq(servers.tipo, "Arma 3"), orderBy: (s, { asc }) => asc(s.ordem) });
  const base = await urlDaApp();
  const [{ nPendentes }] = await db.select({ nPendentes: sql<number>`count(*)::int` }).from(users).where(eq(users.contaEstado, "pendente"));
  const [qrTel, qrPc] = await Promise.all([qrSvg(`${base}/app`, 120), qrSvg(`${base}/`, 120)]);

  return (
    <div>
      <div className="panel rounded-2xl p-6 lg:p-8 mb-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-gold-500/10 blur-3xl" />
        <Image
          src="/emblema.png"
          alt="Emblema Phoenix Taskforce Rangers"
          width={160}
          height={160}
          priority
          className="rounded-full ring-4 ring-gold-500/30 shadow-2xl shrink-0"
        />
        <div className="text-center md:text-left">
          <div className="text-xs uppercase tracking-[0.3em] text-gold-500 font-semibold">Arma 3 · Milsim Português</div>
          <h1 className="text-3xl lg:text-4xl font-black text-gold-300 mt-1">Phoenix Taskforce Rangers</h1>
          <p className="text-slate-300 mt-2 max-w-xl">
            Sistema de Gestão de Pessoal (PERSCOM). Gere militares, rosters, promoções, condecorações,
            qualificações, registos de combate, documentos oficiais e candidaturas de alistamento.
          </p>
          <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
            <SoEditores>
              <Link href="/pessoal/novo" className="btn btn-primary">+ Novo Militar</Link>
              <Link href="/eventos/novo" className="btn btn-secondary">+ Agendar Evento</Link>
            </SoEditores>
            <Link href="/alistamento" className="btn btn-secondary">Formulário de Alistamento</Link>
            <Link href="/instalar" className="btn btn-ghost">⬇ Instalar App</Link>
          </div>
        </div>
      </div>

      <SoComando>
        {!process.env.NEXT_PUBLIC_APP_URL && (
          <Link href="/admin/publicar" className="panel rounded-xl p-4 mb-4 flex items-center justify-between gap-3 !border-gold-500/30 hover:!border-gold-400 transition block">
            <div className="flex items-center gap-3"><span className="text-2xl">🚀</span><div><div className="font-bold text-gold-300">Endereço temporário — publica a app para ter um link permanente</div><div className="text-xs text-slate-400">O endereço do Arena muda a cada arranque e o ícone no telemóvel deixa de funcionar. Guia passo a passo com plano gratuito.</div></div></div>
            <span className="btn btn-secondary !py-1.5 text-xs">Publicar →</span>
          </Link>
        )}
        {nPendentes > 0 && (
          <Link href="/admin/acessos" className="panel rounded-xl p-4 mb-4 flex items-center justify-between gap-3 !border-amber-500/40 hover:!border-amber-400 transition block">
            <div className="flex items-center gap-3"><span className="text-2xl">🔐</span><div><div className="font-bold text-amber-200">{nPendentes} registo(s) à espera da tua aprovação</div><div className="text-xs text-slate-400">Efectivos que se registaram e ainda não podem entrar na app.</div></div></div>
            <span className="btn btn-primary !py-1.5 text-xs">Aprovar →</span>
          </Link>
        )}
      </SoComando>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat etiqueta="Efectivo total" valor={totalUsers} href="/pessoal" icone="👤" />
        <Stat etiqueta="Activos" valor={activos} href="/pessoal?estado=Activo" icone="●" />
        <Stat etiqueta="Estatísticas" valor="📊" href="/estatisticas" icone="" />
        <SoEditores fallback={<Stat etiqueta="Eventos agendados" valor={proximosEventos.length} href="/eventos" icone="📅" />}><Stat etiqueta="Candidaturas pendentes" valor={pendentes} href="/candidaturas" icone="📥" /></SoEditores>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel titulo="Próximos treinos e missões" className="lg:col-span-2" accoes={<Link href="/eventos" className="text-xs text-gold-300 hover:underline">Calendário →</Link>}>
          {proximosEventos.length === 0 ? (
            <Vazio texto="Sem eventos agendados. Cria o primeiro treino ou missão." />
          ) : (
            <ul className="grid sm:grid-cols-2 gap-2">
              {proximosEventos.map((e) => (
                <li key={e.id}>
                  <Link href={`/eventos/${e.id}`} className="block rounded-lg border border-white/5 hover:border-gold-500/30 p-3 transition h-full" style={{ borderLeft: `3px solid ${corTipo(e.tipo)}` }}>
                    <div className="text-xs font-bold" style={{ color: corTipo(e.tipo) }}>{iconeTipo(e.tipo)} {e.tipo}{e.obrigatorio && " · Obrigatório"}</div>
                    <div className="font-semibold text-sm mt-0.5">{e.titulo}</div>
                    <div className="text-xs text-slate-400 mt-1">{fmtDataHoraStr(e.dataInicio)}</div>
                    {(e.local || e.unit) && <div className="text-xs text-slate-500">{e.local}{e.unit ? ` · ${e.unit.nome}` : ""}</div>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel titulo="Últimas actualizações" className="lg:col-span-2" accoes={<Link href="/actualizacoes" className="text-xs text-gold-300 hover:underline">Ver todas →</Link>}>
          {actualizacoes.length === 0 ? (
            <Vazio texto="Sem alterações registadas." />
          ) : (
            <ul className="space-y-2 text-sm">
              {actualizacoes.map((a) => (
                <li key={a.id} className="flex items-start gap-2">
                  <Tag tone={a.accao === "criar" ? "green" : a.accao === "apagar" ? "red" : a.accao === "actualizar" ? "blue" : "slate"}>{a.entidade}</Tag>
                  <div className="min-w-0 flex-1">
                    {a.url ? <Link href={a.url} className="hover:text-gold-300 block truncate">{a.descricao}</Link> : <span className="block truncate">{a.descricao}</span>}
                    <div className="text-[11px] text-slate-500">{a.actorNome} · {fmtDataHora(a.criadoEm)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel titulo="Servidor principal" accoes={<Link href="/servidor" className="text-xs text-gold-300 hover:underline">Ver tudo →</Link>}>
          {servidorPrincipal ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{servidorPrincipal.nome}</span>
                <StatusBadge nome={servidorPrincipal.estado} cor={servidorPrincipal.estado === "Online" ? "#22c55e" : servidorPrincipal.estado === "Offline" ? "#ef4444" : "#eab308"} />
              </div>
              <div className="flex items-center justify-between gap-2 rounded-lg bg-ptr-950/60 border border-gold-500/20 p-2">
                <code className="font-mono text-xs text-gold-300 break-all">{servidorPrincipal.endereco}{servidorPrincipal.porta ? `:${servidorPrincipal.porta}` : ""}</code>
                <Copiar texto={`${servidorPrincipal.endereco}${servidorPrincipal.porta ? `:${servidorPrincipal.porta}` : ""}`} etiqueta="" />
              </div>
              <a href={`steam://connect/${servidorPrincipal.endereco}${servidorPrincipal.porta ? `:${servidorPrincipal.porta}` : ""}${servidorPrincipal.password ? `/${encodeURIComponent(servidorPrincipal.password)}` : ""}`} className="btn btn-primary w-full !py-1.5 text-xs">🎮 Ligar via Steam</a>
            </div>
          ) : (
            <Vazio texto="Sem servidor configurado." />
          )}
        </Panel>
        <Panel titulo="Efectivo por estado">
          <ul className="space-y-2">
            {porEstado.map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <StatusBadge nome={s.nome} cor={s.cor} />
                <span className="font-bold text-gold-300">{s.n}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel titulo="Últimas promoções">
          {ultimasPromocoes.length === 0 ? (
            <Vazio texto="Sem promoções." />
          ) : (
            <ul className="space-y-2 text-sm">
              {ultimasPromocoes.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2">
                  <Link href={`/pessoal/${p.userId}`} className="hover:text-gold-300 truncate flex items-center gap-2">
                    <Insignia rank={p.rank} size={20} />
                    {p.user ? nomeCompleto(p.user) : "—"}
                  </Link>
                  <span className="text-slate-400 shrink-0 text-xs">
                    <span className="text-gold-400 font-semibold">{p.rank?.abreviatura}</span> · {fmtData(p.data)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel titulo="Últimas condecorações">
          {ultimasCondecoracoes.length === 0 ? (
            <Vazio texto="Sem condecorações." />
          ) : (
            <ul className="space-y-2 text-sm">
              {ultimasCondecoracoes.map((a) => (
                <li key={a.id} className="flex items-center gap-2">
                  <Medalha award={a.award} size={22} />
                  <div className="min-w-0">
                    <Link href={`/pessoal/${a.userId}`} className="hover:text-gold-300 block truncate">
                      {a.user ? nomeCompleto(a.user) : "—"}
                    </Link>
                    <div className="text-xs text-slate-400 truncate">{a.award?.nome} · {fmtData(a.data)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <SoEditores><Panel titulo="Candidaturas recentes" className="lg:col-span-2">
          {ultimasCandidaturas.length === 0 ? (
            <Vazio texto="Sem candidaturas." />
          ) : (
            <div className="overflow-x-auto -mx-5">
              <table className="table">
                <thead>
                  <tr><th>Candidato</th><th>Estado</th><th>Data</th></tr>
                </thead>
                <tbody>
                  {ultimasCandidaturas.map((c) => (
                    <tr key={c.id}>
                      <td><Link href={`/candidaturas/${c.id}`} className="hover:text-gold-300 font-medium">{c.nomeCandidato}</Link></td>
                      <td><EstadoCandidatura status={c.status} /></td>
                      <td className="text-slate-400">{fmtDataHora(c.data)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel></SoEditores>

        <Panel titulo="Admitidos recentemente">
          <ul className="space-y-2 text-sm">
            {recentes.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-2">
                <Link href={`/pessoal/${u.id}`} className="hover:text-gold-300 truncate flex items-center gap-2">
                  <Insignia rank={u.rank} size={20} /> {nomeCompleto(u)}
                </Link>
                {u.status && <StatusBadge nome={u.status.nome} cor={u.status.cor} />}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="panel rounded-2xl p-5 mt-6 grid md:grid-cols-[1fr_auto_auto] gap-5 items-center">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-gold-500 font-semibold">Partilhar a app com os efectivos</div>
          <div className="mt-1 font-mono text-gold-300 break-all text-sm">{base}</div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Copiar texto={base} etiqueta="Copiar link" className="!btn-secondary" />
            <Link href="/instalar" className="btn btn-secondary !py-1 text-xs">Instruções e QR grandes</Link>
            <Link href="/instalar/cartaz" className="btn btn-ghost !py-1 text-xs">Cartaz</Link>
          </div>
        </div>
        <div className="text-center">
          <div className="rounded-lg overflow-hidden border-2 border-gold-500/40 bg-[#f7f3e8] p-0.5 inline-block" dangerouslySetInnerHTML={{ __html: qrTel }} />
          <div className="text-xs text-slate-300 mt-1">📱 Telemóvel</div>
        </div>
        <div className="text-center">
          <div className="rounded-lg overflow-hidden border-2 border-gold-500/40 bg-[#f7f3e8] p-0.5 inline-block" dangerouslySetInnerHTML={{ __html: qrPc }} />
          <div className="text-xs text-slate-300 mt-1">💻 PC</div>
        </div>
      </div>
    </div>
  );
}

