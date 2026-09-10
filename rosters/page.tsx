import Link from "next/link";
import { db } from "@/db";
import { PageHeader, StatusBadge, Vazio, SoEditores } from "@/components/ui";
import { Insignia } from "@/components/insignia";

import { exigirSessao } from "@/lib/auth";
export const dynamic = "force-dynamic";

export default async function RostersPage() {
  await exigirSessao();
  const [rosters, unidadesSemRoster, semUnidade] = await Promise.all([
    db.query.rosters.findMany({
      orderBy: (r, { asc }) => asc(r.ordem),
      with: {
        units: {
          orderBy: (u, { asc }) => asc(u.ordem),
          with: {
            users: { with: { rank: true, position: true, specialty: true, status: true } },
          },
        },
      },
    }),
    db.query.units.findMany({
      where: (u, { isNull }) => isNull(u.rosterId),
      orderBy: (u, { asc }) => asc(u.ordem),
      with: { users: { with: { rank: true, position: true, specialty: true, status: true } } },
    }),
    db.query.users.findMany({
      where: (u, { isNull }) => isNull(u.unitId),
      with: { rank: true, position: true, specialty: true, status: true },
    }),
  ]);

  const total = rosters.reduce((n, r) => n + r.units.reduce((m, u) => m + u.users.length, 0), 0);

  return (
    <div>
      <PageHeader
        titulo="Rosters"
        subtitulo={`Ordem de batalha da Phoenix Taskforce Rangers · ${total} militares colocados`}
        accoes={<SoEditores><Link href="/admin/unidades" className="btn btn-secondary">Gerir unidades</Link></SoEditores>}
      />

      {rosters.length === 0 && <Vazio texto="Sem rosters configurados." />}

      <div className="space-y-8">
        {rosters.map((r) => (
          <section key={r.id}>
            <div className="flex items-baseline gap-3 mb-3">
              <h2 className="text-xl font-bold text-gold-300">{r.nome}</h2>
              {r.descricao && <span className="text-sm text-slate-400">{r.descricao}</span>}
            </div>
            {r.units.length === 0 ? (
              <Vazio texto="Sem unidades neste roster." />
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {r.units.map((u) => <UnidadeCard key={u.id} unidade={u} />)}
              </div>
            )}
          </section>
        ))}

        {unidadesSemRoster.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gold-300 mb-3">Unidades sem roster</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {unidadesSemRoster.map((u) => <UnidadeCard key={u.id} unidade={u} />)}
            </div>
          </section>
        )}

        {semUnidade.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gold-300 mb-3">Sem unidade atribuída</h2>
            <UnidadeCard unidade={{ id: 0, nome: "Não colocados", descricao: null, users: semUnidade }} />
          </section>
        )}
      </div>
    </div>
  );
}

type Membro = {
  id: number;
  nome: string;
  nomeGuerra: string | null;
  rank: { abreviatura: string; nome: string; ordem: number; imagem: string | null } | null;
  position: { nome: string; ordem: number } | null;
  specialty: { abreviatura: string } | null;
  status: { nome: string; cor: string } | null;
};

function UnidadeCard({ unidade }: { unidade: { id: number; nome: string; descricao: string | null; users: Membro[] } }) {
  const membros = [...unidade.users].sort(
    (a, b) =>
      (a.position?.ordem ?? 99) - (b.position?.ordem ?? 99) ||
      (b.rank?.ordem ?? 0) - (a.rank?.ordem ?? 0) ||
      a.nome.localeCompare(b.nome)
  );
  return (
    <div className="panel rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gold-500/15 bg-ptr-700/30 flex items-center justify-between">
        <div>
          <div className="font-bold text-gold-300">{unidade.nome}</div>
          {unidade.descricao && <div className="text-xs text-slate-400">{unidade.descricao}</div>}
        </div>
        <span className="text-xs font-semibold text-slate-300 bg-ptr-950/60 rounded-full px-2 py-0.5 border border-gold-500/20">
          {membros.length}
        </span>
      </div>
      {membros.length === 0 ? (
        <div className="p-4 text-sm text-slate-500">Sem efectivos.</div>
      ) : (
        <ul className="divide-y divide-white/5">
          {membros.map((m) => (
            <li key={m.id}>
              <Link href={`/pessoal/${m.id}`} className="flex items-center gap-3 px-4 py-2 hover:bg-white/[0.03]">
                <Insignia rank={m.rank} size={24} /><span className="w-10 text-xs font-bold text-gold-400 shrink-0">{m.rank?.abreviatura ?? "—"}</span>
                <span className="flex-1 min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {m.nome}{m.nomeGuerra && <span className="text-slate-400"> “{m.nomeGuerra}”</span>}
                  </span>
                  <span className="block truncate text-xs text-slate-400">
                    {m.position?.nome ?? "—"}{m.specialty && ` · ${m.specialty.abreviatura}`}
                  </span>
                </span>
                {m.status && <StatusBadge nome={m.status.nome} cor={m.status.cor} />}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
