import { PageHeader } from "@/components/ui";
import { FormularioForm } from "@/components/formulario-form";

import { exigirEditor } from "@/lib/auth";
export default async function NovoFormularioPage() {
  await exigirEditor();
  return (
    <div>
      <PageHeader titulo="Novo formulário" />
      <FormularioForm />
    </div>
  );
}
