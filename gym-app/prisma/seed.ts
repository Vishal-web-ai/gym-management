import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

async function main() {
  // Data is now per-user, created during onboarding.
  // No app-wide seed data needed.
  console.log("Multi-tenant mode active — each user creates their own data during onboarding.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
