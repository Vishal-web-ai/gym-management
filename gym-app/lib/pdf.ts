import jsPDF from "jspdf";

export function downloadReceiptPdf(
  memberName: string,
  amount: number,
  mode: string,
  date: string,
  gymName = "Iron Forge Gym",
) {
  const doc = new jsPDF({ unit: "mm", format: "a5" });
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFillColor(15, 15, 15);
  doc.rect(0, 0, pageW, doc.internal.pageSize.getHeight(), "F");

  doc.setTextColor(217, 119, 6);
  doc.setFontSize(18);
  doc.text(gymName, pageW / 2, 25, { align: "center" });

  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.5);
  doc.line(15, 30, pageW - 15, 30);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text("Payment Receipt", pageW / 2, 42, { align: "center" });

  doc.setFontSize(10);
  const d = new Date(date).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
  doc.text(`Date: ${d}`, 15, 58);
  doc.text(`Member: ${memberName.trim()}`, 15, 66);
  doc.text(`Amount: Rs. ${amount.toLocaleString("en-IN")}`, 15, 74);
  doc.text(`Mode: ${mode}`, 15, 82);
  doc.text("Status: Paid", 15, 90);

  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.3);
  doc.line(15, 98, pageW - 15, 98);

  doc.setFontSize(9);
  doc.setTextColor(160, 160, 160);
  doc.text("Thank you for your payment!", pageW / 2, 108, { align: "center" });

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `receipt-${memberName.trim().replace(/\s+/g, "-").toLowerCase()}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
