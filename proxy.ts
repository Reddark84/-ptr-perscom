import { NextResponse, type NextRequest } from "next/server";

const PUBLICAS = ["/login", "/registo", "/instalar-app", "/app", "/alistamento", "/api/", "/manifest.webmanifest", "/sw.js", "/_next/", "/favicon", "/icon-", "/apple-icon", "/emblema", "/patentes/", "/medalhas/"];

function b64url(buf: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Verifica a assinatura HMAC do token quando AUTH_SECRET está disponível no ambiente (Edge). Caso contrário, valida só o formato/expiração — as páginas fazem a verificação completa. */
async function tokenPlausivel(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const partes = token.split(".");
  if (partes.length !== 3) return false;
  const [uid, exp, sig] = partes;
  if (!/^\d+$/.test(uid) || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return true;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${uid}.${exp}`));
  return b64url(mac) === sig;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLICAS.some((p) => pathname.startsWith(p)) || /\.[a-z0-9]+$/i.test(pathname)) return NextResponse.next();
  const ok = await tokenPlausivel(req.cookies.get("ptr_sessao")?.value);
  if (!ok) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname);
    const res = NextResponse.redirect(url);
    res.cookies.delete("ptr_sessao");
    return res;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
