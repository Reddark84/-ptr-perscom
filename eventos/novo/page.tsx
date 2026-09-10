import { PageHeader } from "@/components/ui";
import { EventoForm } from "@/components/evento-form";
import { criarEvento } from "@/lib/actions";

import { exigirEditor } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NovoEventoPage() {
  await exigirEditor();
  return (
    <div>
      <PageHeader titulo="Novo evento" subtitulo="Agendar treino, missão, operação ou reunião." />
      <EventoForm action={criarEvento} />
    </div>
  );
}
