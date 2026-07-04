# Mobile Site Architecture & Layout Routing

## 1. Tech Stack
* **Framework:** Next.js (App Router)
* **Styling:** Tailwind CSS
* **Icons:** Lucide React (using mobile-friendly icon sets)
* **Validation:** Strict server-side Zod schemas for all form parsing.

## 2. Mobile Page Structure & Responsive Routing
* `/login` (Mobile-optimized login screen with large touch inputs)
* `/dashboard` (Single-column layout containing responsive summary cards and quick action buttons)
* `/members` (Infinite scroll or neatly paginated list of members layout optimized for phone screens)
* `/members/[id]` (Tabbed mobile layout: Tab 1: Profile info, Tab 2: Payment history, Tab 3: Freeze settings)
* `/attendance` (Launches the mobile browser camera stream using `html5-qrcode` or a lightweight scanner library)

## 3. Core Mobile Navigation Mapping
* Navigation must utilize a responsive shell layout.
* If layout viewport context is mobile, render `<BottomNav />`.
* If layout viewport context is desktop, render `<SidebarNav />`.