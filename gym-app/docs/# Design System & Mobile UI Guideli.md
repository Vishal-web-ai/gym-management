# Design System & Mobile UI Guidelines

## 1. Color Palette (Energetic & Dark Mode First)
* **Primary / Accent:** `#EF4444` (Tailwind Red-500 - high-energy buttons, active states)
* **Secondary:** `#3B82F6` (Tailwind Blue-500 - system info, payment status links)
* **Background:** `#0F172A` (Tailwind Slate-900 - sleek dark mode to save battery life on mobile screens)
* **Surface/Cards:** `#1E293B` (Tailwind Slate-800 - contrast for mobile UI cards)
* **Text Primary:** `#F8FAFC` (Slate-50)

## 2. Typography & Touch Targets
* **Fonts:** `Inter` or standard system sans-serif for ultra-sharp mobile readability.
* **Touch Targets:** All interactive elements (buttons, list items, checkboxes) must be at least **48x48px** to prevent accidental mis-clicks.

## 3. Mobile-First Component Rules
* **App Layout:** * **Mobile (< 768px):** A sticky **Bottom Navigation Bar** with icons for easy thumb access (Dashboard, Members, Scanner). No desktop sidebar.
  * **Desktop (>= 768px):** Responsive fallback to a standard left sidebar.
* **Tables vs Cards:** Standard data tables are forbidden on mobile viewports. Member data and payments must render as **collapsible stacked cards**.
* **Badges:** Explicitly clear color pills (Green = Active/Paid, Red = Overdue, Light Blue = Frozen).