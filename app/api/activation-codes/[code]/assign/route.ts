import { prisma } from "@/lib/prisma";

function getDeviceId(body: unknown) {
  if (!body || typeof body !== "object") {
    return null;
  }

  const payload = body as { device_id?: unknown; deviceId?: unknown };
  const deviceId = payload.device_id ?? payload.deviceId;

  if (typeof deviceId !== "string") {
    return null;
  }

  const trimmed = deviceId.trim();

  return trimmed.length > 0 ? trimmed : null;
}

async function assignCode(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const body = await req.json().catch(() => null);
  const deviceId = getDeviceId(body);

  if (!deviceId) {
    return Response.json(
      { assigned: false, reason: "device_id_required" },
      { status: 400 },
    );
  }

  const now = new Date();

  const updated = await prisma.activationCode.updateMany({
    where: {
      code,
      status: "active",
      expiresAt: { gt: now },
      deviceId: null,
    },
    data: { deviceId },
  });

  if (updated.count === 1) {
    const record = await prisma.activationCode.findUniqueOrThrow({
      where: { code },
    });

    return Response.json({
      assigned: true,
      code: record.code,
      deviceId: record.deviceId,
      expires_at: record.expiresAt,
    });
  }

  const record = await prisma.activationCode.findUnique({
    where: { code },
  });

  if (!record) {
    return Response.json({ assigned: false, reason: "not_found" }, { status: 404 });
  }

  if (record.status === "revoked") {
    return Response.json({ assigned: false, reason: "revoked" }, { status: 409 });
  }

  if (now > record.expiresAt) {
    return Response.json({ assigned: false, reason: "expired" }, { status: 409 });
  }

  if (record.deviceId === deviceId) {
    return Response.json({
      assigned: true,
      already_assigned: true,
      code: record.code,
      deviceId: record.deviceId,
      expires_at: record.expiresAt,
    });
  }

  return Response.json(
    {
      assigned: false,
      reason: "code_already_used",
      deviceId: record.deviceId,
    },
    { status: 409 },
  );
}

export async function POST(req: Request, context: { params: Promise<{ code: string }> }) {
  return assignCode(req, context);
}

export async function PATCH(req: Request, context: { params: Promise<{ code: string }> }) {
  return assignCode(req, context);
}
