import { prisma } from "@/lib/prisma";

type CreateActivationCodeRequest = {
  type?: string;
};

function generateCode(type?: string): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const part = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

  return `${type === "trial" ? "ZYR" : "ACE"}-${part()}-${part()}-${part()}-${part()}`;
}

export async function POST(req: Request) {
  let body: CreateActivationCodeRequest = {};

  try {
    body = (await req.json()) as CreateActivationCodeRequest;
  } catch {
    body = {};
  }

  const durationDays = body.type === "trial" ? 3 : 3650;
  const expiresAt = new Date(Date.now() + durationDays * 86400000);

  const code = await prisma.activationCode.create({
    data: {
      code: generateCode(body.type),
      expiresAt,
    },
  });

  return Response.json(code);
}
