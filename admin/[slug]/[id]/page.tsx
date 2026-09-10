import { notFound } from "next/navigation";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/ui";
import { CATALOGOS } from "@/lib/catalogos";
import { CatalogoForm } from "@/components/catalogo-form";

import { exigirEditor } from "@/lib/auth";
export const dynamic = "force-dynamic";

export default async function EditarCatalogoPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  await exigirEditor();
  const { slug, id } = await params;
  const cfg = CATALOGOS[slug];
  if (!cfg) notFound();
  const [registo] = (await db
    .select()
    .from(cfg.tabela)
    .where(eq(cfg.tabela.id, Number(id)))
    .limit(1)) as Record<string, unknown>[];
  if (!registo) notFound();

  return (
    <div>
      <PageHeader titulo={`${cfg.titulo} · Editar`} subtitulo={String(registo.nome ?? "")} />
      <div className="max-w-xl">
        <CatalogoForm cfg={cfg} registo={registo} />
      </div>
    </div>
  );
}
