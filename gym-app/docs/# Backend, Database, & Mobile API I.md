# Backend, Database, & Mobile API Integration

## 1. Database Schema (PostgreSQL via Prisma ORM)
* **User/Admin Table:** ID, Email, Password (hashed), Role.
* **Member Table:** * ID, First Name, Last Name, Phone Number (string, format strictly enforced for WhatsApp delivery), Email, Status (Active, Frozen, Expired).
* **Payment Table:** * ID, MemberID (Foreign Key), Amount, PaymentMode (Cash, UPI, Card), Status (Paid, Failed), CreatedAt.
* **Attendance Table:**
  * ID, MemberID (Foreign Key), CheckInTime (Timestamp).
* **Expense Table:**
  * ID, Title, Amount, Category, Date.

## 2. Server-Side Data Validation Chain
* Every single API route or Server Action must use a strict **Zod Schema** to parse incoming payloads.
* **Mobile Input Sanitization:** Strip spaces/dashes from phone numbers to ensure they conform to exact E.164 international formats before database entry.
* Prevent negative numbers for gym payments or expenses.

## 3. Third-Party Core APIs
* **WhatsApp Automation Gateway:**
  * Build a backend service helper (`services/whatsapp.ts`) triggered asynchronously on events (e.g., Check-in confirmation, payment success, welcome kit creation).
* **QR Tokenization System:**
  * Generate an encrypted token string representing the Member ID. When the camera reads this QR code at `/attendance`, the backend decrypts it and marks the member present.