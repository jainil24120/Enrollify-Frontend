import React from "react";
import { motion } from "framer-motion";

// Replaces the previous fabricated-testimonial grid. Shows the personas
// Enrollify is BUILT FOR — without claiming any specific person earned
// any specific amount. The job-to-be-done framing is honest and still
// helps a visitor self-identify.

const PERSONAS = [
  {
    icon: "📚",
    title: "Coaching class owners",
    body: "Run JEE, NEET, UPSC, or school batches. Collect monthly fees, mark attendance, send results — all from your phone.",
    accent: "indigo",
  },
  {
    icon: "🧘",
    title: "Yoga & fitness instructors",
    body: "Recurring 6 AM batches with auto WhatsApp reminders. Students show up. Your monthly income is predictable.",
    accent: "coral",
  },
  {
    icon: "🔮",
    title: "Astrologers & consultants",
    body: "Take paid consultations. Auto-issue invoices. Keep client history searchable. No more lost WhatsApp threads.",
    accent: "violet",
  },
  {
    icon: "🎨",
    title: "Workshop & masterclass creators",
    body: "One-off paid sessions, evergreen replays, or live cohorts. OTP-gated so only paying students get access.",
    accent: "indigo",
  },
  {
    icon: "🎓",
    title: "Tutors & subject teachers",
    body: "Class 6-12 tuition, language coaching, exam prep. Parent dashboard built in. Zero spreadsheet work.",
    accent: "coral",
  },
  {
    icon: "👨‍🍳",
    title: "Skill creators",
    body: "Cooking, music, dance, photography, design. Sell single classes or full courses. Share a link, get paid.",
    accent: "violet",
  },
];

export default function BuiltForYou() {
  return (
    <section className="builtfor3" id="built-for-you">
      <div className="sec-head">
        <span className="sec-eyebrow">Built for India&apos;s teachers</span>
        <h2>One platform. Every kind of class.</h2>
        <p className="sec-sub">
          Whatever you teach, Enrollify handles the boring parts — payments, reminders,
          attendance — so you can focus on teaching.
        </p>
      </div>

      <div className="builtfor-grid">
        {PERSONAS.map((p, i) => (
          <motion.article
            key={p.title}
            className={`builtfor-card builtfor-${p.accent}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="builtfor-icon" aria-hidden>{p.icon}</div>
            <h3 className="builtfor-title">{p.title}</h3>
            <p className="builtfor-body">{p.body}</p>
          </motion.article>
        ))}
      </div>

      <div className="builtfor-foot">
        <span className="builtfor-foot-label">We&apos;re launching with our first wave of creators.</span>
        <a className="builtfor-foot-cta" href="/signin">Be a founding creator →</a>
      </div>
    </section>
  );
}
