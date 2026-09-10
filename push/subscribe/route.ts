import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { utilizadorActual } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Body = {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
  userId?: number | null;
};

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  const sessao = await utilizadorActual().catch(() => null);
  body.userId = sessao?.id ?? body.userId ?? null;
  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return Response.json({ ok: false, erro: "Subscrição inválida" }, { status: 400 });
  }
  await db
    .insert(pushSubscriptions)
    .values({
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      userId: body.userId ?? null,
      userAgent: req.headers.get("user-agent"),
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { p256dh: body.keys.p256dh, auth: body.keys.auth, userId: body.userId ?? null },
    });
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const body = (await req.json()) as { endpoint?: string };
  if (body.endpoint) {
    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, body.endpoint));
  }
  return Response.json({ ok: true });
}
