import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { code, device_id } = await req.json();

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

  if (record.deviceId) {
    if (record.deviceId !== device_id) {
      return Response.json({ valid: false, reason: "device_mismatch" });
    }
  } else {
    await prisma.activationCode.update({
      where: { code },
      data: { deviceId: device_id },
    });
  }

  return Response.json({
    valid: true,
    expires_at: record.expiresAt,
  });
}
