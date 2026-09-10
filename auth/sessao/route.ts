import { NextResponse, type NextRequest } from "next/server";
import { lerToken, COOKIE_SESSAO } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** URL absoluta correcta atrás de proxy (usa X-Forwarded-Host/Proto quando existem). */
function urlPublica(req: NextRequest, caminho: string) {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? req.nextUrl.host;
  const proto = (req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "")).split(",")[0].trim();
  return new URL(caminho, `${proto}://${host}`);
}


/**
 * Define o cookie de sessão a partir de um token válido passado na URL e redirecciona.
 * Usado como recurso quando o browser não guarda o cookie devolvido pelo pedido de login
 * (ex.: app aberta dentro de um visualizador/iframe) — abre-se esta rota num separador próprio.
 */
export async function GET(req: NextRequest) {
  const t = req.nextUrl.searchParams.get("t") ?? undefined;
  const next = req.nextUrl.searchParams.get("next") ?? "/";
  const id = await lerToken(t);
  const destino = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  if (!id || !t) return NextResponse.redirect(urlPublica(req, "/login?erro=sessao"), 303);
  const proto = req.headers.get("x-forwarded-proto");
  const https = proto ? proto.split(",")[0].trim() === "https" : req.nextUrl.protocol === "https:";
  const res = NextResponse.redirect(urlPublica(req, destino), 303);
  res.cookies.set(COOKIE_SESSAO, t, { httpOnly: true, sameSite: https ? "none" : "lax", secure: https, path: "/", maxAge: 30 * 24 * 60 * 60 });
  return res;
}
