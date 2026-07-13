import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Bricolage_Grotesque, Oswald, Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import dynamic from "next/dynamic";
import AnimLayout from "@/components/AnimLayout";
import SplashScreen from "@/components/SplashScreen";
import { SerwistProvider } from "./serwist";

const BottomNav = dynamic(() => import("@/components/BottomNav"));
const SidebarNav = dynamic(() => import("@/components/SidebarNav"));
import { QueryProvider } from "@/lib/providers/query-provider";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

const APP_NAME = "Gym Manager";
const APP_DEFAULT_TITLE = "Gym Manager";
const APP_TITLE_TEMPLATE = "%s - Gym Manager";
const APP_DESCRIPTION = "Mobile-first gym management platform";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/pwa/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#080E1A",
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
      <html lang="en" className={`${plusJakarta.variable} ${bricolage.variable} ${oswald.variable} ${inter.variable} ${jetbrains.variable} h-full`}>
        <head>
          <link rel="preconnect" href="https://clerk.com" />
          <link rel="preconnect" href="https://img.clerk.com" />
          <link rel="dns-prefetch" href="https://clerk.com" />
          <link rel="dns-prefetch" href="https://img.clerk.com" />
          <link rel="apple-touch-icon" href="/pwa/apple-touch-icon.png" />
        </head>
        <body className="h-full font-sans text-text-primary">
          <SplashScreen />
          <SerwistProvider swUrl="/serwist/sw.js">
            <QueryProvider>
              <SidebarNav />
              <div className="mx-auto flex min-h-full w-full max-w-lg flex-col md:ml-64 md:max-w-none md:px-8 lg:max-w-3xl xl:max-w-4xl">
                <AnimLayout>{children}</AnimLayout>
              </div>
              <BottomNav />
            </QueryProvider>
          </SerwistProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
