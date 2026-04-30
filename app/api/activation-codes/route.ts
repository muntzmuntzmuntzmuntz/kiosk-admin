import { prisma } from "@/lib/prisma";

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const part = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

  return `HKR-${part()}-${part()}-${part()}-${part()}`;
}

export async function POST(req: Request) {
  const expiresAt = new Date(Date.now() + 365 * 86400000);

  const code = await prisma.activationCode.create({
    data: {
      code: generateCode(),
      expiresAt,
    },
  });

  return Response.json(code);
}