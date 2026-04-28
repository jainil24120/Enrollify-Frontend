import React from "react";
import LegalLayout from "./LegalLayout";

const Careers = () => (
  <LegalLayout title="Careers at Enrollify">
    <p>
      We&apos;re a small team building the payment and webinar stack Indian creators have
      been waiting for. If you like shipping fast, owning the work end-to-end, and talking
      to real customers, you&apos;ll feel at home here.
    </p>

    <h2>How we work</h2>
    <ul>
      <li><strong>Remote-first</strong> across India, with optional Surat HQ days.</li>
      <li><strong>Async by default.</strong> Long-form writing &gt; Slack noise.</li>
      <li><strong>Ship weekly.</strong> Every team member ships customer-visible work each week.</li>
      <li><strong>No bureaucracy.</strong> Decisions over consensus, prototypes over decks.</li>
    </ul>

    <h2>Open roles</h2>
    <div className="info-card">
      <p>
        We&apos;re not actively hiring right now, but we love meeting people whose values fit.
        If you&apos;re strong in <strong>full-stack JavaScript</strong>, <strong>product design</strong>,
        or <strong>creator-economy growth</strong>, send a short note and a link to something
        you&apos;ve shipped to <a href="mailto:careers@enrollify.xyz">careers@enrollify.xyz</a>.
      </p>
    </div>

    <h2>What we look for</h2>
    <ul>
      <li>Taste. You can tell a good product from a bad one and articulate why.</li>
      <li>Ownership. You ship to production, watch metrics, and iterate.</li>
      <li>Customer empathy. You&apos;d rather talk to a creator for 30 minutes than read a brief.</li>
      <li>Communication. You write clearly. Code, docs, and emails alike.</li>
    </ul>

    <p>Not what we look for: years of experience for its own sake, or fancy logos on a CV.</p>
  </LegalLayout>
);

export default Careers;
