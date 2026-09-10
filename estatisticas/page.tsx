import Link from "next/link";
import { exigirSessao } from "@/lib/auth";
import { estatisticasGerais } from "@/lib/estatisticas";
import { PageHeader, Panel, Stat } from "@/components/ui";
import { BarrasHorizontais, Donut, ColunasMensais, LinhaMensal } from "@/components/graficos";
import { Medalha } from "@/components/insignia";
import { COR_TIPO } from "@/lib/eventos";
import { FiltroPeriodo, AbasEstatisticas, lerPeriodo } from "./filtros";

export const dynamic = "force-dynamic";

const COR_PRESENCA: Record<string, string> = { Presente: "#22c55e", Talvez: "#eab308", Ausente: "#ef4444", Justificado: "#3b82f6" };
const COR_CAND: Record<string, string> = { Aceite: "#22c55e", Rejeitada: "#ef4444", "Em Análise": "#3b82f6", Pendente: "#eab308" };

export default async function EstatisticasPage({ searchParams }: { searchParams: Promise<{ periodo?: string }> }) {
  await exigirSessao();
  const periodo = lerPeriodo((await searchParams).periodo);
  const e = await estatisticasGerais(periodo);
  const t = e.totais;

  return (
    <div>
      <PageHeader titulo="Estatísticas" subtitulo="Análise do efectivo, actividade operacional e progressão dos operadores." accoes={<FiltroPeriodo actual={periodo} base="/estatisticas" />} />
      <AbasEstatisticas activa="geral" periodo={periodo} />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        <Stat etiqueta="Efectivo" valor={t.militares} href="/pessoal" icone="👤" />
        <Stat etiqueta="Assiduidade" valor={`${t.assiduidade}%`} href="/estatisticas/operadores" icone="✓" />
        <Stat etiqueta="Eventos realizados" valor={t.eventos} href="/eventos" icone="📅" />
        <Stat etiqueta="Promoções" valor={t.promocoes} icone="★" />
        <Stat etiqueta="Condecorações" valor={t.condecoracoes} icone="🎖" />
        <Stat etiqueta="Qualificações" valor={t.qualificacoes} icone="◎" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel titulo="Actividade mensal (eventos por tipo)" className="lg:col-span-2">
          <ColunasMensais rotulos={e.meses} series={e.eventosMensais.filter((s) => s.valores.some((v) => v > 0)).map((s) => ({ nome: s.tipo, valores: s.valores, cor: COR_TIPO[s.tipo as keyof typeof COR_TIPO] }))} />
          <p className="text-xs text-slate-500 mt-2">Últimos 12 meses · {t.eventosFuturos} evento(s) agendado(s) a partir de hoje.</p>
        </Panel>
        <Panel titulo="Presenças">
          <Donut dados={e.presencasPorEstado.map((p) => ({ nome: p.estado, n: p.n, cor: COR_PRESENCA[p.estado] }))} />
          <p className="text-xs text-slate-500 mt-3">Taxa de assiduidade global: <b className="text-gold-300">{t.assiduidade}%</b> (presentes / total de marcações).</p>
        </Panel>

        <Panel titulo="Efectivo por estado">
          <Donut dados={e.porEstado.filter((s) => s.n > 0).map((s) => ({ nome: s.nome, n: s.n, cor: s.cor }))} />
        </Panel>
        <Panel titulo="Efectivo por unidade">
          <BarrasHorizontais dados={e.porUnidade.map((u) => ({ nome: u.nome, n: u.n }))} cor="#2f5f3a" />
        </Panel>
        <Panel titulo="Efectivo por patente">
          <BarrasHorizontais dados={e.porPatente.filter((p) => p.n > 0).map((p) => ({ nome: `${p.nome} — ${p.nomeCompleto}`, n: p.n }))} cor="#e0b84a" maxItens={24} />
        </Panel>

        <Panel titulo="Promoções por mês">
          <LinhaMensal rotulos={e.meses} valores={e.promocoesMensais} cor="#e0b84a" />
        </Panel>
        <Panel titulo="Condecorações por mês">
          <LinhaMensal rotulos={e.meses} valores={e.condecoracoesMensais} cor="#a855f7" />
        </Panel>
        <Panel titulo="Alistamentos por mês">
          <LinhaMensal rotulos={e.meses} valores={e.alistamentosMensais} cor="#22c55e" />
        </Panel>

        <Panel titulo="Condecorações mais atribuídas">
          {e.topCondecoracoes.filter((c) => c.n > 0).length === 0 ? <p className="text-sm text-slate-500">Sem condecorações no período.</p> : (
            <ul className="space-y-2">
              {e.topCondecoracoes.filter((c) => c.n > 0).map((c) => (
                <li key={c.nome} className="flex items-center gap-3 text-sm">
                  <Medalha award={c} size={22} />
                  <span className="flex-1 truncate">{c.nome}</span>
                  <span className="font-bold text-gold-300">{c.n}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel titulo="Qualificações mais obtidas">
          <BarrasHorizontais dados={e.topQualificacoes.filter((q) => q.n > 0).map((q) => ({ nome: q.abrev ? `${q.abrev} — ${q.nome}` : q.nome, n: q.n }))} cor="#14b8a6" />
        </Panel>
        <Panel titulo="Especialidades">
          <BarrasHorizontais dados={e.porEspecialidade.filter((s) => s.n > 0).map((s) => ({ nome: s.nome, n: s.n }))} cor="#3b82f6" />
        </Panel>

        <Panel titulo="Eventos por tipo">
          <Donut dados={e.eventosPorTipo.map((x) => ({ nome: x.tipo, n: x.n, cor: COR_TIPO[x.tipo as keyof typeof COR_TIPO] }))} />
        </Panel>
        <Panel titulo="Candidaturas">
          <Donut dados={e.candidaturasPorEstado.map((c) => ({ nome: c.status, n: c.n, cor: COR_CAND[c.status] }))} />
          <p className="text-xs text-slate-500 mt-3">{t.candidaturas} candidatura(s) no período · {t.contas} conta(s) activa(s) na app.</p>
        </Panel>
        <Panel titulo="Registo de actividade" accoes={<Link href="/actualizacoes" className="text-xs text-gold-300 hover:underline">Ver tudo →</Link>}>
          <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Por tipo de registo</div>
          <BarrasHorizontais dados={e.actividadePorEntidade.map((a) => ({ nome: a.entidade, n: a.n }))} cor="#94a3b8" maxItens={6} />
          <div className="text-xs uppercase tracking-wider text-slate-500 mt-4 mb-1">Quem mais regista</div>
          <BarrasHorizontais dados={e.actividadePorActor.map((a) => ({ nome: a.actor, n: a.n }))} cor="#e0b84a" maxItens={5} />
        </Panel>
      </div>
    </div>
  );
}
