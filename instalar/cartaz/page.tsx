import Image from "next/image";
import { urlDaApp, qrSvg } from "@/lib/app-url";
import { PrintButton } from "@/components/print-button";
import Link from "next/link";

import { exigirSessao } from "@/lib/auth";
export const dynamic = "force-dynamic";

export default async function CartazPage() {
  await exigirSessao();
  const base = await urlDaApp();
  const [qrTel, qrPc] = await Promise.all([qrSvg(`${base}/app`, 260, "#000000"), qrSvg(`${base}/`, 260, "#000000")]);
  return (
    <div>
      <div className="no-print flex gap-2 justify-end mb-4">
        <Link href="/instalar" className="btn btn-ghost">← Voltar</Link>
        <PrintButton />
      </div>
      <div className="doc-preview !font-sans max-w-3xl mx-auto text-center">
        <Image src="/emblema.png" alt="PTR" width={150} height={150} className="mx-auto rounded-full" />
        <h1 className="text-3xl font-black mt-3 tracking-wide">PHOENIX TASKFORCE RANGERS</h1>
        <div className="text-sm uppercase tracking-[0.3em] opacity-70">PERSCOM · Sistema de Gestão de Pessoal</div>
        <p className="mt-4 text-base">Instala a app da comunidade no teu telemóvel ou PC. Recebe avisos de treinos e missões, consulta o roster, os eventos e a informação do servidor.</p>
        <div className="grid grid-cols-2 gap-8 mt-6">
          <div>
            <div className="mx-auto inline-block border-4 border-black p-1 bg-white" dangerouslySetInnerHTML={{ __html: qrTel }} />
            <div className="font-bold mt-2 text-lg">📱 Telemóvel</div>
            <div className="text-xs opacity-70">Android · iPhone</div>
          </div>
          <div>
            <div className="mx-auto inline-block border-4 border-black p-1 bg-white" dangerouslySetInnerHTML={{ __html: qrPc }} />
            <div className="font-bold mt-2 text-lg">💻 PC</div>
            <div className="text-xs opacity-70">Chrome · Edge</div>
          </div>
        </div>
        <div className="mt-6 font-mono text-sm break-all border-t border-black/30 pt-3">{base}</div>
      </div>
    </div>
  );
}
