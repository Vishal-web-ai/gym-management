"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
} from "lucide-react";
import MarketingHero from "./MarketingHero";

const ease = [0.23, 1, 0.32, 1] as const;

const contactInfo = [
  {
    icon: Phone,
    label: "Phone",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
  },
  {
    icon: Mail,
    label: "Email",
    value: "info@rajoriafitness.com",
    href: "mailto:info@rajoriafitness.com",
  },
  {
    icon: MapPin,
    label: "Address",
    value: "123 Fitness Street, Gym District, City, State 560001",
    href: "https://maps.google.com",
  },
];

const hours = [
  { day: "Monday — Friday", time: "6:00 AM — 10:00 PM" },
  { day: "Saturday", time: "6:00 AM — 10:00 PM" },
  { day: "Sunday", time: "7:00 AM — 2:00 PM" },
];

function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-8 md:p-10 text-center"
      >
        <div className="h-16 w-16 rounded-full bg-[#ff6a00]/10 flex items-center justify-center mx-auto mb-6">
          <Send className="h-7 w-7 text-[#ff6a00]" />
        </div>
        <h3
          className="text-2xl font-bold uppercase text-white"
          style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
        >
          MESSAGE SENT!
        </h3>
        <p
          className="mt-3 text-[14px] text-white/45 leading-relaxed max-w-[360px] mx-auto"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          Thank you for reaching out. We&apos;ll get back to you within 24
          hours.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
          }}
          className="mt-6 inline-flex items-center justify-center h-[44px] px-6 rounded-xl border border-white/15 text-sm font-bold uppercase tracking-wide text-white/60 transition-all duration-200 hover:bg-white/5 hover:border-white/25 hover:text-white"
        >
          Send Another Message
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 md:p-8 flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[12px] font-bold uppercase tracking-wider text-white/40 mb-2" style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}>
            Full Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            placeholder="John Doe"
            className="w-full h-[48px] px-4 rounded-xl bg-white/5 border border-white/10 text-[14px] text-white/80 placeholder:text-white/20 outline-none transition-all duration-200 focus:border-[#ff6a00]/40 focus:ring-2 focus:ring-[#ff6a00]/10"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          />
        </div>
        <div>
          <label className="block text-[12px] font-bold uppercase tracking-wider text-white/40 mb-2" style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}>
            Email
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
            placeholder="john@example.com"
            className="w-full h-[48px] px-4 rounded-xl bg-white/5 border border-white/10 text-[14px] text-white/80 placeholder:text-white/20 outline-none transition-all duration-200 focus:border-[#ff6a00]/40 focus:ring-2 focus:ring-[#ff6a00]/10"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[12px] font-bold uppercase tracking-wider text-white/40 mb-2" style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}>
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
            placeholder="+91 98765 43210"
            className="w-full h-[48px] px-4 rounded-xl bg-white/5 border border-white/10 text-[14px] text-white/80 placeholder:text-white/20 outline-none transition-all duration-200 focus:border-[#ff6a00]/40 focus:ring-2 focus:ring-[#ff6a00]/10"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          />
        </div>
        <div>
          <label className="block text-[12px] font-bold uppercase tracking-wider text-white/40 mb-2" style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}>
            Subject
          </label>
          <select
            value={formData.subject}
            onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
            required
            className="w-full h-[48px] px-4 rounded-xl bg-white/5 border border-white/10 text-[14px] text-white/80 outline-none transition-all duration-200 focus:border-[#ff6a00]/40 focus:ring-2 focus:ring-[#ff6a00]/10"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            <option value="" disabled>Select a topic</option>
            <option value="membership">Membership Inquiry</option>
            <option value="trial">Free Trial</option>
            <option value="personal-training">Personal Training</option>
            <option value="group-classes">Group Classes</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[12px] font-bold uppercase tracking-wider text-white/40 mb-2" style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}>
          Message
        </label>
        <textarea
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
          placeholder="Tell us how we can help you..."
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[14px] text-white/80 placeholder:text-white/20 outline-none transition-all duration-200 focus:border-[#ff6a00]/40 focus:ring-2 focus:ring-[#ff6a00]/10 resize-none"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        />
      </div>

      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 h-[52px] rounded-xl bg-[#ff6a00] text-sm font-bold uppercase tracking-wide text-white transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg hover:shadow-[#ff6a00]/25"
      >
        <Send className="h-4 w-4" />
        SEND MESSAGE
      </button>
    </form>
  );
}

function ContactDetailsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="relative w-full py-12 md:py-16 px-5 md:px-10">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12">
          {/* Form — 3 cols */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <h2
              className="text-[clamp(24px,4vw,36px)] font-black uppercase text-white leading-tight mb-2"
              style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
            >
              SEND US A <span className="text-[#ff6a00]">MESSAGE</span>
            </h2>
            <p
              className="text-[14px] text-white/40 mb-8"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              Fill out the form and we&apos;ll get back to you within 24 hours.
            </p>
            <ContactForm />
          </motion.div>

          {/* Info — 2 cols */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease, delay: 0.2 }}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            {/* Contact info cards */}
            {contactInfo.map((info) => {
              const Icon = info.icon;
              return (
                <a
                  key={info.label}
                  href={info.href}
                  target={info.label === "Address" ? "_blank" : undefined}
                  rel={info.label === "Address" ? "noopener noreferrer" : undefined}
                  className="glass-card rounded-xl p-5 flex items-start gap-4 group transition-all duration-200 hover:border-[#ff6a00]/20"
                >
                  <div className="h-10 w-10 rounded-xl bg-[#ff6a00]/10 flex items-center justify-center shrink-0 group-hover:bg-[#ff6a00]/20 transition-colors">
                    <Icon className="h-5 w-5 text-[#ff6a00]" />
                  </div>
                  <div>
                    <p
                      className="text-[11px] font-bold uppercase tracking-wider text-white/30 mb-1"
                      style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
                    >
                      {info.label}
                    </p>
                    <p className="text-[14px] text-white/60 leading-relaxed">
                      {info.value}
                    </p>
                  </div>
                </a>
              );
            })}

            {/* Hours */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-[#ff6a00]/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-[#ff6a00]" />
                </div>
                <p
                  className="text-[11px] font-bold uppercase tracking-wider text-white/30"
                  style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
                >
                  Gym Hours
                </p>
              </div>
              <div className="flex flex-col gap-2.5">
                {hours.map((h) => (
                  <div key={h.day} className="flex justify-between gap-4">
                    <span className="text-[13px] text-white/40">{h.day}</span>
                    <span className="text-[13px] text-white/60 font-medium">
                      {h.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp quick link */}
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card rounded-xl p-5 flex items-center gap-4 group transition-all duration-200 hover:border-green-500/20"
            >
              <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 group-hover:bg-green-500/20 transition-colors">
                <MessageCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p
                  className="text-[11px] font-bold uppercase tracking-wider text-white/30 mb-1"
                  style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
                >
                  WhatsApp Us
                </p>
                <p className="text-[14px] text-white/60">
                  Quick response for urgent queries
                </p>
              </div>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function MapSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="relative w-full py-12 md:py-16 px-5 md:px-10">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease }}
          className="text-center mb-8"
        >
          <h2
            className="text-[clamp(24px,4vw,36px)] font-black uppercase text-white leading-tight"
            style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
          >
            FIND <span className="text-[#ff6a00]">US</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease, delay: 0.15 }}
          className="rounded-2xl overflow-hidden border border-white/10 aspect-[16/7] w-full"
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.5!2d77.5!3d12.97!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzEyLjAiTiA3N8KwMzAnMDAuMCJF!5e0!3m2!1sen!2sin!4v1700000000000"
            width="100%"
            height="100%"
            style={{ border: 0, filter: "invert(0.9) hue-rotate(180deg) brightness(0.8) contrast(1.2)" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Rajoria Fitness location"
          />
        </motion.div>
      </div>
    </section>
  );
}

export default function ContactClient() {
  return (
    <>
      <MarketingHero
        title="GET IN"
        highlight="TOUCH"
        subtitle="Have questions? We'd love to hear from you. Reach out and let's start your fitness journey."
      />
      <ContactDetailsSection />
      <MapSection />
    </>
  );
}
