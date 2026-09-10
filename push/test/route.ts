import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { enviarPara } from "@/lib/push";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { endpoint } = (await req.json()) as { endpoint?: string };
  if (!endpoint) return Response.json({ ok: false }, { status: 400 });
  const sub = await db.query.pushSubscriptions.findFirst({ where: eq(pushSubscriptions.endpoint, endpoint) });
  if (!sub) return Response.json({ ok: false, erro: "Subscrição não encontrada" }, { status: 404 });
  const ok = await enviarPara(sub, {
    titulo: "PTR PERSCOM · Notificações activas",
    corpo: "Vais receber avisos de treinos e missões da Phoenix Taskforce Rangers.",
    url: "/eventos",
    tag: "teste",
  });
  return Response.json({ ok });
}
