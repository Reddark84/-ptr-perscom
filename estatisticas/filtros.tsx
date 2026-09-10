import Link from "next/link";
import type { Periodo } from "@/lib/estatisticas";

const PERIODOS: { k: Periodo; l: string }[] = [
  { k: "30d", l: "30 dias" },
  { k: "90d", l: "90 dias" },
  { k: "180d", l: "6 meses" },
  { k: "365d", l: "1 ano" },
  { k: "tudo", l: "Tudo" },
];

export function FiltroPeriodo({ actual, base, extra = "" }: { actual: Periodo; base: string; extra?: string }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {PERIODOS.map((p) => (
        <Link key={p.k} href={`${base}?periodo=${p.k}${extra}`} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${actual === p.k ? "bg-gold-500/20 text-gold-300 border-gold-500/50" : "text-slate-400 border-white/10 hover:text-slate-200"}`}>
          {p.l}
        </Link>
      ))}
    </div>
  );
}

export function AbasEstatisticas({ activa, periodo }: { activa: "geral" | "operadores"; periodo: Periodo }) {
  const abas = [
    { k: "geral", l: "Visão geral", href: `/estatisticas?periodo=${periodo}` },
    { k: "operadores", l: "Operadores", href: `/estatisticas/operadores?periodo=${periodo}` },
  ];
  return (
    <div className="flex gap-1 border-b border-gold-500/15 mb-4">
      {abas.map((a) => (
        <Link key={a.k} href={a.href} className={`px-4 py-2 text-sm rounded-t-lg border-b-2 transition ${activa === a.k ? "border-gold-400 text-gold-300 bg-gold-500/5" : "border-transparent text-slate-400 hover:text-slate-200"}`}>
          {a.l}
        </Link>
      ))}
    </div>
  );
}

export function lerPeriodo(v: string | undefined): Periodo {
  return (["30d", "90d", "180d", "365d", "tudo"] as Periodo[]).includes(v as Periodo) ? (v as Periodo) : "180d";
}
