import { getVapidKeys } from "@/lib/push";

export const dynamic = "force-dynamic";

export async function GET() {
  const { publicKey } = await getVapidKeys();
  return Response.json({ publicKey });
}
