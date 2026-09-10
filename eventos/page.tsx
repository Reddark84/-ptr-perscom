import Link from "next/link";
import { db } from "@/db";
import { events } from "@/db/schema";
import { and, gte, lt, asc, desc } from "drizzle-orm";
import { PageHeader, Panel, Tag, Vazio, SoEditores } from "@/components/ui";
import { NOMES_MESES, agoraLocalStr, fmtDataHoraStr, horaDe } from "@/lib/format";
import { corTipo, grelhaMes, iconeTipo, isoLocal } from "@/lib/eventos";
import { NotificacoesToggle } from "@/components/pwa";

import { exigirSessao } from "@/lib/auth";
export const dynamic = "force-dynamic";

export default async function EventosPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  await exigirSessao();
  const { mes } = await searchParams;
  const agora = agoraLocalStr();
  const hojeIso = agora.slice(0, 10);
  const m = mes?.match(/^(\d{4})-(\d{2})$/);
  const ano = m ? Number(m[1]) : Number(hojeIso.slice(0, 4));
  const mes1 = m ? Number(m[2]) : Number(hojeIso.slice(5, 7));

  const inicioMes = `${ano}-${String(mes1).padStart(2, "0")}-01 00:00:00`;
  const fimMesDate = new Date(ano, mes1, 1);
  const fimMes = `${isoLocal(fimMesDate)} 00:00:00`;
  const anterior = new Date(ano, mes1 - 2, 1);
  const seguinte = new Date(ano, mes1, 1);
  const fmtMes = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  const [doMes, proximos, passados] = await Promise.all([
    db.query.events.findMany({
      where: and(gte(events.dataInicio, inicioMes), lt(events.dataInicio, fimMes)),
      orderBy: [asc(events.dataInicio)],
      with: { unit: true },
    }),
    db.query.events.findMany({
      where: gte(events.dataInicio, agora),
      orderBy: [asc(events.dataInicio)],
      limit: 8,
      with: { unit: true, attendance: true },
    }),
    db.query.events.findMany({
      where: lt(events.dataInicio, agora),
      orderBy: [desc(events.dataInicio)],
      limit: 5,
      with: { attendance: true },
    }),
  ]);

  const porDia = new Map<string, typeof doMes>();
  for (const e of doMes) {
    const k = e.dataInicio.slice(0, 10);
    porDia.set(k, [...(porDia.get(k) ?? []), e]);
  }
  const grelha = grelhaMes(ano, mes1);

  return (
    <div>
      <PageHeader
        titulo="Eventos"
        subtitulo="Calendário de treinos, missões e operações da PTR."
        accoes={
          <>
            <NotificacoesToggle compacto />
            <SoEditores><Link href="/eventos/novo" className="btn btn-primary">+ Novo evento</Link></SoEditores>
          </>
        }
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel className="lg:col-span-2 !p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gold-500/15">
            <Link href={`/eventos?mes=${fmtMes(anterior)}`} className="btn btn-ghost !px-2">‹</Link>
            <div className="font-bold text-gold-300 text-lg">{NOMES_MESES[mes1 - 1]} {ano}</div>
            <div className="flex gap-1">
              <Link href="/eventos" className="btn btn-ghost !px-2 text-xs">Hoje</Link>
              <Link href={`/eventos?mes=${fmtMes(seguinte)}`} className="btn btn-ghost !px-2">›</Link>
            </div>
          </div>
          <div className="grid grid-cols-7 text-[10px] uppercase tracking-wider text-gold-500 font-semibold border-b border-gold-500/10">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => <div key={d} className="px-2 py-1.5 text-center">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {grelha.map((d, i) => {
              const evs = porDia.get(d.iso) ?? [];
              const eHoje = d.iso === hojeIso;
              return (
                <div key={i} className={`min-h-[72px] lg:min-h-[96px] border-b border-r border-white/5 p-1 ${d.doMes ? "" : "opacity-30"} ${eHoje ? "bg-gold-500/10" : ""}`}>
                  <div className={`text-xs mb-1 ${eHoje ? "text-gold-300 font-bold" : "text-slate-400"}`}>{d.dia}</div>
                  <div className="space-y-0.5">
                    {evs.slice(0, 3).map((e) => (
                      <Link key={e.id} href={`/eventos/${e.id}`} className="block truncate rounded px-1 py-0.5 text-[10px] lg:text-[11px] font-medium leading-tight" style={{ backgroundColor: corTipo(e.tipo) + "33", color: corTipo(e.tipo), borderLeft: `2px solid ${corTipo(e.tipo)}` }} title={e.titulo}>
                        <span className="hidden lg:inline">{horaDe(e.dataInicio)} </span>{e.titulo}
                      </Link>
                    ))}
                    {evs.length > 3 && <div className="text-[10px] text-slate-400 px-1">+{evs.length - 3}</div>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 px-4 py-2 text-xs text-slate-400">
            {(["Treino", "Missão", "Operação", "Reunião", "Outro"] as const).map((t) => (
              <span key={t} className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: corTipo(t) }} />{t}</span>
            ))}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel titulo="Próximos eventos">
            {proximos.length === 0 ? (
              <Vazio texto="Sem eventos agendados." />
            ) : (
              <ul className="space-y-2">
                {proximos.map((e) => {
                  const presentes = e.attendance.filter((a) => a.estado === "Presente").length;
                  return (
                    <li key={e.id}>
                      <Link href={`/eventos/${e.id}`} className="block rounded-lg border border-white/5 hover:border-gold-500/30 p-3 transition" style={{ borderLeft: `3px solid ${corTipo(e.tipo)}` }}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-semibold text-sm">{iconeTipo(e.tipo)} {e.titulo}</div>
                          {e.obrigatorio && <Tag tone="red">Obrigatório</Tag>}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{fmtDataHoraStr(e.dataInicio)}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{e.local ?? ""}{e.unit ? ` · ${e.unit.nome}` : ""}{presentes ? ` · ${presentes} confirmados` : ""}</div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
          <Panel titulo="Eventos passados">
            {passados.length === 0 ? (
              <Vazio texto="Sem histórico." />
            ) : (
              <ul className="space-y-1.5 text-sm">
                {passados.map((e) => (
                  <li key={e.id} className="flex justify-between gap-2">
                    <Link href={`/eventos/${e.id}`} className="truncate hover:text-gold-300">{iconeTipo(e.tipo)} {e.titulo}</Link>
                    <span className="text-xs text-slate-500 shrink-0">{e.dataInicio.slice(8, 10)}/{e.dataInicio.slice(5, 7)} · {e.attendance.filter((a) => a.estado === "Presente").length} pres.</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
