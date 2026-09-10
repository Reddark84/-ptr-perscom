import { notFound } from "next/navigation";
import { db } from "@/db";
import { events } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader, ConfirmarApagar } from "@/components/ui";
import { EventoForm } from "@/components/evento-form";
import { actualizarEvento, apagarEvento } from "@/lib/actions";

import { exigirEditor } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
  await exigirEditor();
  const { id } = await params;
  const ev = await db.query.events.findFirst({ where: eq(events.id, Number(id)) });
  if (!ev) notFound();
  return (
    <div>
      <PageHeader titulo={`Editar · ${ev.titulo}`} accoes={<ConfirmarApagar accao={apagarEvento} id={ev.id} texto="Apagar evento" />} />
      <EventoForm evento={ev} action={actualizarEvento} />
    </div>
  );
}
