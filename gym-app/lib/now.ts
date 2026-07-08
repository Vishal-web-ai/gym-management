import { cache } from "react";
import { prisma } from "@/lib/prisma";

async function getTestOffsetImpl(): Promise<number> {
  if (process.env.NODE_ENV !== "development") return 0;
  try {
    const config = await prisma.gymConfig.findFirst({ select: { testTimeOffset: true } });
    return Number(config?.testTimeOffset ?? 0);
  } catch {
    return 0;
  }
}

const getTestOffset = cache(getTestOffsetImpl);

export async function getNow(): Promise<Date> {
  const offset = await getTestOffset();
  return offset ? new Date(Date.now() + offset) : new Date();
}

export async function getNowMs(): Promise<number> {
  const offset = await getTestOffset();
  return offset ? Date.now() + offset : Date.now();
}
