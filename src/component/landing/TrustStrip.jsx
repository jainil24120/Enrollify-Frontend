import React from "react";
import { motion } from "framer-motion";

// Replaces the previous "live earnings ticker" which used fabricated
// transactions. Everything here is verifiable from the product itself —
// no user counts, no payout totals, no fake names. Honest claims only.
const PILLARS = [
  {
    title: "Razorpay built in",
    sub: "UPI, cards, netbanking. Money lands in your account, not ours.",
    accent: "indigo",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
        <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
      </svg>
    ),
  },
  {
    title: "WhatsApp on autopilot",
    sub: "Class reminders, payment receipts, attendance — sent for you.",
    accent: "green",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    title: "OTP-verified enrollments",
    sub: "Only paying students access your class. Piracy stops at the door.",
    accent: "violet",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
    ),
  },
  {
    title: "Made for India",
    sub: "INR pricing from ₹699/month. GST invoices. No global tax mess.",
    accent: "coral",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3a14 14 0 0 1 0 18" />
        <path d="M12 3a14 14 0 0 0 0 18" />
      </svg>
    ),
  },
];

export default function TrustStrip() {
  return (
    <section className="trust-strip" aria-label="Why Enrollify">
      <div className="trust-strip-inner">
        {PILLARS.map((p, i) => (
          <motion.div
            key={p.title}
            className={`trust-pill trust-${p.accent}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="trust-icon">{p.icon}</div>
            <div className="trust-text">
              <p className="trust-title">{p.title}</p>
              <p className="trust-sub">{p.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
