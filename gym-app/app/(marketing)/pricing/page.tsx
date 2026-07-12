import PricingClient from "@/components/marketing/PricingClient";
import LandingFooter from "@/components/LandingFooter";

export const metadata = {
  title: "Pricing — Rajoria Fitness",
  description:
    "Choose the perfect plan for your fitness journey. Flexible pricing with no hidden fees.",
};

export default function PricingPage() {
  return (
    <>
      <PricingClient />
      <LandingFooter />
    </>
  );
}
