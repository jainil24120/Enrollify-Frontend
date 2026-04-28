import React from "react";
import LegalLayout from "./LegalLayout";

const About = () => (
  <LegalLayout title="About Enrollify">
    <p>
      Enrollify is the premium webinar platform built for independent creators, educators,
      and coaches who teach for a living. We help you turn expertise into a revenue engine
      without juggling five different tools.
    </p>

    <h2>Why we built this</h2>
    <p>
      Most creator tools were built for the US market with US payment rails. Indian creators
      paste together Razorpay, Zoom, Google Forms, and a spreadsheet, then waste hours every
      month reconciling enrollments. Enrollify gives you the whole stack on day one:
      enrollment pages, OTP-verified access, Razorpay & Stripe checkout, real-time analytics,
      and WhatsApp delivery.
    </p>

    <h2>What we believe</h2>
    <ul>
      <li><strong>Creators deserve a fair cut.</strong> Transparent platform fees, no hidden charges.</li>
      <li><strong>Setup should take minutes, not weeks.</strong> If a tool needs a tutorial, it&apos;s broken.</li>
      <li><strong>Payments must be reliable.</strong> Money in, money out, every time.</li>
      <li><strong>Support is a feature.</strong> When you need help, you get a human, not a bot.</li>
    </ul>

    <h2>The stack</h2>
    <p>
      Enrollify is built on React, Node.js, and MongoDB. Payments run through Razorpay and
      Stripe. Real-time enrollment delivery uses Socket.io. WhatsApp messaging is powered by
      whatsapp-web.js. We are headquartered in Surat, Gujarat with team members across India.
    </p>

    <h2>Get in touch</h2>
    <p>
      Questions? Partnership ideas? Press? Visit our <a href="/contact">Contact</a> page or
      email <a href="mailto:hello@enrollify.xyz">hello@enrollify.xyz</a>.
    </p>
  </LegalLayout>
);

export default About;
