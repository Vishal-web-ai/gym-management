import TrainersClient from "@/components/marketing/TrainersClient";
import LandingFooter from "@/components/LandingFooter";

export const metadata = {
  title: "Trainers — Rajoria Fitness",
  description:
    "Meet our certified fitness trainers and find the perfect coach for your fitness journey.",
};

export default function TrainersPage() {
  return (
    <>
      <TrainersClient />
      <LandingFooter />
    </>
  );
}
