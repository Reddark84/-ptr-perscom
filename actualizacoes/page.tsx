import Link from "next/link";
import { db } from "@/db";
import { auditLog } from "@/db/schema";
import { desc } from "drizzle-orm";
import { PageHeader, Panel, Vazio, Tag } from "@/components/ui";
import { fmtDataHora } from "@/lib/format";
import { NotificacoesToggle } from "@/components/pwa";

import { exigirSessao } from "@/lib/auth";
export const dynamic = "force-dynamic";

const TONE: Record<string, "gold" | "green" | "red" | "blue" | "slate"> = { criar: "green", actualizar: "blue", apagar: "red", notificar: "gold", acesso: "slate" };
const ROTULO: Record<string, string> = { criar: "Novo", actualizar: "Actualizado", apagar: "Removido", notificar: "Aviso", acesso: "Acesso" };

export default async function ActualizacoesPage() {
  await exigirSessao();
  const lista = await db.query.auditLog.findMany({ orderBy: [desc(auditLog.criadoEm)], limit: 150 });
  return (
    <div>
      <PageHeader titulo="Actualizações" subtitulo="Registo automático de todas as alterações feitas no PERSCOM. Todos os efectivos com notificações activas são avisados." accoes={<NotificacoesToggle compacto />} />
      <Panel className="!p-0">
        {lista.length === 0 ? (
          <div className="p-5"><Vazio texto="Ainda não há alterações registadas." /></div>
        ) : (
          <ul className="divide-y divide-white/5">
            {lista.map((a) => (
              <li key={a.id} className="px-5 py-3 flex items-start gap-3">
                <div className="pt-0.5"><Tag tone={TONE[a.accao] ?? "slate"}>{ROTULO[a.accao] ?? a.accao}</Tag></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <span className="text-gold-400 font-semibold">{a.entidade}</span> · {a.url ? <Link href={a.url} className="hover:text-gold-300">{a.descricao}</Link> : a.descricao}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">por {a.actorNome} · {fmtDataHora(a.criadoEm)}{a.notificado && " · 🔔 notificado"}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
