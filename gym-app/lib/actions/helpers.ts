import { ZodError } from "zod";

const errorMessages: Record<string, string> = {
  P2000: "Value is too long for the database column.",
  P2001: "Record not found.",
  P2002: "A record with this phone number already exists.",
  P2003: "Cannot delete: this member has related records.",
  P2025: "Record not found. It may have been deleted.",
  P1000: "Could not connect to the database. Check your connection.",
  P1001: "Cannot reach the database server. It may be down.",
  P1012: "Database schema error. Run prisma db push to sync.",
};

export function formatError(error: unknown): string {
  if (error instanceof ZodError) {
    return error.issues.map((e) => e.message).join(". ") + ".";
  }
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code: string }).code;
    if (code in errorMessages) return errorMessages[code];
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("connect") || msg.includes("network"))
      return "Could not connect to the database. Check your internet connection.";
    if (msg.includes("unique constraint") || msg.includes("duplicate"))
      return "A member with this phone number already exists.";
    if (msg.includes("foreign key"))
      return "Cannot complete: this member has related records.";
    if (msg.includes("validation"))
      return "Invalid data. Please check the form fields.";
  }
  return "Something went wrong. Please try again.";
}
