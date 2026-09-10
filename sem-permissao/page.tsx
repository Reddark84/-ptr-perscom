import Link from "next/link";

import { exigirSessao } from "@/lib/auth";
export default async function SemPermissaoPage() {
  await exigirSessao();
  return (
    <div className="text-center py-20">
      <div className="text-5xl">🔒</div>
      <h1 className="text-2xl font-bold text-gold-300 mt-3">Sem permissão</h1>
      <p className="text-slate-400 mt-2 max-w-md mx-auto">Esta acção está reservada ao <b>Comando</b> e aos operadores autorizados. Se precisas de fazer alterações, pede autorização ao Comando.</p>
      <Link href="/" className="btn btn-primary mt-6">Voltar ao Painel</Link>
    </div>
  );
}
