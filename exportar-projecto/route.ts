import { spawn } from "node:child_process";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { utilizadorActual, eComando } from "@/lib/auth";

export const dynamic = "force-dynamic";

const EXCLUIR = ["node_modules/*", ".next/*", ".git/*", ".env", ".env.local", "drizzle/*", "out/*", "*.log"];

const ENV_EXEMPLO = [
  "# Preenche e renomeia para .env (ou define estas variáveis na plataforma de alojamento)",
  "DATABASE_URL=postgresql://utilizador:password@servidor:5432/perscom?sslmode=require",
  "NEXT_PUBLIC_APP_URL=https://o-teu-endereco.vercel.app",
  "COMANDO_PASSWORD=REDPTR2026",
  "AUTH_SECRET=muda-para-um-segredo-longo-e-aleatorio",
  "VAPID_SUBJECT=mailto:comando@ptr-rangers.pt",
  "",
].join("\n");

/** Exporta o código-fonte do projecto em ZIP (só Comando) para publicação no GitHub/Vercel. */
export async function GET() {
  const u = await utilizadorActual();
  if (!eComando(u)) return new Response("Sem permissão", { status: 403 });

  const raiz = process.cwd();
  const tmp = await mkdtemp(path.join(tmpdir(), "ptr-zip-"));
  const ficheiro = path.join(tmp, `ptr-perscom-${new Date().toISOString().slice(0, 10)}.zip`);
  await writeFile(path.join(raiz, ".env.publicacao"), ENV_EXEMPLO);

  const args = ["-r", "-q", "-9", ficheiro, ".", ...EXCLUIR.flatMap((e) => ["-x", e])];
  const codigo = await new Promise<number>((resolve) => {
    const p = spawn("zip", args, { cwd: raiz });
    p.on("close", (c) => resolve(c ?? 1));
    p.on("error", () => resolve(127));
  });
  await rm(path.join(raiz, ".env.publicacao"), { force: true });
  if (codigo !== 0) {
    await rm(tmp, { recursive: true, force: true });
    return new Response("Não foi possível gerar o ZIP neste servidor. Usa o repositório do projecto directamente.", { status: 500 });
  }

  const { readFile } = await import("node:fs/promises");
  const dados = await readFile(ficheiro);
  await rm(tmp, { recursive: true, force: true });
  return new Response(new Uint8Array(dados), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${path.basename(ficheiro)}"`,
      "Cache-Control": "no-store",
    },
  });
}
