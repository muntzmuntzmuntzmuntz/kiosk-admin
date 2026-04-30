import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const limit = Math.max(1, Number(url.searchParams.get("limit") ?? "8"));
  const status = url.searchParams.get("status");
  const device = url.searchParams.get("device");
  const now = new Date();

  const where: Record<string, unknown> = {};

  if (status === "revoked") {
    where.status = "revoked";
  } else if (status === "active") {
    where.status = "active";
    where.expiresAt = { gt: now };
  } else if (status === "expired") {
    where.status = { not: "revoked" };
    where.expiresAt = { lt: now };
  }

  if (device === "assigned") {
    where.deviceId = { not: null };
  } else if (device === "unassigned") {
    where.deviceId = null;
  }

  const [total, codes] = await Promise.all([
    prisma.activationCode.count({ where }),
    prisma.activationCode.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return Response.json({ codes, total, page, limit });
}