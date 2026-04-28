import React from "react";
import { motion } from "framer-motion";

// Four-step product walkthrough. Mockups are synthesized from CSS/SVG —
// they show the UI shape, NOT fabricated user data. Numbers and names
// inside the mockups read as placeholders, so nothing on this page can
// be confused with a real customer testimonial.

const STEPS = [
  {
    n: "01",
    label: "Step one",
    title: "Pick what you teach.",
    body: "Yoga, JEE prep, tarot, cooking, fitness — anything. Set up your class page in under 10 minutes. No code. No designer.",
    visual: <SetupMock />,
  },
  {
    n: "02",
    label: "Step two",
    title: "Share your link.",
    body: "Drop it in your WhatsApp status, Instagram bio, or coaching center group. Enrollments flow into your dashboard live.",
    visual: <ShareMock />,
  },
  {
    n: "03",
    label: "Step three",
    title: "Get paid the moment they click.",
    body: "Razorpay built in. Money lands in your account, not ours. We take a flat fee — never a cut of every payment.",
    visual: <PaymentMock />,
  },
  {
    n: "04",
    label: "Step four",
    title: "Build a recurring income.",
    body: "Recurring batches. WhatsApp reminders. Auto attendance. Your students show up. Your earnings compound.",
    visual: <GrowthMock />,
  },
];

export default function CreatorJourney() {
  return (
    <section className="journey3" id="journey">
      <div className="sec-head">
        <span className="sec-eyebrow">How Enrollify works</span>
        <h2>Idea to first paid student in four steps.</h2>
        <p className="sec-sub">
          The product walkthrough — every screen below shows the actual UI shape,
          not a real customer&apos;s data.
        </p>
      </div>

      <ol className="journey-list">
        {STEPS.map((s, i) => (
          <motion.li
            key={s.n}
            className={`journey-item ${i % 2 === 0 ? "j-left" : "j-right"}`}
            // Mount-triggered animation: fires on first paint regardless of
            // scroll position. whileInView misses in tall headless renders
            // (and on tall mobile viewports) and leaves the section blank.
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.12 }}
          >
            <div className="journey-text">
              <div className="journey-step-row">
                <span className="journey-num">{s.n}</span>
                <span className="journey-label">{s.label}</span>
              </div>
              <h3 className="journey-title">{s.title}</h3>
              <p className="journey-body">{s.body}</p>
            </div>
            <div className="journey-visual">{s.visual}</div>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

/* ============ Synthetic mockups ============ */

// Mockup label conventions:
//   - Form field VALUES are shown as outlined placeholder lines, so the
//     user reads them as "this is where YOUR data will be".
//   - Currency amounts are "₹—" or generic labels like "Your price".
//   - No fabricated names or specific numbers anywhere.

function SetupMock() {
  return (
    <div className="mock mock-setup">
      <div className="mock-bar"><span /><span /><span /></div>
      <div className="mock-body">
        <div className="mock-input">
          <span className="mock-label">Class name</span>
          <span className="mock-skeleton-line" style={{ width: "78%" }} />
        </div>
        <div className="mock-input">
          <span className="mock-label">Your price</span>
          <span className="mock-skeleton-line" style={{ width: "40%" }} />
        </div>
        <div className="mock-input">
          <span className="mock-label">Schedule</span>
          <span className="mock-skeleton-line" style={{ width: "62%" }} />
        </div>
        <button className="mock-btn">Publish class</button>
      </div>
    </div>
  );
}

function ShareMock() {
  return (
    <div className="mock mock-share">
      <div className="mock-link-row">
        <span className="mock-link-icon">🔗</span>
        <code>enrollify.in/class/<span className="mock-link-slug">your-class</span></code>
        <span className="mock-link-copy">Copy</span>
      </div>
      <div className="mock-channels">
        <span className="mock-chan whatsapp">WhatsApp</span>
        <span className="mock-chan instagram">Instagram</span>
        <span className="mock-chan email">Email</span>
        <span className="mock-chan sms">SMS</span>
      </div>
      <motion.div
        className="mock-arrival"
        animate={{ y: [10, 0, 0, -10], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="mock-dot" /> New enrollment received
      </motion.div>
    </div>
  );
}

function PaymentMock() {
  return (
    <div className="mock mock-payment">
      <div className="mock-pay-card">
        <div className="mock-pay-row">
          <span>Amount received</span>
          <strong>Your price</strong>
        </div>
        <div className="mock-pay-row mock-pay-row-sub">
          <span>Settled to your bank in 24 hours</span>
          <span className="mock-pay-status">RAZORPAY</span>
        </div>
      </div>
      <div className="mock-pay-bal">
        <span className="mock-pay-label">Where the money goes</span>
        <span className="mock-pay-balance-text">Direct to your account</span>
      </div>
    </div>
  );
}

function GrowthMock() {
  // Illustrative shape only — labelled as such in the mock so it reads as
  // a generic "growth chart" pattern, not a specific creator's revenue.
  const points = [12, 18, 24, 32, 41, 55, 68, 82, 96, 112, 125, 142];
  const max = Math.max(...points);
  const w = 240, h = 110, pad = 6;
  const stepX = (w - pad * 2) / (points.length - 1);
  const path = points
    .map((p, i) => {
      const x = pad + i * stepX;
      const y = h - pad - (p / max) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="mock mock-growth">
      <div className="mock-growth-head">
        <div>
          <span className="mock-growth-label">Recurring income</span>
          <span className="mock-growth-illustrative">Illustrative pattern</span>
        </div>
        <span className="mock-growth-arrow">↗</span>
      </div>
      <svg className="mock-growth-chart" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="growthStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#F97365" />
          </linearGradient>
        </defs>
        <path d={`${path} L ${w - 6} ${h - 6} L 6 ${h - 6} Z`} fill="url(#growthFill)" />
        <path d={path} fill="none" stroke="url(#growthStroke)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => {
          const x = pad + i * stepX;
          const y = h - pad - (p / max) * (h - pad * 2);
          return <circle key={i} cx={x} cy={y} r={i === points.length - 1 ? 4 : 0} fill="#F97365" />;
        })}
      </svg>
    </div>
  );
}
