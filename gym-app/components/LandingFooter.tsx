"use client";

import { Phone, Mail, MapPin } from "lucide-react";
import Link from "next/link";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Pricing", href: "/pricing" },
  { label: "Trainers", href: "/trainers" },
  { label: "Contact", href: "/contact" },
];

const hours = [
  { day: "Mon - Fri", time: "6:00 AM — 10:00 PM" },
  { day: "Saturday", time: "6:00 AM — 10:00 PM" },
  { day: "Sunday", time: "7:00 AM — 2:00 PM" },
];

function InstagramIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

const socials = [
  { icon: InstagramIcon, href: "#", label: "Instagram" },
  { icon: FacebookIcon, href: "#", label: "Facebook" },
  { icon: YoutubeIcon, href: "#", label: "YouTube" },
];

export default function LandingFooter() {
  return (
    <footer className="relative w-full border-t border-white/5">
      {/* Top gradient accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,106,0,0.3), transparent)",
        }}
      />

      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* Logo + tagline */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block">
              <img
                src="/logo/logo-transparent.png"
                alt="Rajoria Fitness"
                className="h-10 w-auto"
              />
            </Link>
            <p className="mt-4 text-[13px] text-white/35 leading-relaxed max-w-[260px]">
              Transform your body, transform your life. World-class facilities and expert guidance.
            </p>

            {/* Social icons */}
            <div className="flex gap-3 mt-5">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <Link
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="h-9 w-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-white/30 transition-all duration-200 hover:bg-[#ff6a00]/10 hover:border-[#ff6a00]/20 hover:text-[#ff6a00]"
                  >
                    <Icon />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-wider text-white/50 mb-4"
              style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
            >
              Quick Links
            </h4>
            <ul className="flex flex-col gap-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-white/40 transition-colors duration-200 hover:text-[#ff6a00]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-wider text-white/50 mb-4"
              style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
            >
              Gym Hours
            </h4>
            <ul className="flex flex-col gap-2.5">
              {hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-4">
                  <span className="text-[14px] text-white/40">{h.day}</span>
                  <span className="text-[14px] text-white/60 font-medium">{h.time}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-wider text-white/50 mb-4"
              style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
            >
              Contact Us
            </h4>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 mt-0.5 text-[#ff6a00]/50 shrink-0" />
                <span className="text-[14px] text-white/40">+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 mt-0.5 text-[#ff6a00]/50 shrink-0" />
                <span className="text-[14px] text-white/40">info@rajoriafitness.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 text-[#ff6a00]/50 shrink-0" />
                <span className="text-[14px] text-white/40 leading-relaxed">
                  123 Fitness Street, Gym District<br />
                  City, State 560001
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-white/20">
            &copy; {new Date().getFullYear()} Rajoria Fitness. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-[12px] text-white/20 hover:text-white/40 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-[12px] text-white/20 hover:text-white/40 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
