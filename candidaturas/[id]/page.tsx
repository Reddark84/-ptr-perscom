import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { enlistmentApplications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader, Panel, Campo, ConfirmarApagar, EstadoCandidatura } from "@/components/ui";
import { actualizarCandidatura, aceitarCandidatura, apagarCandidatura } from "@/lib/actions";
import { fmtDataHora } from "@/lib/format";

import { exigirEditor } from "@/lib/auth";
export const dynamic = "force-dynamic";

export default async function CandidaturaPage({ params }: { params: Promise<{ id: string }> }) {
  await exigirEditor();
  const { id } = await params;
  const c = await db.query.enlistmentApplications.findFirst({
    where: eq(enlistmentApplications.id, Number(id)),
    with: { form: true, user: true },
  });
  if (!c) notFound();

  const [ranks, units, positions, statuses, specialties] = await Promise.all([
    db.query.ranks.findMany({ orderBy: (r, { asc }) => asc(r.ordem) }),
    db.query.units.findMany({ orderBy: (u, { asc }) => asc(u.ordem) }),
    db.query.positions.findMany({ orderBy: (p, { asc }) => asc(p.ordem) }),
    db.query.statuses.findMany({ orderBy: (s, { asc }) => asc(s.ordem) }),
    db.query.specialties.findMany({ orderBy: (s, { asc }) => asc(s.nome) }),
  ]);

  const campos = c.form?.campos ?? [];
  const chaves = new Set(campos.map((x) => x.chave));
  const extras = Object.keys(c.formData).filter((k) => !chaves.has(k));

  const defRank = ranks.find((r) => r.abreviatura === "Rec") ?? ranks[0];
  const defUnit = units.find((u) => /instru/i.test(u.nome)) ?? units[0];
  const defPos = positions.find((p) => /recruta/i.test(p.nome)) ?? positions[0];
  const defStatus = statuses.find((s) => /instru/i.test(s.nome)) ?? statuses[0];

  return (
    <div>
      <PageHeader
        titulo={`Candidatura #${c.id} · ${c.nomeCandidato}`}
        subtitulo={`${c.form?.nome ?? "Formulário removido"} · ${fmtDataHora(c.data)}`}
        accoes={
          <>
            <Link href="/candidaturas" className="btn btn-ghost">← Voltar</Link>
            <ConfirmarApagar accao={apagarCandidatura} id={c.id} />
          </>
        }
      />
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel titulo="Respostas" className="lg:col-span-2">
          <dl className="space-y-3">
            {campos.map((f) => (
              <div key={f.chave} className="border-b border-white/5 pb-2">
                <dt className="text-xs uppercase tracking-wider text-slate-400">{f.etiqueta}</dt>
                <dd className="text-sm whitespace-pre-wrap mt-0.5">{c.formData[f.chave] || <span className="text-slate-500">—</span>}</dd>
              </div>
            ))}
            {extras.map((k) => (
              <div key={k} className="border-b border-white/5 pb-2">
                <dt className="text-xs uppercase tracking-wider text-slate-400">{k}</dt>
                <dd className="text-sm whitespace-pre-wrap mt-0.5">{c.formData[k]}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <div className="space-y-4">
          <Panel titulo="Estado da candidatura" accoes={<EstadoCandidatura status={c.status} />}>
            <form action={actualizarCandidatura} className="space-y-3">
              <input type="hidden" name="id" value={c.id} />
              <Campo etiqueta="Estado">
                <select name="status" defaultValue={c.status} className="input">
                  {["Pendente", "Em Análise", "Aceite", "Rejeitada"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </Campo>
              <Campo etiqueta="Notas de revisão">
                <textarea name="notasRevisao" rows={4} defaultValue={c.notasRevisao ?? ""} className="input" />
              </Campo>
              <button className="btn btn-secondary w-full">Guardar</button>
            </form>
          </Panel>

          {c.user ? (
            <Panel titulo="Militar criado">
              <Link href={`/pessoal/${c.user.id}`} className="btn btn-primary w-full">Abrir perfil de {c.user.nome}</Link>
            </Panel>
          ) : (
            <Panel titulo="Aceitar e criar militar">
              <form action={aceitarCandidatura} className="space-y-3">
                <input type="hidden" name="id" value={c.id} />
                <Campo etiqueta="Nº de serviço"><input name="numeroServico" className="input" placeholder="PTR-0XX" /></Campo>
                <Campo etiqueta="Patente inicial">
                  <select name="rankId" defaultValue={defRank?.id ?? ""} className="input">
                    {ranks.map((r) => <option key={r.id} value={r.id}>{r.abreviatura} — {r.nome}</option>)}
                  </select>
                </Campo>
                <Campo etiqueta="Unidade">
                  <select name="unitId" defaultValue={defUnit?.id ?? ""} className="input">
                    {units.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </select>
                </Campo>
                <Campo etiqueta="Cargo">
                  <select name="positionId" defaultValue={defPos?.id ?? ""} className="input">
                    {positions.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </Campo>
                <Campo etiqueta="Especialidade">
                  <select name="specialtyId" defaultValue="" className="input">
                    <option value="">—</option>
                    {specialties.map((s) => <option key={s.id} value={s.id}>{s.abreviatura} — {s.nome}</option>)}
                  </select>
                </Campo>
                <Campo etiqueta="Estado">
                  <select name="statusId" defaultValue={defStatus?.id ?? ""} className="input">
                    {statuses.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                </Campo>
                <button className="btn btn-primary w-full">✓ Aceitar e criar perfil</button>
              </form>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
