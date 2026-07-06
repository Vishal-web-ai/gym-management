import { SignIn } from "@clerk/nextjs";
import { FadeIn } from "@/components/animations";

export default function SignInPage() {
  return (
    <FadeIn y={16}>
      <div className="flex min-h-full flex-col items-center px-6">
        <SignIn
          fallbackRedirectUrl="/"
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              footer: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
                padding: "1rem",
                background: "transparent",
                borderTop: "1px solid rgba(249,115,22,0.15)",
              },
              footerActionLink: {
                display: "inline",
                color: "#F97316",
                fontSize: "0.875rem",
                fontWeight: 500,
                textDecoration: "none",
              },
            },
          }}
        />
      </div>
    </FadeIn>
  );
}
