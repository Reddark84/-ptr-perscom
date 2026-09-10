import Link from "next/link";
import { db } from "@/db";
import { notifications, pushSubscriptions } from "@/db/schema";
import { desc } from "drizzle-orm";
import { PageHeader, Panel, Campo, Vazio, SoEditores } from "@/components/ui";
import { enviarAvisoGeral } from "@/lib/actions";
import { fmtDataHora } from "@/lib/format";
import { NotificacoesToggle } from "@/components/pwa";

import { exigirSessao } from "@/lib/auth";
export const dynamic = "force-dynamic";

export default async function AvisosPage() {
  await exigirSessao();
  const [lista, nSubs] = await Promise.all([
    db.query.notifications.findMany({ orderBy: [desc(notifications.criadoEm)], limit: 50, with: { event: true } }),
    db.$count(pushSubscriptions),
  ]);
  return (
    <div>
      <PageHeader titulo="Avisos" subtitulo="Histórico de notificações enviadas aos efectivos e envio de avisos gerais." accoes={<NotificacoesToggle compacto />} />
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel titulo="Histórico" className="lg:col-span-2">
          {lista.length === 0 ? (
            <Vazio texto="Ainda não foram enviados avisos." />
          ) : (
            <ul className="divide-y divide-white/5">
              {lista.map((n) => (
                <li key={n.id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{n.titulo}</div>
                      <div className="text-sm text-slate-300">{n.corpo}</div>
                      {n.url && <Link href={n.url} className="text-xs text-gold-300 hover:underline">{n.event ? "Abrir evento →" : "Abrir →"}</Link>}
                    </div>
                    <div className="text-right text-xs text-slate-500 shrink-0">
                      <div>{fmtDataHora(n.criadoEm)}</div>
                      <div>{n.enviadas} entregue(s)</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <SoEditores fallback={<Panel titulo="Notificações"><p className="text-sm text-slate-300 mb-3">Activa as notificações neste dispositivo para receberes os avisos do Comando.</p><NotificacoesToggle /></Panel>}>
        <Panel titulo="Enviar aviso geral">
          <p className="text-xs text-slate-400 mb-3">{nSubs} dispositivo(s) subscritos.</p>
          <form action={enviarAvisoGeral} className="space-y-3">
            <Campo etiqueta="Título *"><input name="titulo" required className="input" placeholder="Servidor em manutenção" /></Campo>
            <Campo etiqueta="Mensagem *"><textarea name="corpo" required rows={4} className="input" /></Campo>
            <Campo etiqueta="Link (opcional)"><input name="url" className="input" placeholder="/eventos" /></Campo>
            <button className="btn btn-primary w-full">📣 Enviar a todos</button>
          </form>
        </Panel>
        </SoEditores>
      </div>
    </div>
  );
}
