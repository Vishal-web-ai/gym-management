import { z } from "zod";

export const phoneSchema = z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .transform((v) => v.replace(/[\s\-\(\)]/g, ""));

export const genderSchema = z.enum(["Male", "Female", "Other"]);

const requiredString = (message: string) =>
  z.preprocess((value) => value ?? "", z.string().min(1, message));

const memberImageSchema = z
  .union([
    z.literal(""),
    z
      .string()
      .startsWith("data:image/", "Member photo must be an image")
      .max(700_000, "Member photo is too large"),
  ])
  .optional()
  .nullable();

export const createMemberSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  phone: phoneSchema,
  address: z.string().max(200).optional().or(z.literal("")),
  gender: requiredString("Gender is required").pipe(genderSchema),
  endDate: requiredString("End date is required"),
  planId: requiredString("Plan is required"),
  image: memberImageSchema,
});

export const updateMemberSchema = z.object({
  id: z.string().min(1),
  firstName: z.string().min(1, "First name is required").max(50),
  phone: phoneSchema,
  address: z.string().max(200).optional().or(z.literal("")),
  status: z.enum(["Active", "Overdue", "Frozen", "Expired"]),
  gender: requiredString("Gender is required").pipe(genderSchema),
  endDate: requiredString("End date is required"),
  planId: requiredString("Plan is required"),
  image: memberImageSchema,
});

export const logPaymentSchema = z.object({
  memberId: z.string().min(1),
  amount: z.coerce.number().positive("Amount must be positive"),
  mode: z.enum(["Cash", "UPI", "Card"]),
  planId: z.string().min(1, "Plan is required"),
  endDate: z.string().optional(),
});

export const freezeMemberSchema = z.object({
  memberId: z.string().min(1),
});

export const createMemberWithPaymentSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  phone: phoneSchema,
  address: z.string().max(200).optional().or(z.literal("")),
  gender: requiredString("Gender is required").pipe(genderSchema),
  endDate: requiredString("End date is required"),
  planId: requiredString("Plan is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  mode: z.enum(["Cash", "UPI", "Card"]),
  image: memberImageSchema,
});

export const createExpenseSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  amount: z.coerce.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
});

export const updateExpenseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Title is required").max(100),
  amount: z.coerce.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
});
