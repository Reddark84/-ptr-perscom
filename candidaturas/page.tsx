import Link from "next/link";
import { db } from "@/db";
import { enlistmentApplications } from "@/db/schema";
import { desc } from "drizzle-orm";
import { PageHeader, Panel, Vazio, EstadoCandidatura } from "@/components/ui";
import { fmtDataHora } from "@/lib/format";

import { exigirEditor } from "@/lib/auth";
export const dynamic = "force-dynamic";

const ESTADOS = ["Todas", "Pendente", "Em Análise", "Aceite", "Rejeitada"];

export default async function CandidaturasPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  await exigirEditor();
  const { estado } = await searchParams;
  const filtro = estado && ESTADOS.includes(estado) && estado !== "Todas" ? estado : null;
  const lista = await db.query.enlistmentApplications.findMany({
    where: filtro ? (c, { eq }) => eq(c.status, filtro) : undefined,
    orderBy: [desc(enlistmentApplications.data)],
    with: { form: true, user: true },
  });

  return (
    <div>
      <PageHeader
        titulo="Candidaturas"
        subtitulo="Submissões dos formulários de alistamento e pedidos internos."
        accoes={<Link href="/alistamento" className="btn btn-secondary">Ver formulários públicos</Link>}
      />
      <div className="flex gap-1 flex-wrap mb-4">
        {ESTADOS.map((e) => {
          const activo = (filtro ?? "Todas") === e;
          return (
            <Link
              key={e}
              href={e === "Todas" ? "/candidaturas" : `/candidaturas?estado=${encodeURIComponent(e)}`}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                activo ? "bg-gold-500/20 text-gold-300 border-gold-500/50" : "text-slate-400 border-white/10 hover:text-slate-200"
              }`}
            >
              {e}
            </Link>
          );
        })}
      </div>
      {lista.length === 0 ? (
        <Vazio texto="Sem candidaturas." />
      ) : (
        <Panel className="overflow-x-auto !p-0">
          <table className="table">
            <thead>
              <tr><th>#</th><th>Candidato</th><th>Formulário</th><th>Estado</th><th>Data</th><th></th></tr>
            </thead>
            <tbody>
              {lista.map((c) => (
                <tr key={c.id}>
                  <td className="text-slate-500">{c.id}</td>
                  <td className="font-medium">
                    <Link href={`/candidaturas/${c.id}`} className="hover:text-gold-300">{c.nomeCandidato}</Link>
                    {c.user && <Link href={`/pessoal/${c.user.id}`} className="block text-xs text-emerald-300">→ perfil criado</Link>}
                  </td>
                  <td className="text-slate-300">{c.form?.nome ?? "—"}</td>
                  <td><EstadoCandidatura status={c.status} /></td>
                  <td className="text-slate-400 whitespace-nowrap">{fmtDataHora(c.data)}</td>
                  <td className="text-right"><Link href={`/candidaturas/${c.id}`} className="btn btn-ghost !py-1 !px-2 text-xs">Rever</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}
