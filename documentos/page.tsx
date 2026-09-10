import Link from "next/link";
import { db } from "@/db";
import { PageHeader, Panel, Vazio, ConfirmarApagar } from "@/components/ui";
import { apagarDocumento } from "@/lib/actions";

import { exigirEditor } from "@/lib/auth";
export const dynamic = "force-dynamic";

export default async function DocumentosPage() {
  await exigirEditor();
  const docs = await db.query.documents.findMany({ orderBy: (d, { asc }) => asc(d.nome) });
  return (
    <div>
      <PageHeader
        titulo="Documentos"
        subtitulo="Modelos de documentos oficiais com placeholders. Gera-os a partir do perfil de cada militar."
        accoes={<Link href="/documentos/novo" className="btn btn-primary">+ Novo modelo</Link>}
      />
      {docs.length === 0 ? (
        <Vazio texto="Sem modelos de documento." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {docs.map((d) => (
            <Panel key={d.id} titulo={d.nome} accoes={
              <div className="flex gap-1">
                <Link href={`/documentos/${d.id}`} className="btn btn-ghost !py-1 !px-2 text-xs">Editar</Link>
                <ConfirmarApagar accao={apagarDocumento} id={d.id} />
              </div>
            }>
              <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono max-h-40 overflow-hidden relative">
                {d.conteudoTemplate}
              </pre>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {d.placeholders.map((p) => (
                  <code key={p} className="text-[11px] bg-ptr-950/60 border border-gold-500/20 rounded px-1.5 py-0.5 text-gold-300">{`{{${p}}}`}</code>
                ))}
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
