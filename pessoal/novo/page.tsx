import { PageHeader } from "@/components/ui";
import { UserForm } from "@/components/user-form";
import { criarUser } from "@/lib/actions";

import { exigirEditor } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NovoMilitarPage() {
  await exigirEditor();
  return (
    <div>
      <PageHeader titulo="Novo Militar" subtitulo="Registar um novo elemento na Phoenix Taskforce Rangers." />
      <UserForm action={criarUser} />
    </div>
  );
}
