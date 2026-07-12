import AboutClient from "@/components/marketing/AboutClient";
import LandingFooter from "@/components/LandingFooter";

export const metadata = {
  title: "About Us — Rajoria Fitness",
  description:
    "Learn about Rajoria Fitness — our story, mission, and the team behind your fitness journey.",
};

export default function AboutPage() {
  return (
    <>
      <AboutClient />
      <LandingFooter />
    </>
  );
}
