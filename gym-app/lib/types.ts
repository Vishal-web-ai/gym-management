export type MemberStatus = "Active" | "Overdue" | "Frozen";

export type PaymentMode = "Cash" | "UPI" | "Card";

export type PaymentStatus = "Paid" | "Failed";

export type Member = {
  id: string;
  firstName: string;
  phone: string;
  address?: string | null;
  gender?: string | null;
  status: MemberStatus | string;
  endDate?: Date | string | null;
  planId?: string | null;
  plan?: Plan;
  image?: string | null;
  createdAt: Date | string;
};

export type Plan = {
  id: string;
  name: string;
  price: number;
  durationDays: number;
};

export type Payment = {
  id: string;
  memberId: string;
  amount: number;
  mode: PaymentMode;
  status: PaymentStatus;
  createdAt: string;
};

export type AttendanceRecord = {
  id: string;
  memberId: string;
  memberName: string;
  checkInTime: string;
};
