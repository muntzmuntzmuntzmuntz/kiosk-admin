import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  const updated = await prisma.activationCode.updateMany({
    where: { code },
    data: { status: "revoked" },
  });

  if (updated.count === 0) {
    return new Response(JSON.stringify({ error: "Activation code not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
