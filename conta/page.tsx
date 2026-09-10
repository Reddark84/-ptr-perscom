import { exigirSessao } from "@/lib/auth";
import { alterarMinhaPassword } from "@/lib/auth-actions";
import { PageHeader, Panel, Campo, Tag } from "@/components/ui";
import { Insignia } from "@/components/insignia";
import { NOME_ROLE } from "@/db/schema";
import { NotificacoesToggle } from "@/components/pwa";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ContaPage({ searchParams }: { searchParams: Promise<{ erro?: string; ok?: string }> }) {
  const { erro, ok } = await searchParams;
  const u = await exigirSessao();
  return (
    <div>
      <PageHeader titulo="A minha conta" subtitulo="Sessão, permissões e password." />
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel titulo="Sessão">
          <div className="flex items-center gap-3">
            <Insignia rank={u.rank} size={40} />
            <div>
              <div className="font-bold text-gold-300">{u.rank?.abreviatura} {u.nomeGuerra ?? u.nome}</div>
              <div className="text-xs text-slate-400">login: {u.login ?? "—"}</div>
            </div>
          </div>
          <div className="mt-3"><Tag tone={u.role === "comando" ? "gold" : u.role === "editor" ? "green" : "slate"}>{NOME_ROLE[u.role]}</Tag></div>
          <p className="text-xs text-slate-400 mt-3">
            {u.role === "comando" && "Acesso total: podes alterar todos os registos, agendar eventos e gerir permissões dos efectivos."}
            {u.role === "editor" && "Autorizado pelo Comando a alterar registos e agendar eventos."}
            {u.role === "operador" && "Apenas consulta. Para alterar registos pede autorização ao Comando."}
          </p>
          <div className="flex gap-2 mt-4">
            <Link href={`/pessoal/${u.id}`} className="btn btn-secondary">O meu perfil</Link>
            <form action="/api/auth/logout" method="post"><button className="btn btn-danger">Terminar sessão</button></form>
          </div>
        </Panel>
        <Panel titulo="Alterar password">
          {erro && <div className="mb-3 text-sm text-red-300">{erro === "actual" ? "Password actual incorrecta." : "A nova password deve ter pelo menos 6 caracteres."}</div>}
          {ok && <div className="mb-3 text-sm text-emerald-300">Password alterada.</div>}
          <form action={alterarMinhaPassword} className="space-y-3">
            <Campo etiqueta="Password actual"><input type="password" name="actual" required className="input" autoComplete="current-password" /></Campo>
            <Campo etiqueta="Nova password"><input type="password" name="nova" required minLength={6} className="input" autoComplete="new-password" /></Campo>
            <button className="btn btn-primary w-full">Guardar</button>
          </form>
        </Panel>
        <Panel titulo="Notificações neste dispositivo">
          <p className="text-sm text-slate-300 mb-3">Recebe automaticamente todas as actualizações feitas no PERSCOM (eventos, promoções, colocações, avisos…).</p>
          <NotificacoesToggle />
        </Panel>
      </div>
    </div>
  );
}
