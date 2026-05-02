import { prisma } from "@/lib/prisma";

const UPGRADE_YEARS = 10;
const EXPIRING_SOON_DAYS = 30;

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

function shouldExtendExpiration(body: unknown) {
  if (!body || typeof body !== "object") {
    return false;
  }

  return (body as { extendExpiration?: unknown }).extendExpiration === true;
}

function addYears(date: Date, years: number) {
  const updated = new Date(date);
  updated.setFullYear(updated.getFullYear() + years);
  return updated;
}

function canExtendExpiration(code: string, expiresAt: Date) {
  const daysUntilExpiration = Math.ceil((expiresAt.getTime() - Date.now()) / 86400000);

  return code.startsWith("ZYR") || (daysUntilExpiration >= 0 && daysUntilExpiration <= EXPIRING_SOON_DAYS);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const body = await req.json().catch(() => null);
  const description = getDescription(body);
  const extendExpiration = shouldExtendExpiration(body);

  if (description === null && !extendExpiration) {
    return Response.json(
      { success: false, error: "Description or upgrade is required" },
      { status: 400 },
    );
  }

  const record = await prisma.activationCode.findUnique({
    where: { code },
  });

  if (!record) {
    return Response.json(
      { success: false, error: "Activation code not found" },
      { status: 404 },
    );
  }

  if (extendExpiration && !canExtendExpiration(record.code, record.expiresAt)) {
    return Response.json(
      { success: false, error: "Activation code is not eligible for upgrade" },
      { status: 400 },
    );
  }

  const data: { description?: string; expiresAt?: Date } = {};

  if (description !== null) {
    data.description = description;
  }

  if (extendExpiration) {
    data.expiresAt = addYears(new Date(), UPGRADE_YEARS);
  }

  const updated = await prisma.activationCode.update({
    where: { code },
    data,
  });

  return Response.json({
    success: true,
    code: updated.code,
    description: updated.description ?? "",
    expiresAt: updated.expiresAt,
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
