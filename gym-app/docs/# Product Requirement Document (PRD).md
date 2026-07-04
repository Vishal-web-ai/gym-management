# Product Requirement Document (PRD) - Mobile-First Gym App

## 1. Project Overview
* **Project Name:** Gym Management Platform (Mobile-First)
* **Core Purpose:** A mobile-optimized web application designed specifically for gym owners/managers to run their entire facility on the go from a smartphone, and for members to check in seamlessly via QR codes.
* **Target Audience:** Gym managers/trainers using smartphones/tablets on the gym floor, and members checking in using their phones at the front desk.

## 2. Core Features (Scope)

### 2.1 Mobile Dashboard & Metrics
* [ ] **Quick-Glance Summary:** Financial overview cards tracking total revenue, active payment statuses (Paid vs. Overdue), and recent operational expenses.
* [ ] **Vertical Layout:** All dashboard widgets must be designed for one-handed vertical scrolling on compact mobile screens.

### 2.2 Mobile Member Management
* [ ] **Search & Filter:** A highly optimized search bar to look up members instantly by name or phone number.
* [ ] **Quick Actions:** Tap-to-call phone linkages directly from the profile and simple button toggles to instantly change a member's status (Active, Overdue, Frozen).
* [ ] **Membership Freezing:** Dedicated logic allowing managers to freeze a subscription directly from a mobile device, automatically updating the backend expiration date.
* [ ] **Payment Logging:** Simple input forms to record incoming cash, card, or UPI payments on the spot.

### 2.3 Browser-Based QR Attendance System
* [ ] **Integrated QR Scanner:** Built-in mobile browser camera scanner that functions securely on mobile viewports (Safari/Chrome) without requiring a native app install.
* [ ] **Instant Check-in:** Instantly validates the scanned QR token, records attendance, and alerts the manager if a member's status is "Overdue" or "Frozen".

### 2.4 WhatsApp Automation System
* [ ] **Automated Receipts:** Triggered immediately upon logging a successful payment, generating a digital receipt sent directly to the member's WhatsApp.
* [ ] **Welcome Kits:** Automatically sends onboarding details and the member's personal QR check-in code via WhatsApp upon creation of a new profile.

### 2.5 Strict Form Validation
* [ ] **Error Handling:** Form touch-inputs must be validated on the client side for smooth UI feedback, backed up by strict server-side validation chains before database insertion.

## 3. Out of Scope (Version 1)
* Desktop-only heavy data layout exports or multi-column ledger spreadsheets.
* Native iOS/Android App Store deployment (this application will run entirely inside mobile web browsers).
* Direct biometric/turnstile hardware integrations (relying entirely on mobile QR scanning for access control).