import { utilizadorActual } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const u = await utilizadorActual();
  return Response.json(u ? { ok: true, id: u.id, nome: u.nomeGuerra ?? u.nome, role: u.role } : { ok: false }, { headers: { "Cache-Control": "no-store" } });
}
