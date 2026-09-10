import type { ReactNode } from "react";
import { Sidebar, MobileHeader, MobileTabBar } from "@/components/nav";
import { exigirSessao, podeEditar, eComando } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const u = await exigirSessao();
  const pendentes = eComando(u) ? (await db.select({ n: sql<number>`count(*)::int` }).from(users).where(eq(users.contaEstado, "pendente")))[0].n : 0;
  const sessao = {
    pendentes,
    nome: u.nomeGuerra ?? u.nome,
    patente: u.rank?.abreviatura ?? null,
    insignia: u.rank?.imagem ?? null,
    role: u.role,
    podeEditar: podeEditar(u),
    eComando: eComando(u),
  };
  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar sessao={sessao} />
        <div className="flex-1 min-w-0 flex flex-col">
          <MobileHeader sessao={sessao} />
          <main className="flex-1 px-4 py-5 lg:px-8 lg:py-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto">{children}</main>
        </div>
      </div>
      <MobileTabBar />
    </>
  );
}
