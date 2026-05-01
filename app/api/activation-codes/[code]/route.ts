import { prisma } from "@/lib/prisma";

function getDescription(body: unknown) {
  if (!body || typeof body !== "object") {
    return null;
  }

  const payload = body as { description?: unknown };

  if (typeof payload.description !== "string") {
    return null;
  }

  return payload.description.trim().slice(0, 200);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const body = await req.json().catch(() => null);
  const description = getDescription(body);

  if (description === null) {
    return Response.json(
      { success: false, error: "Description is required" },
      { status: 400 },
    );
  }

  const updated = await prisma.activationCode.updateMany({
    where: { code },
    data: { description },
  });

  if (updated.count === 0) {
    return Response.json(
      { success: false, error: "Activation code not found" },
      { status: 404 },
    );
  }

  const record = await prisma.activationCode.findUnique({
    where: { code },
  });

  return Response.json({
    success: true,
    code: record?.code,
    description: record?.description ?? "",
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  const deleted = await prisma.activationCode.deleteMany({
    where: { code },
  });

  if (deleted.count === 0) {
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
