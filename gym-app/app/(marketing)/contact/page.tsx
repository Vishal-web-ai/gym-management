import ContactClient from "@/components/marketing/ContactClient";
import LandingFooter from "@/components/LandingFooter";

export const metadata = {
  title: "Contact Us — Rajoria Fitness",
  description:
    "Get in touch with Rajoria Fitness. Visit us, call us, or send a message.",
};

export default function ContactPage() {
  return (
    <>
      <ContactClient />
      <LandingFooter />
    </>
  );
}
