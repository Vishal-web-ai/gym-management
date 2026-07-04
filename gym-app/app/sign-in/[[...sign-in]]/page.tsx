import { SignIn } from "@clerk/nextjs";
import { Dumbbell } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 animate-fade-in">
      <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary-subtle">
        <Dumbbell size={28} className="text-primary" />
      </div>
      <SignIn
        fallbackRedirectUrl="/"
        appearance={{
          elements: {
            rootBox: "w-full max-w-sm",
            card: "bg-transparent shadow-none",
            headerTitle: "text-text-primary font-bold tracking-tight",
            headerSubtitle: "text-text-secondary",
            formFieldLabel: "text-text-secondary text-sm font-medium",
            formFieldInput:
              "bg-white/[0.04] border-white/[0.08] text-text-primary rounded-xl py-3 px-4 focus:ring-primary/50 focus:border-primary/50",
            formButtonPrimary:
              "bg-primary hover:bg-primary/90 rounded-xl py-3 text-sm font-medium shadow-lg shadow-primary/20",
            dividerLine: "bg-white/[0.08]",
            dividerText: "text-text-muted",
            socialButtonsBlockButton:
              "bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] text-text-primary rounded-xl py-3",
            socialButtonsBlockButtonText: "text-text-primary font-medium",
            footerActionLink: "text-primary hover:text-primary/80",
            identityPreviewText: "text-text-primary",
            identityPreviewEditButton: "text-primary",
            formFieldAction: "text-primary",
            alert: "rounded-xl",
            alertText: "text-text-secondary text-sm",
          },
        }}
      />
    </div>
  );
}
