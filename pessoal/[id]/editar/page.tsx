import { notFound } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader, ConfirmarApagar } from "@/components/ui";
import { UserForm } from "@/components/user-form";
import { actualizarUser, apagarUser } from "@/lib/actions";
import { nomeCompleto } from "@/lib/format";

import { exigirEditor } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function EditarMilitarPage({ params }: { params: Promise<{ id: string }> }) {
  await exigirEditor();
  const { id } = await params;
  const user = await db.query.users.findFirst({ where: eq(users.id, Number(id)) });
  if (!user) notFound();
  return (
    <div>
      <PageHeader
        titulo={`Editar · ${nomeCompleto(user)}`}
        subtitulo="Actualizar dados do perfil base."
        accoes={<ConfirmarApagar accao={apagarUser} id={user.id} texto="Apagar militar" />}
      />
      <UserForm user={user} action={actualizarUser} />
    </div>
  );
}
