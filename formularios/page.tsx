import Link from "next/link";
import { db } from "@/db";
import { PageHeader, Panel, Vazio, ConfirmarApagar, Tag } from "@/components/ui";
import { apagarFormulario } from "@/lib/actions";

import { exigirEditor } from "@/lib/auth";
export const dynamic = "force-dynamic";

export default async function FormulariosPage() {
  await exigirEditor();
  const lista = await db.query.forms.findMany({ orderBy: (f, { asc }) => asc(f.id) });
  return (
    <div>
      <PageHeader
        titulo="Formulários"
        subtitulo="Formulários de alistamento e outros pedidos. Cada formulário tem campos configuráveis."
        accoes={<Link href="/formularios/novo" className="btn btn-primary">+ Novo formulário</Link>}
      />
      {lista.length === 0 ? (
        <Vazio texto="Sem formulários." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {lista.map((f) => (
            <Panel key={f.id} titulo={f.nome} accoes={f.activo ? <Tag tone="green">Activo</Tag> : <Tag tone="slate">Inactivo</Tag>}>
              <p className="text-sm text-slate-300 line-clamp-3">{f.instrucoes}</p>
              <div className="text-xs text-slate-400 mt-3">
                {f.campos.length} campo(s) · Estado inicial: <span className="text-gold-300">{f.statusDefault}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Link href={`/alistamento/${f.id}`} className="btn btn-primary !py-1.5 text-xs">Abrir formulário público</Link>
                <Link href={`/formularios/${f.id}`} className="btn btn-secondary !py-1.5 text-xs">Editar</Link>
                <ConfirmarApagar accao={apagarFormulario} id={f.id} />
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
