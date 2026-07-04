import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import SidebarNav from "@/components/SidebarNav";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#080E1A",
};

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.com https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://img.clerk.com",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://*.clerk.com https://*.neon.tech",
  "frame-src https://*.clerk.com https://challenges.cloudflare.com",
].join("; ");

export const metadata: Metadata = {
  title: "Gym Manager",
  description: "Mobile-first gym management platform",
  other: { "Content-Security-Policy": csp },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/sign-in" signUpForceRedirectUrl="/onboarding" signInFallbackRedirectUrl="/">
      <html lang="en" className={`${plusJakarta.variable} ${bricolage.variable} h-full`}>
        <body className="h-full font-sans text-text-primary">
          <SidebarNav />
          <div className="mx-auto flex min-h-full w-full max-w-lg flex-col md:ml-64 md:max-w-none md:px-8 lg:max-w-3xl xl:max-w-4xl">
            <main className="flex-1 pb-20 md:pb-8 animate-fade-in">{children}</main>
          </div>
          <BottomNav />
        </body>
      </html>
    </ClerkProvider>
  );
}
