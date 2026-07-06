import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number = 403) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message = "Not authenticated") {
    super(message, 401);
  }
}

export class ForbiddenError extends AuthError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, 403);
  }
}

export type Role = "OWNER" | "STAFF" | "MEMBER";

export type CurrentUser = {
  clerkId: string;
  role: Role | null;
  gymOwnerId: string;
};

async function getCurrentUserImpl(): Promise<CurrentUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const gymUser = await prisma.gymUser.findUnique({
    where: { clerkId: userId },
  });

  if (!gymUser) {
    const config = await prisma.gymConfig.findUnique({ where: { userId } });
    if (config) {
      await prisma.gymUser.upsert({
        where: { clerkId: userId },
        update: { role: "OWNER", gymOwnerId: userId },
        create: { clerkId: userId, role: "OWNER", gymOwnerId: userId },
      });
      return { clerkId: userId, role: "OWNER", gymOwnerId: userId };
    }
    return { clerkId: userId, role: null, gymOwnerId: userId };
  }

  return {
    clerkId: userId,
    role: gymUser.role as Role,
    gymOwnerId: gymUser.gymOwnerId ?? userId,
  };
}

export const getCurrentUser = cache(getCurrentUserImpl);

export async function getUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new UnauthorizedError();
  return userId;
}

export async function requireRole(...roles: Role[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  if (!user.role || !roles.includes(user.role)) {
    throw new ForbiddenError();
  }
  return user;
}

export async function requireRolePage(...roles: Role[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.role || !roles.includes(user.role)) {
    redirect("/access-denied");
  }
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  return requireRole("OWNER");
}

export async function requireAdminPage(): Promise<CurrentUser> {
  return requireRolePage("OWNER");
}

export async function requireOwner(): Promise<CurrentUser> {
  return requireRole("OWNER");
}

export async function requireOwnerPage(): Promise<CurrentUser> {
  return requireRolePage("OWNER");
}
