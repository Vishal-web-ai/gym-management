import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import SidebarNav from "@/components/SidebarNav";
import AnimLayout from "@/components/AnimLayout";
import { QueryProvider } from "@/lib/providers/query-provider";

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

export const metadata: Metadata = {
  title: "Gym Manager",
  description: "Mobile-first gym management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      afterSignOutUrl="/sign-in"
      signUpForceRedirectUrl="/onboarding"
      signInFallbackRedirectUrl="/"
      localization={{
        signIn: {
          start: {
            title: "Sign In",
            subtitle: "Welcome back! Let's get your gym running smoothly.",
          },
        },
        signUp: {
          start: {
            title: "Sign Up",
            subtitle: "Create your account to get started.",
          },
        },
      }}
    >
      <html lang="en" className={`${plusJakarta.variable} ${bricolage.variable} h-full`}>
        <head>
          <link rel="preconnect" href="https://clerk.com" />
          <link rel="preconnect" href="https://img.clerk.com" />
          <link rel="dns-prefetch" href="https://clerk.com" />
          <link rel="dns-prefetch" href="https://img.clerk.com" />
        </head>
        <body className="h-full font-sans text-text-primary">
          <QueryProvider>
            <SidebarNav />
            <div className="mx-auto flex min-h-full w-full flex-col md:ml-64 md:max-w-(--breakpoint-lg) md:px-8 lg:max-w-(--breakpoint-xl) xl:max-w-(--breakpoint-2xl)">
              <AnimLayout>{children}</AnimLayout>
            </div>
            <BottomNav />
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
