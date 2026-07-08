export function waUrl(phone: string, text: string): string {
  let clean = phone.replace(/[\s\-\(\)]/g, "");
  if (!clean.startsWith("+")) {
    clean = clean.length === 12 && clean.startsWith("91") ? "+" + clean : "+91" + clean;
  }
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

export function openWhatsApp(phone: string, text: string) {
  const url = waUrl(phone, text);
  window.open(url, "_blank");
}

export function receiptMessage(
  memberName: string,
  amount: number,
  mode: string,
  date: string,
  gymName = "Iron Forge Gym",
  checkInLink?: string,
): string {
  const d = new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const lines = [
    `🏋️ *${gymName}*`,
    ``,
    `*Payment Receipt*`,
    `📅 Date: ${d}`,
    `👤 Member: ${memberName}`,
    `💰 Amount: ₹${amount.toLocaleString("en-IN")}`,
    `💳 Mode: ${mode}`,
    `✅ Status: Paid`,
    ``,
    `Thank you for your payment! 💪`,
  ];
  if (checkInLink) {
    lines.push(
      ``,
      `📲 *Quick Check-in*`,
      `Tap below to check in next time:`,
      checkInLink,
    );
  }
  return lines.join("\n");
}

export function welcomeMessage(
  memberName: string,
  joinDate: string,
  gymName = "Iron Forge Gym",
  checkInLink?: string,
): string {
  const d = new Date(joinDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const lines = [
    `🎉 *Welcome to ${gymName}!*`,
    ``,
    `*Membership Details*`,
    `👤 Name: ${memberName}`,
    `📅 Joined: ${d}`,
    `✅ Status: Active`,
  ];
  if (checkInLink) {
    lines.push(
      ``,
      `📲 *Quick Check-in*`,
      `Tap below to check in at the gym:`,
      checkInLink,
    );
  }
  lines.push(
    ``,
    `We're excited to have you on board! 💪🔥`,
  );
  return lines.join("\n");
}

export function overdueBulkMessage(
  members: { firstName: string; phone: string }[],
  gymName = "Iron Forge Gym",
): string {
  const list = members.map((m, i) => `${i + 1}. ${m.firstName}`).join("\n");
  return [
    `⏰ *Due Payment Reminder - ${gymName}*`,
    ``,
    `The following members have overdue payments:`,
    ``,
    list,
    ``,
    `Please clear your dues at the earliest.`,
    `Pay via Cash / UPI / Card at the front desk.`,
    `Thank you! 💪`,
  ].join("\n");
}

export function reminderMessage(
  memberName: string,
  status: string,
  gymName = "Iron Forge Gym",
): string {
  return [
    `⏰ *Fee Reminder - ${gymName}*`,
    ``,
    `Hi ${memberName},`,
    `Your membership status is *${status}*.`,
    `Please clear your dues at the earliest to continue uninterrupted access.`,
    ``,
    `Pay via Cash / UPI / Card at the front desk.`,
    `Thank you! 💪`,
  ].join("\n");
}

export function checkInLinkMessage(
  memberName: string,
  memberId: string,
  gymUserId: string,
  origin: string,
  gymName = "Iron Forge Gym",
): string {
  const link = `${origin}/member?memberId=${memberId}&gym=${gymUserId}`;
  return [
    `🏋️ *${gymName}*`,
    ``,
    `Hi ${memberName}, tap the link below to check in:`,
    link,
    ``,
    `📊 You can also view your attendance, streak, and payment history there.`,
    `💪 See you at the gym!`,
  ].join("\n");
}
