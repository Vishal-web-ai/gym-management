import ProgramsClient from "@/components/marketing/ProgramsClient";
import LandingFooter from "@/components/LandingFooter";

export const metadata = {
  title: "Programs — Rajoria Fitness",
  description:
    "Explore our range of fitness programs — from weight training to yoga, HIIT to boxing.",
};

export default function ProgramsPage() {
  return (
    <>
      <ProgramsClient />
      <LandingFooter />
    </>
  );
}
