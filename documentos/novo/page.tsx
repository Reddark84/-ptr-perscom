import { PageHeader } from "@/components/ui";
import { DocumentoForm } from "@/components/documento-form";

import { exigirEditor } from "@/lib/auth";
export default async function NovoDocumentoPage() {
  await exigirEditor();
  return (
    <div>
      <PageHeader titulo="Novo modelo de documento" />
      <DocumentoForm />
    </div>
  );
}
