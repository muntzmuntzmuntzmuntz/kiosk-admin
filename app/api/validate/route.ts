import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code")?.trim();
  const deviceId = url.searchParams.get("deviceId")?.trim();

  if (!code || !deviceId) {
    return Response.json(
      { valid: false, reason: "missing_params" },
      { status: 400 },
    );
  }

  const record = await prisma.activationCode.findFirst({
    where: {
      code,
      deviceId,
    },
  });

  if (!record) {
    return Response.json({ valid: false, reason: "not_found" });
  }
  console.log(record);

  if (new Date() > record.expiresAt) {
    return Response.json({
      valid: false,
      code: record.code,
      reason: "expired",
      expiresAt: record.expiresAt,
    });
  }

  return Response.json({
    valid: true,
    code: record.code,
    deviceId: record.deviceId,
    expiresAt: record.expiresAt,
  });
}

export async function POST(req: Request) {
  const { code, deviceId } = await req.json();

  const record = await prisma.activationCode.findUnique({
    where: { code },
  });

  if (!record) {
    return Response.json({ valid: false, reason: "not_found" });
  }

  if (record.status === "revoked") {
    return Response.json({ valid: false, reason: "revoked" });
  }

  if (new Date() > record.expiresAt) {
    return Response.json({ valid: false, reason: "expired" });
  }

  await prisma.activationCode.update({
    where: { code },
    data: { deviceId: deviceId },
  });

  return Response.json({
    valid: true,
    code,
    expiresAt: record.expiresAt,
  });
}
