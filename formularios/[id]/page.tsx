import { notFound } from "next/navigation";
import { db } from "@/db";
import { forms } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/ui";
import { FormularioForm } from "@/components/formulario-form";

import { exigirEditor } from "@/lib/auth";
export const dynamic = "force-dynamic";

export default async function EditarFormularioPage({ params }: { params: Promise<{ id: string }> }) {
  await exigirEditor();
  const { id } = await params;
  const form = await db.query.forms.findFirst({ where: eq(forms.id, Number(id)) });
  if (!form) notFound();
  return (
    <div>
      <PageHeader titulo={`Editar · ${form.nome}`} />
      <FormularioForm form={form} />
    </div>
  );
}
