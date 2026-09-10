import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { asc } from "drizzle-orm";
import { PageHeader, Panel, Vazio, ConfirmarApagar, StatusBadge } from "@/components/ui";
import { CATALOGOS } from "@/lib/catalogos";
import { apagarCatalogo } from "@/lib/actions";
import { CatalogoForm } from "@/components/catalogo-form";
import { Insignia, Medalha } from "@/components/insignia";

import { exigirEditor } from "@/lib/auth";
export const dynamic = "force-dynamic";

export default async function CatalogoPage({ params }: { params: Promise<{ slug: string }> }) {
  await exigirEditor();
  const { slug } = await params;
  if (slug === "servidores") redirect("/servidor?gerir=1");
  const cfg = CATALOGOS[slug];
  if (!cfg) notFound();

  const tabela = cfg.tabela;
  const ordem = cfg.temOrdem && "ordem" in tabela ? [asc(tabela.ordem), asc(tabela.nome)] : [asc(tabela.nome)];
  const registos = (await db.select().from(tabela).orderBy(...ordem)) as Record<string, unknown>[];
  const rosters = slug === "unidades" ? await db.query.rosters.findMany() : [];

  const colunas = cfg.campos.filter((c) => c.tipo !== "textarea" && c.tipo !== "url" && !["modpack", "password"].includes(c.nome));

  return (
    <div>
      <PageHeader titulo={cfg.titulo} subtitulo={cfg.descricao} />
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {registos.length === 0 ? (
            <Vazio texto={`Ainda não existem ${cfg.titulo.toLowerCase()}.`} />
          ) : (
            <Panel className="overflow-x-auto !p-0">
              <table className="table">
                <thead>
                  <tr>
                    {cfg.temOrdem && <th>#</th>}
                    {(slug === "patentes" || slug === "condecoracoes") && <th>Insígnia</th>}
                    {colunas.map((c) => <th key={c.nome}>{c.etiqueta}</th>)}
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {registos.map((r) => (
                    <tr key={String(r.id)}>
                      {cfg.temOrdem && <td className="text-slate-500">{String(r.ordem ?? "")}</td>}
                      {slug === "patentes" && <td><Insignia rank={{ abreviatura: String(r.abreviatura), nome: String(r.nome), imagem: r.imagem as string | null }} size={28} /></td>}
                      {slug === "condecoracoes" && <td><Medalha award={{ nome: String(r.nome), imagem: r.imagem as string | null }} size={30} /></td>}
                      {colunas.map((c) => (
                        <td key={c.nome} className={c.nome === "nome" ? "font-medium" : "text-slate-300"}>
                          {c.tipo === "cor" ? (
                            <StatusBadge nome={String(r.nome)} cor={String(r.cor)} />
                          ) : c.tipo === "roster" ? (
                            rosters.find((x) => x.id === r.rosterId)?.nome ?? "—"
                          ) : (
                            String(r[c.nome] ?? "—")
                          )}
                        </td>
                      ))}
                      <td className="text-right whitespace-nowrap">
                        <Link href={`/admin/${slug}/${r.id}`} className="btn btn-ghost !py-1 !px-2 text-xs">Editar</Link>
                        <ConfirmarApagar accao={apagarCatalogo} id={Number(r.id)} extra={{ slug }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          )}
        </div>
        <div>
          <CatalogoForm cfg={cfg} />
        </div>
      </div>
    </div>
  );
}
