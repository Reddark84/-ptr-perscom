import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { userDocuments } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { PageHeader, ConfirmarApagar } from "@/components/ui";
import { apagarDocumentoUser } from "@/lib/actions";
import { fmtDataHora, nomeCompleto } from "@/lib/format";
import { PrintButton } from "@/components/print-button";

import { exigirSessao } from "@/lib/auth";
export const dynamic = "force-dynamic";

export default async function DocumentoGeradoPage({
  params,
}: {
  params: Promise<{ id: string; docId: string }>;
}) {
  await exigirSessao();
  const { id, docId } = await params;
  const doc = await db.query.userDocuments.findFirst({
    where: and(eq(userDocuments.id, Number(docId)), eq(userDocuments.userId, Number(id))),
    with: { user: true },
  });
  if (!doc) notFound();

  return (
    <div>
      <div className="no-print">
        <PageHeader
          titulo={doc.nome}
          subtitulo={`${doc.user ? nomeCompleto(doc.user) : ""} · gerado em ${fmtDataHora(doc.criadoEm)}`}
          accoes={
            <>
              <Link href={`/pessoal/${id}?tab=documentos`} className="btn btn-ghost">← Voltar</Link>
              <PrintButton />
              <ConfirmarApagar accao={apagarDocumentoUser} id={doc.id} extra={{ userId: Number(id) }} />
            </>
          }
        />
      </div>
      <div className="max-w-3xl mx-auto">
        <div className="doc-preview">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#c9a227]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon-192.png" alt="PTR" width={56} height={56} className="rounded-full" />
            <div>
              <div className="font-bold tracking-widest text-sm">PHOENIX TASKFORCE RANGERS</div>
              <div className="text-xs opacity-70">Comando de Pessoal · PERSCOM</div>
            </div>
          </div>
          {doc.conteudo}
        </div>
      </div>
    </div>
  );
}
