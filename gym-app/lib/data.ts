import type { Member, Payment } from "./types";

export const members: Member[] = [
  {
    id: "1",
    firstName: "Rajesh Sharma",
    phone: "+91 98765 43210",
    status: "Active",
    createdAt: "2025-12-01",
  },
  {
    id: "2",
    firstName: "Priya Verma",
    phone: "+91 87654 32109",
    status: "Active",
    createdAt: "2026-01-15",
  },
  {
    id: "3",
    firstName: "Amit Singh",
    phone: "+91 76543 21098",
    status: "Overdue",
    createdAt: "2025-11-20",
  },
  {
    id: "4",
    firstName: "Sunita Patel",
    phone: "+91 65432 10987",
    status: "Frozen",
    createdAt: "2026-02-10",
  },
  {
    id: "5",
    firstName: "Vikram Joshi",
    phone: "+91 54321 09876",
    status: "Active",
    createdAt: "2026-03-05",
  },
  {
    id: "6",
    firstName: "Anjali Desai",
    phone: "+91 43210 98765",
    status: "Overdue",
    createdAt: "2025-10-12",
  },
  {
    id: "7",
    firstName: "Rohit Kumar",
    phone: "+91 32109 87654",
    status: "Expired",
    createdAt: "2025-08-01",
  },
  {
    id: "8",
    firstName: "Neha Gupta",
    phone: "+91 21098 76543",
    status: "Active",
    createdAt: "2026-04-18",
  },
];

export function getMemberById(id: string): Member | undefined {
  return members.find((m) => m.id === id);
}

export const payments: Payment[] = [
  {
    id: "p1",
    memberId: "1",
    amount: 1500,
    mode: "UPI",
    status: "Paid",
    createdAt: "2026-06-01",
  },
  {
    id: "p2",
    memberId: "1",
    amount: 1500,
    mode: "Cash",
    status: "Paid",
    createdAt: "2026-05-01",
  },
  {
    id: "p3",
    memberId: "2",
    amount: 2000,
    mode: "Card",
    status: "Paid",
    createdAt: "2026-06-10",
  },
  {
    id: "p4",
    memberId: "3",
    amount: 1500,
    mode: "UPI",
    status: "Failed",
    createdAt: "2026-05-15",
  },
  {
    id: "p5",
    memberId: "5",
    amount: 1800,
    mode: "Cash",
    status: "Paid",
    createdAt: "2026-06-05",
  },
  {
    id: "p6",
    memberId: "6",
    amount: 1500,
    mode: "UPI",
    status: "Failed",
    createdAt: "2026-04-20",
  },
];

export function getPaymentsByMemberId(memberId: string): Payment[] {
  return payments.filter((p) => p.memberId === memberId);
}
