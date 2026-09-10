import { notFound } from "next/navigation";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/ui";
import { DocumentoForm } from "@/components/documento-form";

import { exigirEditor } from "@/lib/auth";
export const dynamic = "force-dynamic";

export default async function EditarDocumentoPage({ params }: { params: Promise<{ id: string }> }) {
  await exigirEditor();
  const { id } = await params;
  const doc = await db.query.documents.findFirst({ where: eq(documents.id, Number(id)) });
  if (!doc) notFound();
  return (
    <div>
      <PageHeader titulo={`Editar · ${doc.nome}`} />
      <DocumentoForm doc={doc} />
    </div>
  );
}
