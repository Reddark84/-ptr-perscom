import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { events, pushSubscriptions, ESTADOS_PRESENCA } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader, Panel, Tag, StatusBadge, Vazio, SoEditores } from "@/components/ui";
import { Insignia } from "@/components/insignia";
import { fmtDataHoraStr, fmtDataLonga, fmtDataHora, horaDe, nomeCompleto } from "@/lib/format";
import { corTipo, iconeTipo } from "@/lib/eventos";
import { guardarPresencas, notificarEvento, marcarMinhaPresenca } from "@/lib/actions";
import { utilizadorActual, podeEditar, exigirSessao } from "@/lib/auth";

export const dynamic = "force-dynamic";

const COR_PRESENCA: Record<string, string> = {
  Presente: "#22c55e",
  Talvez: "#eab308",
  Ausente: "#ef4444",
  Justificado: "#3b82f6",
};

export default async function EventoPage({ params }: { params: Promise<{ id: string }> }) {
  await exigirSessao();
  const { id } = await params;
  const ev = await db.query.events.findFirst({
    where: eq(events.id, Number(id)),
    with: { unit: true, attendance: { with: { user: { with: { rank: true } } } } },
  });
  if (!ev) notFound();
  const sessao = await utilizadorActual();
  const editor = podeEditar(sessao);
  const minha = sessao ? ev.attendance.find((a) => a.userId === sessao.id)?.estado : undefined;

  const [militares, nSubs] = await Promise.all([
    db.query.users.findMany({ with: { rank: true, unit: true, status: true } }),
    db.$count(pushSubscriptions),
  ]);
  const elegiveis = (ev.unitId ? militares.filter((m) => m.unitId === ev.unitId) : militares).sort(
    (a, b) => (b.rank?.ordem ?? 0) - (a.rank?.ordem ?? 0) || a.nome.localeCompare(b.nome)
  );
  const presencaDe = new Map(ev.attendance.map((a) => [a.userId, a.estado]));
  const contagem = ESTADOS_PRESENCA.map((e) => ({ e, n: ev.attendance.filter((a) => a.estado === e).length }));
  const cor = corTipo(ev.tipo);

  return (
    <div>
      <PageHeader
        titulo={`${iconeTipo(ev.tipo)} ${ev.titulo}`}
        subtitulo={fmtDataLonga(ev.dataInicio)}
        accoes={
          <>
            <Link href="/eventos" className="btn btn-ghost">← Calendário</Link>
            <SoEditores><Link href={`/eventos/${ev.id}/editar`} className="btn btn-secondary">Editar</Link></SoEditores>
          </>
        }
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="panel rounded-xl p-5" style={{ borderLeft: `4px solid ${cor}` }}>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold" style={{ backgroundColor: cor + "22", color: cor, border: `1px solid ${cor}55` }}>{ev.tipo}</span>
              {ev.obrigatorio && <Tag tone="red">Presença obrigatória</Tag>}
              {ev.unit ? <Tag tone="green">⌂ {ev.unit.nome}</Tag> : <Tag tone="slate">Toda a Taskforce</Tag>}
              {ev.mapa && <Tag>🗺 {ev.mapa}</Tag>}
            </div>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div><dt className="text-xs uppercase tracking-wider text-slate-400">Início</dt><dd className="font-medium">{fmtDataHoraStr(ev.dataInicio)}</dd></div>
              <div><dt className="text-xs uppercase tracking-wider text-slate-400">Fim</dt><dd className="font-medium">{ev.dataFim ? `${horaDe(ev.dataFim)}${ev.dataFim.slice(0, 10) !== ev.dataInicio.slice(0, 10) ? ` (${ev.dataFim.slice(8, 10)}/${ev.dataFim.slice(5, 7)})` : ""}` : "—"}</dd></div>
              <div className="sm:col-span-2"><dt className="text-xs uppercase tracking-wider text-slate-400">Local</dt><dd className="font-medium">{ev.local ?? "—"}</dd></div>
            </dl>
            {ev.descricao && <p className="text-sm text-slate-200 mt-4 whitespace-pre-wrap">{ev.descricao}</p>}
          </div>

          {ev.briefing && (
            <Panel titulo="Briefing">
              <pre className="text-sm text-slate-200 whitespace-pre-wrap font-mono leading-relaxed">{ev.briefing}</pre>
            </Panel>
          )}

          {sessao && (
            <Panel titulo="A minha presença">
              <form action={marcarMinhaPresenca} className="flex flex-wrap gap-2 items-center">
                <input type="hidden" name="eventId" value={ev.id} />
                {ESTADOS_PRESENCA.map((e) => (
                  <button key={e} name="estado" value={e} className={`btn ${minha === e ? "btn-primary" : "btn-secondary"} !py-1.5 text-xs`}>
                    {e === "Presente" ? "✓ " : e === "Ausente" ? "✕ " : e === "Talvez" ? "? " : "✎ "}{e}
                  </button>
                ))}
                {minha && <span className="text-xs text-slate-400 ml-2">Marcado: <b className="text-gold-300">{minha}</b></span>}
              </form>
            </Panel>
          )}

          <Panel titulo={`Presenças (${elegiveis.length} elegíveis)`}>
            {elegiveis.length === 0 ? (
              <Vazio texto="Sem militares elegíveis." />
            ) : (
              <form action={guardarPresencas}>
                <input type="hidden" name="eventId" value={ev.id} />
                <div className="overflow-x-auto -mx-5">
                  <table className="table">
                    <thead><tr><th>Militar</th><th className="hidden sm:table-cell">Unidade</th><th>Presença</th></tr></thead>
                    <tbody>
                      {elegiveis.map((m) => (
                        <tr key={m.id}>
                          <td>
                            <Link href={`/pessoal/${m.id}`} className="flex items-center gap-2 hover:text-gold-300">
                              <Insignia rank={m.rank} size={22} />
                              <span className="font-medium">{nomeCompleto(m)}</span>
                            </Link>
                          </td>
                          <td className="hidden sm:table-cell text-slate-400">{m.unit?.nome ?? "—"}</td>
                          <td>
                            {editor ? (
                              <select name={`presenca_${m.id}`} defaultValue={presencaDe.get(m.id) ?? ""} className="input !py-1 !w-auto text-xs">
                                <option value="">— por marcar —</option>
                                {ESTADOS_PRESENCA.map((e) => <option key={e} value={e}>{e}</option>)}
                              </select>
                            ) : presencaDe.get(m.id) ? (
                              <StatusBadge nome={presencaDe.get(m.id)!} cor={COR_PRESENCA[presencaDe.get(m.id)!]} />
                            ) : (
                              <span className="text-xs text-slate-500">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {editor && <div className="flex justify-end mt-3"><button className="btn btn-primary">Guardar presenças</button></div>}
              </form>
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel titulo="Resumo de presenças">
            <ul className="space-y-2">
              {contagem.map(({ e, n }) => (
                <li key={e} className="flex items-center justify-between text-sm">
                  <StatusBadge nome={e} cor={COR_PRESENCA[e]} />
                  <span className="font-bold text-gold-300">{n}</span>
                </li>
              ))}
              <li className="flex items-center justify-between text-sm border-t border-white/10 pt-2">
                <span className="text-slate-400">Por marcar</span>
                <span className="font-bold">{elegiveis.length - ev.attendance.length}</span>
              </li>
            </ul>
          </Panel>

          {editor && (
          <Panel titulo="Notificar efectivos">
            <p className="text-xs text-slate-400 mb-3">
              {nSubs} dispositivo(s) com notificações activas.
              {ev.notificadoEm && <> Última notificação: {fmtDataHora(ev.notificadoEm)}.</>}
            </p>
            <div className="space-y-2">
              <form action={notificarEvento}>
                <input type="hidden" name="id" value={ev.id} />
                <input type="hidden" name="prefixo" value="📅 " />
                <button className="btn btn-primary w-full">🔔 Enviar aviso do evento</button>
              </form>
              <form action={notificarEvento}>
                <input type="hidden" name="id" value={ev.id} />
                <input type="hidden" name="prefixo" value="⏰ Lembrete — " />
                <button className="btn btn-secondary w-full">⏰ Enviar lembrete</button>
              </form>
            </div>
          </Panel>
          )}

          {ev.attendance.filter((a) => a.estado === "Presente").length > 0 && (
            <Panel titulo="Confirmados">
              <ul className="space-y-1.5 text-sm">
                {ev.attendance.filter((a) => a.estado === "Presente").map((a) => (
                  <li key={a.id} className="flex items-center gap-2">
                    <Insignia rank={a.user.rank} size={18} />
                    <Link href={`/pessoal/${a.userId}`} className="hover:text-gold-300 truncate">{nomeCompleto(a.user)}</Link>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
